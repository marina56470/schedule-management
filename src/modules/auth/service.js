const supabase = require('../../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async ({ first_name, last_name, email, password, role, department_id, program_id }) => {

    if (!email.endsWith('@uac.edu.co')) {
    throw new Error('Solo se permiten correos institucionales @uac.edu.co');
  }
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) throw new Error('El email ya esta registrado');

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([{ first_name, last_name, email, password: hashedPassword, role, department_id, program_id }])
    .select('id, first_name, last_name, email, role');

  if (error) throw error;
  return data[0];
};

exports.login = async ({ email, password }) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .is('deleted_at', null)
    .single();

  if (error || !user) throw new Error('Credenciales invalidas');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Credenciales invalidas');

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return {
    token,
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role
    }
  };
};