const supabase = require('../../config/supabase');

exports.getPeriods = async () => {
  const { data, error } = await supabase
    .from('periods')
    .select('*')
    .is('deleted_at', null);

  if (error) throw error;
  return data;
};

exports.getPeriodById = async (id) => {
  const { data, error } = await supabase
    .from('periods')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
};

exports.createPeriod = async (period) => {
  const { data, error } = await supabase
    .from('periods')
    .insert([period])
    .select();

  if (error) throw error;
  return data;
};

exports.updatePeriod = async (id, updates) => {
  const { data, error } = await supabase
    .from('periods')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};

exports.deletePeriod = async (id) => {
  const { data, error } = await supabase
    .from('periods')
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};