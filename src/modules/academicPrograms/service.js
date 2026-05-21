const supabase = require('../../config/supabase');
const validateInstitutionalEmail = require('../../utils/validateInstitutionalEmail');

exports.getAcademicPrograms = async () => {
  const { data, error } = await supabase
    .from('academic_programs')
    .select('*')
    .is('deleted_at', null);

  if (error) throw error;
  return data;
};

exports.getAcademicProgramById = async (id) => {
  const { data, error } = await supabase
    .from('academic_programs')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
};

exports.createAcademicProgram = async (program) => {
  const { data, error } = await supabase
    .from('academic_programs')
    .insert([program])
    .select();

  if (error) throw error;
  return data;
};

exports.updateAcademicProgram = async (id, updates) => {
  const { data, error } = await supabase
    .from('academic_programs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};

exports.deleteAcademicProgram = async (id) => {
  const { data, error } = await supabase
    .from('academic_programs')
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};