const supabase = require('../../config/supabase');

exports.getEnrollments = async () => {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*');

  if (error) throw error;
  return data;
};

exports.getEnrollmentById = async (id) => {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

exports.getEnrollmentsByStudent = async (student_id) => {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('student_id', student_id);

  if (error) throw error;
  return data;
};

exports.createEnrollment = async (enrollment) => {
  const { data, error } = await supabase
    .from('enrollments')
    .insert([enrollment])
    .select();

  if (error) throw error;
  return data;
};

exports.deleteEnrollment = async (id) => {
  const { data, error } = await supabase
    .from('enrollments')
    .delete()
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};