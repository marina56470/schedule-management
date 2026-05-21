const service = require('./service');

exports.getAll = async (req, res) => {
  try {
    const data = await service.getSubjects();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await service.getSubjectById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Materia no encontrada' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await service.createSubject(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.updateSubject(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await service.deleteSubject(req.params.id);
    res.json({ message: 'Materia eliminada correctamente', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};