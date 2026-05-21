const service = require('./service');

exports.getAll = async (req, res) => {
  try {
    const data = await service.getCourses();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await service.getCourseById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Curso no encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await service.createCourse(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.updateCourse(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await service.deleteCourse(req.params.id);
    res.json({ message: 'Curso eliminado correctamente', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};