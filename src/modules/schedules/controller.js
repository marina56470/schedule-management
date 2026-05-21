const service = require('./service');

exports.getAll = async (req, res) => {
  try {
    const data = await service.getSchedules();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await service.getScheduleById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Horario no encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { start_time, end_time } = req.body;

    if (start_time >= end_time) {
      return res.status(400).json({ error: 'La hora de inicio debe ser menor que la hora final' });
    }

    const data = await service.createSchedule(req.body);
    res.status(201).json(data);
  } catch (error) {
    if (error.message.includes('ya tiene un horario')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { start_time, end_time } = req.body;

    if (start_time && end_time && start_time >= end_time) {
      return res.status(400).json({ error: 'La hora de inicio debe ser menor que la hora final' });
    }

    const data = await service.updateSchedule(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    if (error.message.includes('ya tiene un horario')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await service.deleteSchedule(req.params.id);
    res.json({ message: 'Horario eliminado correctamente', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};