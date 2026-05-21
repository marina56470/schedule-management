const service = require('./service');

exports.getAll = async (req, res) => {
  try {
    const data = await service.getTeachers();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await service.getTeacherById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Docente no encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await service.createTeacher(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.updateTeacher(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await service.deleteTeacher(req.params.id);
    res.json({ message: 'Docente eliminado correctamente', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};