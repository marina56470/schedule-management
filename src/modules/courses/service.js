const supabase = require('../../config/supabase');

exports.getCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .is('deleted_at', null);

  if (error) throw error;
  return data;
};

exports.getCourseById = async (id) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
};

exports.createCourse = async (course) => {
  const { data, error } = await supabase
    .from('courses')
    .insert([course])
    .select();

  if (error) throw error;
  return data;
};

exports.updateCourse = async (id, updates) => {
  const { data, error } = await supabase
    .from('courses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};

exports.deleteCourse = async (id) => {
  const { data, error } = await supabase
    .from('courses')
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};