const supabase = require('../config/supabase.js');

const levelFromClass = async (classid) => {
  if (!classid) return null;

  const { data, error } = await supabase
    .from('tbclass')
    .select('tblevel(name)')
    .eq('classid', classid)
    .single();

  if (error || !data) return null;
  return data.tblevel?.name || null;
};

module.exports = { levelFromClass }