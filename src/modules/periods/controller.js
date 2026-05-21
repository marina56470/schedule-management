const service = require('./service');

exports.getAll = async (req, res) => {
  try {
    const data = await service.getPeriods();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await service.getPeriodById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Periodo no encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await service.createPeriod(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.updatePeriod(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await service.deletePeriod(req.params.id);
    res.json({ message: 'Periodo eliminado correctamente', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};