const supabase = require('../../config/supabase');
const { checkConflict } = require('../../utils/conflictChecker');

exports.getSchedules = async () => {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .is('deleted_at', null);

  if (error) throw error;
  return data;
};

exports.getScheduleById = async (id) => {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
};

exports.createSchedule = async (schedule) => {
  const { teacher_id, day_of_week, start_time, end_time } = schedule;

  const conflict = await checkConflict({ teacher_id, day_of_week, start_time, end_time });
  if (conflict) {
    throw new Error('El docente ya tiene un horario en ese rango de tiempo');
  }

  const { data, error } = await supabase
    .from('schedules')
    .insert([schedule])
    .select();

  if (error) throw error;
  return data;
};

exports.updateSchedule = async (id, updates) => {
  const { teacher_id, day_of_week, start_time, end_time } = updates;

  const conflict = await checkConflict({ teacher_id, day_of_week, start_time, end_time, exclude_id: id });
  if (conflict) {
    throw new Error('El docente ya tiene un horario en ese rango de tiempo');
  }

  const { data, error } = await supabase
    .from('schedules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};

exports.deleteSchedule = async (id) => {
  const { data, error } = await supabase
    .from('schedules')
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};