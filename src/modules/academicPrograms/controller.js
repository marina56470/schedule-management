const service = require('./service');

exports.getAll = async (req, res) => {
  try {
    const data = await service.getAcademicPrograms();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await service.getAcademicProgramById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Programa académico no encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await service.createAcademicProgram(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.updateAcademicProgram(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await service.deleteAcademicProgram(req.params.id);
    res.json({ message: 'Programa académico eliminado correctamente', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};