const service = require('./service');

exports.getAll = async (req, res) => {
  try {
    const data = await service.getAvailability();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getByTeacher = async (req, res) => {
  try {
    const data = await service.getAvailabilityByTeacher(req.params.teacher_id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await service.getAvailabilityById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Disponibilidad no encontrada' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await service.createAvailability(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.updateAvailability(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await service.deleteAvailability(req.params.id);
    res.json({ message: 'Disponibilidad eliminada correctamente', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};