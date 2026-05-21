const supabase = require('../../config/supabase');
const validateInstitutionalEmail = require('../../utils/validateInstitutionalEmail');

exports.getTeachers = async () => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .is('deleted_at', null);

  if (error) throw error;
  return data;
};

exports.getTeacherById = async (id) => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
};

exports.createTeacher = async (teacher) => {
  const { data, error } = await supabase
    .from('teachers')
    .insert([teacher])
    .select();

  if (error) throw error;
  return data;
};

exports.updateTeacher = async (id, updates) => {
  const { data, error } = await supabase
    .from('teachers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};

exports.deleteTeacher = async (id) => {
  const { data, error } = await supabase
    .from('teachers')
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};