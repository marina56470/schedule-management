const supabase = require('../../config/supabase');

exports.getDepartments = async () => {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .is('deleted_at', null);

  if (error) throw error;
  return data;
};

exports.getDepartmentById = async (id) => {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
};

exports.createDepartment = async (department) => {
  const { data, error } = await supabase
    .from('departments')
    .insert([department])
    .select();

  if (error) throw error;
  return data;
};

exports.updateDepartment = async (id, updates) => {
  const { data, error } = await supabase
    .from('departments')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};

exports.deleteDepartment = async (id) => {
  const { data, error } = await supabase
    .from('departments')
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};