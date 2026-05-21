const service = require('./service');

exports.getAll = async (req, res) => {
  try {
    const data = await service.getEnrollments();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await service.getEnrollmentById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Inscripción no encontrada' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getByStudent = async (req, res) => {
  try {
    const data = await service.getEnrollmentsByStudent(req.params.student_id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await service.createEnrollment(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await service.deleteEnrollment(req.params.id);
    res.json({ message: 'Inscripcion eliminada correctamente', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};