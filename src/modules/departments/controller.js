const service = require('./service');

exports.getAll = async (req, res) => {
  try {
    const data = await service.getDepartments();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await service.getDepartmentById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Departamento no encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await service.createDepartment(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.updateDepartment(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await service.deleteDepartment(req.params.id);
    res.json({ message: 'Departamento eliminado correctamente', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};