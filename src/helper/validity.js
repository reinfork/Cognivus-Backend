const supabase = require('../config/supabase');


const MONTHS_BY_TYPE = {
  monthly: 2,
  semester: 7
};
const DAY_MS = 24 * 60 * 60 * 1000;

const addMonths = (date, months) => {
  const result = new Date(date);
  const day = result.getUTCDate();

  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);

  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)
  ).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));

  return result;
};

const monthsFor = (paymentType) => MONTHS_BY_TYPE[paymentType] || 0;

const isExpired = (deactivateAt) => {
  if (!deactivateAt) return false;
  return new Date(deactivateAt).getTime() <= Date.now();
};

const daysLeft = (deactivateAt) => {
  if (!deactivateAt) return null;
  return Math.ceil((new Date(deactivateAt).getTime() - Date.now()) / DAY_MS);
};

const extendValidity = async (userid, months) => {
  if (!userid || !months) return null;

  const { data: user, error: readError } = await supabase
    .from('tbuser')
    .select('deactivate_at')
    .eq('userid', userid)
    .single();

  if (readError) throw readError;

  const current = user?.deactivate_at ? new Date(user.deactivate_at) : null;
  const base = current && current.getTime() > Date.now() ? current : new Date();

  const { data, error } = await supabase
    .from('tbuser')
    .update({ deactivate_at: addMonths(base, months).toISOString() })
    .eq('userid', userid)
    .select('userid, deactivate_at')
    .single();

  if (error) throw error;
  return data;
};

const extendForPayment = async (studentid, paymentType) => {
  const months = monthsFor(paymentType);
  if (!studentid || !months) return null;

  const { data: student, error } = await supabase
    .from('tbstudent')
    .select('userid')
    .eq('studentid', studentid)
    .single();

  if (error) throw error;
  if (!student?.userid) return null;

  return extendValidity(student.userid, months);
};

module.exports = {
  MONTHS_BY_TYPE,
  addMonths,
  monthsFor,
  isExpired,
  daysLeft,
  extendValidity,
  extendForPayment
};
