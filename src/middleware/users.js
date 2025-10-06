module.exports = function authorizeUser(req, res, next) {
  const tokenUser = req.user; // from authenticateToken middleware
  const targetId = req.params.id || req.query.id;

  // Basic role-based rule
  if (tokenUser.role === 'student' && tokenUser.id !== targetId) {
    return res.status(403).json({ message: 'Access denied: you can only access your own data.' });
  }

  // Teachers or admins can access others
  if (['teacher', 'admin'].includes(tokenUser.role)) {
    return next();
  }

  // Default: allowed if same user
  if (tokenUser.id === targetId) {
    return next();
  }

  res.status(403).json({ message: 'Access denied.' });
};
