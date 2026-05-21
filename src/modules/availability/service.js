const supabase = require('../../config/supabase');


exports.getAvailability = async () => {
  const { data, error } = await supabase
    .from('teacher_availability')
    .select('*')
    .is('deleted_at', null);

  if (error) throw error;
  return data;
};

exports.getAvailabilityByTeacher = async (teacher_id) => {
  const { data, error } = await supabase
    .from('teacher_availability')
    .select('*')
    .eq('teacher_id', teacher_id)
    .is('deleted_at', null);

  if (error) throw error;
  return data;
};

exports.getAvailabilityById = async (id) => {
  const { data, error } = await supabase
    .from('teacher_availability')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
};

exports.createAvailability = async (availability) => {
  const { start_time, end_time } = availability;

  if (start_time >= end_time) {
    throw new Error('La hora de inicio debe ser menor que la hora final');
  }

  const { data, error } = await supabase
    .from('teacher_availability')
    .insert([availability])
    .select();

  if (error) throw error;
  return data;
};

exports.updateAvailability = async (id, updates) => {
  const { data, error } = await supabase
    .from('teacher_availability')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};

exports.deleteAvailability = async (id) => {
  const { data, error } = await supabase
    .from('teacher_availability')
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};