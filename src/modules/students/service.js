const supabase = require('../../config/supabase');
const validateInstitutionalEmail = require('../../utils/validateInstitutionalEmail');

exports.getStudents = async () => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .is('deleted_at', null);

  if (error) throw error;
  return data;
};

exports.getStudentById = async (id) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
};

exports.createStudent = async (student) => {
  const { data, error } = await supabase
    .from('students')
    .insert([student])
    .select();

  if (error) throw error;
  return data;
};

exports.updateStudent = async (id, updates) => {
  const { data, error } = await supabase
    .from('students')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};

exports.deleteStudent = async (id) => {
  const { data, error } = await supabase
    .from('students')
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};