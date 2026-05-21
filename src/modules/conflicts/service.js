const supabase = require('../../config/supabase');

exports.getConflicts = async () => {
  const { data, error } = await supabase
    .from('conflicts')
    .select('*')
    .is('deleted_at', null);

  if (error) throw error;
  return data;
};

exports.getConflictById = async (id) => {
  const { data, error } = await supabase
    .from('conflicts')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
};

exports.createConflict = async (conflict) => {
  const { data, error } = await supabase
    .from('conflicts')
    .insert([conflict])
    .select();

  if (error) throw error;
  return data;
};

exports.resolveConflict = async (id) => {
  const { data, error } = await supabase
    .from('conflicts')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};