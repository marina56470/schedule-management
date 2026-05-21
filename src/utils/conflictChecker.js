const supabase = require('../config/supabase');
 

const checkConflict = async ({ teacher_id, day_of_week, start_time, end_time, exclude_id }) => {
  let query = supabase
    .from('schedules')
    .select('*')
    .eq('teacher_id', teacher_id)
    .eq('day_of_week', day_of_week)
    .lt('start_time', end_time)
    .gt('end_time', start_time);
 

  if (exclude_id) {
    query = query.neq('id', exclude_id);
  }
 
  const { data, error } = await query;
 
  if (error) throw error;
 
  return data.length > 0;
};
 
module.exports = { checkConflict };