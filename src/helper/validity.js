const supabase = require('../config/supabase');

/**
 * Class validity period ("masa berlaku kelas").
 *
 * Stored in `tbuser.deactivate_at`, a pre-existing column that nothing ever
 * wrote to. Despite its name a passed date does NOT deactivate the account:
 * the student can still log in, only class material is gated (see
 * middleware/validity.js). Split this into its own column if the two meanings
 * ever diverge.
 *
 * A NULL date always means "no limit", never "expired" — every student
 * predating this feature has NULL, and treating that as expired would lock
 * all of them out at once.
 */

// Months of access granted per tuition payment. Ancillary fees grant none.
const MONTHS_BY_TYPE = {
  monthly: 2,
  semester: 7
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Add whole months in UTC, clamping to the last valid day of the target month. */
const addMonths = (date, months) => {
  const result = new Date(date);
  const day = result.getUTCDate();

  // Move off the current day first so a 31st never overflows into next month
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);

  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)
  ).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));

  return result;
};

/** Months granted by a stored tbpayment.payment_type; 0 for ancillary/unknown. */
const monthsFor = (paymentType) => MONTHS_BY_TYPE[paymentType] || 0;

/** NULL is never expired. */
const isExpired = (deactivateAt) => {
  if (!deactivateAt) return false;
  return new Date(deactivateAt).getTime() <= Date.now();
};

/** Whole days remaining, negative once past. NULL date returns null. */
const daysLeft = (deactivateAt) => {
  if (!deactivateAt) return null;
  return Math.ceil((new Date(deactivateAt).getTime() - Date.now()) / DAY_MS);
};

/**
 * Extend from whichever is later: now, or the existing end date. Paying early
 * adds to the time remaining instead of truncating it.
 */
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

/**
 * Grant class time for a settled payment. Callers must only invoke this on the
 * transition into 'success' — Midtrans redelivers notifications, and extending
 * twice for one payment cannot be undone.
 */
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
