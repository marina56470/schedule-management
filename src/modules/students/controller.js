const service = require('./service');

exports.getAll = async (req, res) => {
  try {
    const data = await service.getStudents();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await service.getStudentById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Estudiante no encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await service.createStudent(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.updateStudent(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await service.deleteStudent(req.params.id);
    res.json({ message: 'Estudiante eliminado correctamente', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};