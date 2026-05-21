const API = '/api';
let token = localStorage.getItem('sf_token');
let currentUser = JSON.parse(localStorage.getItem('sf_user') || 'null');
let currentPage = 'dashboard';

async function doLogin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const err = document.getElementById('login-error');
  err.style.display = 'none';
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
    token = data.token;
    currentUser = data.user;
    localStorage.setItem('sf_token', token);
    localStorage.setItem('sf_user', JSON.stringify(currentUser));
    initApp();
  } catch (e) {
    err.textContent = e.message;
    err.style.display = 'block';
  }
}

function doLogout() {
  token = null;
  currentUser = null;
  localStorage.removeItem('sf_token');
  localStorage.removeItem('sf_user');
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('sidebar').style.display = 'none';
  document.getElementById('main').style.display = 'none';
}

function initApp() {
  if (!token) return;
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('sidebar').style.display = 'flex';
  document.getElementById('main').style.display = 'flex';
  const initials = currentUser
    ? (currentUser.first_name[0] + (currentUser.last_name || '')[0]).toUpperCase()
    : 'U';
  document.getElementById('user-avatar').textContent = initials;
  document.getElementById('user-name').textContent = `${currentUser.first_name} ${currentUser.last_name}`;
  document.getElementById('user-role').textContent = currentUser.role || 'usuario';
  navigate('dashboard');
}


async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(opts.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error de servidor');
  return data;
}


function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `show ${type}`;
  setTimeout(() => t.className = '', 3000);
}

function openModal(title, body, actions) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal-actions').innerHTML = actions;
  document.getElementById('modal-overlay').classList.add('open');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

function navigate(page) {
  currentPage = page;
  const titles = {
    dashboard: ['Inicio', 'Resumen general del sistema'],
    teachers: ['Docentes', 'Gestión de docentes'],
    students: ['Estudiantes', 'Gestión de estudiantes'],
    departments: ['Departamentos', 'Gestión de departamentos'],
    subjects: ['Materias', 'Gestión de materias'],
    courses: ['Cursos', 'Gestión de cursos'],
    programs: ['Programas Académicos', 'Gestión de programas'],
    schedules: ['Horarios', 'Gestión de horarios de clases'],
    availability: ['Disponibilidad Docente', 'Franjas horarias disponibles'],
    periods: ['Periodos Académicos', 'Gestión de periodos'],
    enrollments: ['Matrículas', 'Gestión de matrículas'],
    conflicts: ['Conflictos', 'Conflictos de horario detectados'],
  };
  const [title, sub] = titles[page] || ['', ''];
  document.getElementById('page-title').textContent = title;
  document.getElementById('page-subtitle').textContent = sub;

  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('onclick') === `navigate('${page}')`);
  });

  document.getElementById('topbar-actions').innerHTML = '';

  const renders = {
    dashboard, teachers: renderTeachers, students: renderStudents,
    departments: renderDepartments, subjects: renderSubjects,
    courses: renderCourses, programs: renderPrograms,
    schedules: renderSchedules, availability: renderAvailability,
    periods: renderPeriods, enrollments: renderEnrollments,
    conflicts: renderConflicts
  };
  if (renders[page]) renders[page]();
}

let _allRows = [], _currentData = [], _cols = [];
let _editFnG = null, _deleteFnG = null, _extraBtn = null, _addFn = null;
let _parseFormFn = null;
function parseForm() { return _parseFormFn ? _parseFormFn() : {}; }

function fv(id) { return document.getElementById(id)?.value || ''; }

const svgPlus = `<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`;

function handleEdit(i) { if (_editFnG) _editFnG(_currentData[i]); }
function handleDelete(i) { if (_deleteFnG) _deleteFnG(_currentData[i]); }
function handleAdd() { if (_addFn) _addFn(); }

function renderTable(cols, rows, onEdit, onDelete, extraBtn) {
  if (!rows.length) return `
    <div class="empty-state">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
      </svg>
      <p>Sin registros</p>
    </div>`;

  const headers = cols.map(c => `<th>${c.label}</th>`).join('') + '<th>Acciones</th>';
  const rowsHtml = rows.map((r, i) => {
    const cells = cols.map(c => {
      let val = r[c.key] ?? '—';
      if (c.badge) val = `<span class="badge ${c.badge(r)}">${val}</span>`;
      return `<td>${val}</td>`;
    }).join('');
    const extra = extraBtn
      ? `<button class="btn-icon" title="${extraBtn.label}" onclick='${extraBtn.fn}(${JSON.stringify(r)})'>${extraBtn.icon}</button>`
      : '';
    return `<tr>
      ${cells}
      <td><div class="actions">
        ${onEdit ? `<button class="btn-icon edit" title="Editar"    onclick="handleEdit(${i})"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>` : ''}
        ${onDelete ? `<button class="btn-icon del"  title="Eliminar"  onclick="handleDelete(${i})"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>` : ''}
        ${extra}
      </div></td>
    </tr>`;
  }).join('');
  return `<table><thead><tr>${headers}</tr></thead><tbody>${rowsHtml}</tbody></table>`;
}

function filterTable(q) {
  const filtered = _allRows.filter(r =>
    JSON.stringify(Object.values(r)).toLowerCase().includes(q.toLowerCase())
  );
  _currentData = filtered;
  document.querySelector('.table-wrapper').innerHTML =
    `<div class="table-header">
       <span style="font-size:13px;color:var(--text-muted)">${filtered.length} registros</span>
       <input placeholder="Buscar..." oninput="filterTable(this.value)" value="${q}" />
     </div>` + renderTable(_cols, filtered, _editFnG, _deleteFnG, _extraBtn);
}

function tableWrapper(innerHtml, count) {
  return `
    <div class="table-wrapper">
      <div class="table-header">
        <span style="font-size:13px;color:var(--text-muted)">${count} registros</span>
        <input placeholder="Buscar..." oninput="filterTable(this.value)" />
      </div>
      ${innerHtml}
    </div>`;
}

async function doCreate(endpoint, body) {
  try {
    await api(endpoint, { method: 'POST', body: JSON.stringify(body) });
    closeModal(); toast('Creado correctamente'); navigate(currentPage);
  } catch (e) { toast(e.message, 'error'); }
}
async function doUpdate(endpoint, id, body) {
  try {
    await api(`${endpoint}/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    closeModal(); toast('Actualizado'); navigate(currentPage);
  } catch (e) { toast(e.message, 'error'); }
}
async function doDelete(endpoint, id) {
  try {
    await api(`${endpoint}/${id}`, { method: 'DELETE' });
    closeModal(); toast('Eliminado'); navigate(currentPage);
  } catch (e) { toast(e.message, 'error'); }
}

async function genericPage({ endpoint, cols, buildForm, parseForm: parseFn, addTitle, editTitle }) {
  document.getElementById('content').innerHTML = '<div class="loading">Cargando...</div>';
  try {
    const rows = await api(endpoint);
    _allRows = rows; _currentData = rows; _cols = cols; _extraBtn = null; _parseFormFn = parseFn;

    _editFnG = r => openModal(editTitle, buildForm(r),
      `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="doUpdate('${endpoint}','${r.id}',parseForm())">Guardar</button>`
    );
    _deleteFnG = r => openModal('Confirmar eliminación',
      `<p style="color:var(--text-muted);font-size:14px">¿Eliminar este registro? Esta acción no se puede deshacer.</p>`,
      `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-danger" onclick="doDelete('${endpoint}','${r.id}')">Eliminar</button>`
    );
    _addFn = () => openModal(addTitle, buildForm(null),
      `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="doCreate('${endpoint}',parseForm())">Crear</button>`
    );

    document.getElementById('topbar-actions').innerHTML =
      `<button class="btn btn-primary" onclick="handleAdd()">${svgPlus} Agregar</button>`;
    document.getElementById('content').innerHTML =
      tableWrapper(renderTable(cols, rows, _editFnG, _deleteFnG, null), rows.length);
  } catch (e) {
    document.getElementById('content').innerHTML =
      `<div class="empty-state"><p style="color:var(--danger)">${e.message}</p></div>`;
  }
}

async function dashboard() {
  document.getElementById('content').innerHTML = '<div class="loading">Cargando estadísticas...</div>';
  try {
    const [teachers, students, schedules, conflicts] = await Promise.all([
      api('/teachers'), api('/students'), api('/schedules'), api('/conflicts')
    ]);
    const modules = [
      { page: 'teachers', icon: '👨‍🏫', color: '#6c63ff', label: 'Docentes', desc: 'Gestiona el personal docente' },
      { page: 'students', icon: '🎓', color: '#ff6584', label: 'Estudiantes', desc: 'Administra estudiantes' },
      { page: 'schedules', icon: '📅', color: '#43e97b', label: 'Horarios', desc: 'Visualiza y crea horarios' },
      { page: 'departments', icon: '🏛️', color: '#ffa502', label: 'Departamentos', desc: 'Organización académica' },
      { page: 'subjects', icon: '📚', color: '#6c63ff', label: 'Materias', desc: 'Asignaturas disponibles' },
      { page: 'courses', icon: '📋', color: '#ff6584', label: 'Cursos', desc: 'Cursos activos' },
      { page: 'periods', icon: '🗓️', color: '#43e97b', label: 'Periodos', desc: 'Periodos académicos' },
      { page: 'availability', icon: '⏰', color: '#ffa502', label: 'Disponibilidad', desc: 'Franjas de docentes' },
      { page: 'enrollments', icon: '📝', color: '#6c63ff', label: 'Matrículas', desc: 'Inscripciones de cursos' },
      { page: 'conflicts', icon: '⚠️', color: '#ff4757', label: 'Conflictos', desc: 'Conflictos detectados' },
    ];
    document.getElementById('content').innerHTML = `
      <div class="stats-grid">
        <div class="stat-card c1"><div class="stat-number">${teachers.length}</div><div class="stat-label">Docentes</div></div>
        <div class="stat-card c2"><div class="stat-number">${students.length}</div><div class="stat-label">Estudiantes</div></div>
        <div class="stat-card c3"><div class="stat-number">${schedules.length}</div><div class="stat-label">Horarios</div></div>
        <div class="stat-card c4"><div class="stat-number">${conflicts.length}</div><div class="stat-label">Conflictos</div></div>
      </div>
      <div style="font-family:'Syne',sans-serif;font-size:15px;font-weight:700;margin-bottom:4px">Módulos del sistema</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px">Accede rápidamente a cualquier sección</div>
      <div class="dash-modules">
        ${modules.map(m => `
          <div class="module-card" onclick="navigate('${m.page}')">
            <div class="module-icon" style="background:${m.color}22">
              <span style="font-size:20px">${m.icon}</span>
            </div>
            <div>
              <div class="module-name">${m.label}</div>
              <div class="module-desc">${m.desc}</div>
            </div>
          </div>`).join('')}
      </div>`;
  } catch (e) {
    document.getElementById('content').innerHTML =
      `<div class="empty-state"><p style="color:var(--danger)">${e.message}</p></div>`;
  }
}

function renderTeachers() {
  genericPage({
    endpoint: '/teachers',
    cols: [
      { key: 'first_name', label: 'Nombre' },
      { key: 'last_name', label: 'Apellido' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Teléfono' },
      { key: 'active', label: 'Estado', badge: r => r.active ? 'badge-active' : 'badge-inactive' },
    ],
    buildForm: r => `
      <div class="form-group"><label>Nombre</label><input id="f_fn" value="${r?.first_name || ''}" /></div>
      <div class="form-group"><label>Apellido</label><input id="f_ln" value="${r?.last_name || ''}" /></div>
      <div class="form-group"><label>Email</label><input id="f_em" type="email" value="${r?.email || ''}" /></div>
      <div class="form-group"><label>Teléfono</label><input id="f_ph" value="${r?.phone || ''}" /></div>`,
    parseForm: () => ({ first_name: fv('f_fn'), last_name: fv('f_ln'), email: fv('f_em'), phone: fv('f_ph') }),
    addTitle: 'Nuevo Docente', editTitle: 'Editar Docente'
  });
}

function renderStudents() {
  genericPage({
    endpoint: '/students',
    cols: [
      { key: 'first_name', label: 'Nombre' },
      { key: 'last_name', label: 'Apellido' },
      { key: 'email', label: 'Email' },
      { key: 'student_code', label: 'Código' },
      { key: 'active', label: 'Estado', badge: r => r.active ? 'badge-active' : 'badge-inactive' },
    ],
    buildForm: r => `
      <div class="form-group"><label>Nombre</label><input id="f_fn" value="${r?.first_name || ''}" /></div>
      <div class="form-group"><label>Apellido</label><input id="f_ln" value="${r?.last_name || ''}" /></div>
      <div class="form-group"><label>Email</label><input id="f_em" type="email" value="${r?.email || ''}" /></div>
      <div class="form-group"><label>Código estudiantil</label><input id="f_sc" value="${r?.student_code || ''}" /></div>`,
    parseForm: () => ({ first_name: fv('f_fn'), last_name: fv('f_ln'), email: fv('f_em'), student_code: fv('f_sc') }),
    addTitle: 'Nuevo Estudiante', editTitle: 'Editar Estudiante'
  });
}

function renderDepartments() {
  genericPage({
    endpoint: '/departments',
    cols: [
      { key: 'name', label: 'Nombre' },
      { key: 'description', label: 'Descripción' },
      { key: 'active', label: 'Estado', badge: r => r.active ? 'badge-active' : 'badge-inactive' },
    ],
    buildForm: r => `
      <div class="form-group"><label>Nombre</label><input id="f_nm" value="${r?.name || ''}" /></div>
      <div class="form-group"><label>Descripción</label><textarea id="f_ds">${r?.description || ''}</textarea></div>`,
    parseForm: () => ({ name: fv('f_nm'), description: fv('f_ds') }),
    addTitle: 'Nuevo Departamento', editTitle: 'Editar Departamento'
  });
}

function renderSubjects() {
  genericPage({
    endpoint: '/subjects',
    cols: [
      { key: 'name', label: 'Nombre' },
      { key: 'code', label: 'Código' },
      { key: 'credits', label: 'Créditos' },
      { key: 'active', label: 'Estado', badge: r => r.active ? 'badge-active' : 'badge-inactive' },
    ],
    buildForm: r => `
      <div class="form-group"><label>Nombre</label><input id="f_nm" value="${r?.name || ''}" /></div>
      <div class="form-group"><label>Código</label><input id="f_cd" value="${r?.code || ''}" /></div>
      <div class="form-group"><label>Créditos</label><input id="f_cr" type="number" value="${r?.credits || ''}" /></div>`,
    parseForm: () => ({ name: fv('f_nm'), code: fv('f_cd'), credits: parseInt(fv('f_cr')) }),
    addTitle: 'Nueva Materia', editTitle: 'Editar Materia'
  });
}

function renderCourses() {
  genericPage({
    endpoint: '/courses',
    cols: [
      { key: 'name', label: 'Nombre' },
      { key: 'code', label: 'Código' },
      { key: 'semester', label: 'Semestre' },
      { key: 'active', label: 'Estado', badge: r => r.active ? 'badge-active' : 'badge-inactive' },
    ],
    buildForm: r => `
      <div class="form-group"><label>Nombre</label><input id="f_nm" value="${r?.name || ''}" /></div>
      <div class="form-group"><label>Código</label><input id="f_cd" value="${r?.code || ''}" /></div>
      <div class="form-group"><label>Semestre</label><input id="f_sm" value="${r?.semester || ''}" /></div>`,
    parseForm: () => ({ name: fv('f_nm'), code: fv('f_cd'), semester: fv('f_sm') }),
    addTitle: 'Nuevo Curso', editTitle: 'Editar Curso'
  });
}

function renderPrograms() {
  genericPage({
    endpoint: '/academic-programs',
    cols: [
      { key: 'name', label: 'Nombre' },
      { key: 'code', label: 'Código' },
      { key: 'duration_semesters', label: 'Duración (sem)' },
      { key: 'active', label: 'Estado', badge: r => r.active ? 'badge-active' : 'badge-inactive' },
    ],
    buildForm: r => `
      <div class="form-group"><label>Nombre</label><input id="f_nm" value="${r?.name || ''}" /></div>
      <div class="form-group"><label>Código</label><input id="f_cd" value="${r?.code || ''}" /></div>
      <div class="form-group"><label>Duración (semestres)</label><input id="f_dur" type="number" value="${r?.duration_semesters || ''}" /></div>`,
    parseForm: () => ({ name: fv('f_nm'), code: fv('f_cd'), duration_semesters: parseInt(fv('f_dur')) }),
    addTitle: 'Nuevo Programa', editTitle: 'Editar Programa'
  });
}

function renderPeriods() {
  genericPage({
    endpoint: '/periods',
    cols: [
      { key: 'name', label: 'Nombre' },
      { key: 'start_date', label: 'Inicio' },
      { key: 'end_date', label: 'Fin' },
      { key: 'active', label: 'Estado', badge: r => r.active ? 'badge-active' : 'badge-inactive' },
    ],
    buildForm: r => `
      <div class="form-group"><label>Nombre</label><input id="f_nm" value="${r?.name || ''}" /></div>
      <div class="form-group"><label>Fecha inicio</label><input id="f_sd" type="date" value="${r?.start_date?.slice(0, 10) || ''}" /></div>
      <div class="form-group"><label>Fecha fin</label><input id="f_ed" type="date" value="${r?.end_date?.slice(0, 10) || ''}" /></div>`,
    parseForm: () => ({ name: fv('f_nm'), start_date: fv('f_sd'), end_date: fv('f_ed') }),
    addTitle: 'Nuevo Periodo', editTitle: 'Editar Periodo'
  });
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAYS_EN = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

async function renderSchedules() {
  document.getElementById('content').innerHTML = '<div class="loading">Cargando...</div>';
  try {
    const [schedules, teachers] = await Promise.all([api('/schedules'), api('/teachers')]);
    _allRows = schedules; _currentData = schedules; _extraBtn = null;
    _cols = [
      { key: 'teacher_id', label: 'Docente ID' },
      { key: 'day_of_week', label: 'Día' },
      { key: 'start_time', label: 'Inicio' },
      { key: 'end_time', label: 'Fin' },
      { key: 'classroom', label: 'Aula' },
    ];
    _editFnG = r => openModal('Editar Horario', buildScheduleForm(r, teachers),
      `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="doUpdate('/schedules','${r.id}',parseScheduleForm())">Guardar</button>`);
    _deleteFnG = r => openModal('Confirmar',
      `<p style="color:var(--text-muted);font-size:14px">¿Eliminar este horario?</p>`,
      `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-danger" onclick="doDelete('/schedules','${r.id}')">Eliminar</button>`);
    _addFn = () => openModal('Nuevo Horario', buildScheduleForm(null, teachers),
      `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="doCreate('/schedules',parseScheduleForm())">Crear</button>`);
    document.getElementById('topbar-actions').innerHTML =
      `<button class="btn btn-primary" onclick="handleAdd()">${svgPlus} Agregar</button>`;
    document.getElementById('content').innerHTML =
      tableWrapper(renderTable(_cols, schedules, _editFnG, _deleteFnG, null), schedules.length);
  } catch (e) {
    document.getElementById('content').innerHTML =
      `<div class="empty-state"><p style="color:var(--danger)">${e.message}</p></div>`;
  }
}

function buildScheduleForm(r, teachers) {
  const tOpts = teachers.map(t => `<option value="${t.id}" ${r?.teacher_id === t.id ? 'selected' : ''}>${t.first_name} ${t.last_name}</option>`).join('');
  const dayOpts = DAYS_EN.map((d, i) => `<option value="${d}" ${r?.day_of_week === d ? 'selected' : ''}>${DAYS[i]}</option>`).join('');
  return `
    <div class="form-group"><label>Docente</label><select id="f_tc"><option value="">Seleccionar...</option>${tOpts}</select></div>
    <div class="form-group"><label>Día</label><select id="f_dw"><option value="">Seleccionar...</option>${dayOpts}</select></div>
    <div class="form-group"><label>Hora inicio</label><input id="f_st" type="time" value="${r?.start_time || ''}" /></div>
    <div class="form-group"><label>Hora fin</label><input id="f_et" type="time" value="${r?.end_time || ''}" /></div>
    <div class="form-group"><label>Aula</label><input id="f_cl" value="${r?.classroom || ''}" /></div>`;
}
function parseScheduleForm() {
  return { teacher_id: fv('f_tc'), day_of_week: fv('f_dw'), start_time: fv('f_st'), end_time: fv('f_et'), classroom: fv('f_cl') };
}

async function renderAvailability() {
  document.getElementById('content').innerHTML = '<div class="loading">Cargando...</div>';
  try {
    const [avail, teachers] = await Promise.all([api('/availability'), api('/teachers')]);
    _allRows = avail; _currentData = avail; _extraBtn = null;
    _cols = [
      { key: 'teacher_id', label: 'Docente ID' },
      { key: 'day_of_week', label: 'Día' },
      { key: 'start_time', label: 'Inicio' },
      { key: 'end_time', label: 'Fin' },
    ];
    _editFnG = r => openModal('Editar Disponibilidad', buildAvailForm(r, teachers),
      `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="doUpdate('/availability','${r.id}',parseAvailForm())">Guardar</button>`);
    _deleteFnG = r => openModal('Confirmar',
      `<p style="color:var(--text-muted);font-size:14px">¿Eliminar disponibilidad?</p>`,
      `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-danger" onclick="doDelete('/availability','${r.id}')">Eliminar</button>`);
    _addFn = () => openModal('Nueva Disponibilidad', buildAvailForm(null, teachers),
      `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="doCreate('/availability',parseAvailForm())">Crear</button>`);
    document.getElementById('topbar-actions').innerHTML =
      `<button class="btn btn-primary" onclick="handleAdd()">${svgPlus} Agregar</button>`;
    document.getElementById('content').innerHTML =
      tableWrapper(renderTable(_cols, avail, _editFnG, _deleteFnG, null), avail.length);
  } catch (e) {
    document.getElementById('content').innerHTML =
      `<div class="empty-state"><p style="color:var(--danger)">${e.message}</p></div>`;
  }
}

function buildAvailForm(r, teachers) {
  const tOpts = teachers.map(t => `<option value="${t.id}" ${r?.teacher_id === t.id ? 'selected' : ''}>${t.first_name} ${t.last_name}</option>`).join('');
  const dayOpts = DAYS_EN.map((d, i) => `<option value="${d}" ${r?.day_of_week === d ? 'selected' : ''}>${DAYS[i]}</option>`).join('');
  return `
    <div class="form-group"><label>Docente</label><select id="f_tc"><option value="">Seleccionar...</option>${tOpts}</select></div>
    <div class="form-group"><label>Día</label><select id="f_dw">${dayOpts}</select></div>
    <div class="form-group"><label>Hora inicio</label><input id="f_st" type="time" value="${r?.start_time || ''}" /></div>
    <div class="form-group"><label>Hora fin</label><input id="f_et" type="time" value="${r?.end_time || ''}" /></div>`;
}
function parseAvailForm() {
  return { teacher_id: fv('f_tc'), day_of_week: fv('f_dw'), start_time: fv('f_st'), end_time: fv('f_et') };
}

async function renderEnrollments() {
  document.getElementById('content').innerHTML = '<div class="loading">Cargando...</div>';
  try {
    const [enrollments, students, courses] = await Promise.all([
      api('/enrollments'), api('/students'), api('/courses')
    ]);
    _allRows = enrollments; _currentData = enrollments; _extraBtn = null;
    _cols = [
      { key: 'student_id', label: 'Estudiante ID' },
      { key: 'course_id', label: 'Curso ID' },
      { key: 'enrolled_at', label: 'Fecha matrícula' },
    ];
    _editFnG = null;
    _deleteFnG = r => openModal('Confirmar',
      `<p style="color:var(--text-muted);font-size:14px">¿Eliminar matrícula?</p>`,
      `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-danger" onclick="doDelete('/enrollments','${r.id}')">Eliminar</button>`);
    _addFn = () => openModal('Nueva Matrícula', buildEnrollForm(students, courses),
      `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="doCreate('/enrollments',parseEnrollForm())">Crear</button>`);
    document.getElementById('topbar-actions').innerHTML =
      `<button class="btn btn-primary" onclick="handleAdd()">${svgPlus} Agregar</button>`;
    document.getElementById('content').innerHTML =
      tableWrapper(renderTable(_cols, enrollments, null, _deleteFnG, null), enrollments.length);
  } catch (e) {
    document.getElementById('content').innerHTML =
      `<div class="empty-state"><p style="color:var(--danger)">${e.message}</p></div>`;
  }
}

function buildEnrollForm(students, courses) {
  const sOpts = students.map(s => `<option value="${s.id}">${s.first_name} ${s.last_name}</option>`).join('');
  const cOpts = courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  return `
    <div class="form-group"><label>Estudiante</label><select id="f_st"><option value="">Seleccionar...</option>${sOpts}</select></div>
    <div class="form-group"><label>Curso</label><select id="f_co"><option value="">Seleccionar...</option>${cOpts}</select></div>`;
}
function parseEnrollForm() {
  return { student_id: fv('f_st'), course_id: fv('f_co') };
}

async function renderConflicts() {
  document.getElementById('content').innerHTML = '<div class="loading">Cargando...</div>';
  try {
    const conflicts = await api('/conflicts');
    _allRows = conflicts; _currentData = conflicts;
    _cols = [
      { key: 'description', label: 'Descripción' },
      { key: 'type', label: 'Tipo', badge: () => 'badge-orange' },
      { key: 'active', label: 'Estado', badge: r => r.active ? 'badge-inactive' : 'badge-active' },
    ];
    _editFnG = null;
    _deleteFnG = null;
    _extraBtn = {
      label: 'Resolver',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
      fn: 'resolveConflict'
    };
    _addFn = () => openModal('Reportar Conflicto', `
      <div class="form-group"><label>Descripción</label><textarea id="f_ds"></textarea></div>
      <div class="form-group"><label>Tipo</label><input id="f_tp" placeholder="horario, aula, etc." /></div>`,
      `<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="doCreate('/conflicts',{description:fv('f_ds'),type:fv('f_tp')})">Reportar</button>`);
    document.getElementById('topbar-actions').innerHTML =
      `<button class="btn btn-primary" onclick="handleAdd()">${svgPlus} Reportar</button>`;
    document.getElementById('content').innerHTML =
      tableWrapper(renderTable(_cols, conflicts, null, null, _extraBtn), conflicts.length);
  } catch (e) {
    document.getElementById('content').innerHTML =
      `<div class="empty-state"><p style="color:var(--danger)">${e.message}</p></div>`;
  }
}

async function resolveConflict(r) {
  try {
    await api(`/conflicts/${r.id}/resolve`, { method: 'PATCH' });
    toast('Conflicto resuelto'); navigate('conflicts');
  } catch (e) { toast(e.message, 'error'); }
}

if (token && currentUser) {
  initApp();
} else {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('sidebar').style.display = 'none';
  document.getElementById('main').style.display = 'none';
}

document.getElementById('login-password').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});