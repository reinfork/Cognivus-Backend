const geoip = require('geoip-lite');

module.exports = function restrictRegion(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const geo = geoip.lookup(ip);

  // Allow localhost
  if (ip === '::1' || ip === '127.0.0.1') return next();

  if (!geo || geo.country !== 'ID') {
    return res.status(403).json({
      message: 'Access restricted: this service is not available in your country.',
    });
  }

  next();
};
