const service = require('./service');

exports.getAll = async (req, res) => {
  try {
    const data = await service.getConflicts();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await service.getConflictById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Conflicto no encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await service.createConflict(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resolve = async (req, res) => {
  try {
    const data = await service.resolveConflict(req.params.id);
    res.json({ message: 'Conflicto resuelto correctamente', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};