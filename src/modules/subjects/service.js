const supabase = require('../../config/supabase');

exports.getSubjects = async () => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .is('deleted_at', null);

  if (error) throw error;
  return data;
};

exports.getSubjectById = async (id) => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
};

exports.createSubject = async (subject) => {
  const { data, error } = await supabase
    .from('subjects')
    .insert([subject])
    .select();

  if (error) throw error;
  return data;
};

exports.updateSubject = async (id, updates) => {
  const { data, error } = await supabase
    .from('subjects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};

exports.deleteSubject = async (id) => {
  const { data, error } = await supabase
    .from('subjects')
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};