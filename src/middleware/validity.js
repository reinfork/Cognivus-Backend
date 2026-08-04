const supabase = require('../config/supabase');
const { isExpired } = require('../helper/validity');

/**
 * Gate class material behind an unexpired class validity period.
 *
 * Only students are gated — lecturers, admins and the development bypass user
 * pass straight through. A student whose period has lapsed keeps their login
 * and can still reach payment, grades and their profile; only course material
 * is withheld until they renew.
 *
 * Fails open on a read error: this is a feature tier, not authentication, and
 * locking paying students out of their material over a transient database
 * blip is the worse outcome. The failure is logged instead.
 */
const requireActiveValidity = async (req, res, next) => {
  if (req.user?.role !== 'student') return next();

  try {
    const { data: user, error } = await supabase
      .from('tbuser')
      .select('deactivate_at')
      .eq('userid', req.user.id)
      .single();

    if (error) throw error;

    if (isExpired(user?.deactivate_at)) {
      return res.status(403).json({
        success: false,
        message: 'Your class period has ended. Renew your payment to regain access to the material.',
        deactivate_at: user.deactivate_at
      });
    }

    return next();
  } catch (error) {
    req.log.error(
      { reqId: req.id, userid: req.user.id, error },
      'Could not read class validity, allowing request through'
    );
    return next();
  }
};

module.exports = { requireActiveValidity };
