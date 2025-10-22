const supabase = require('../config/supabase');
const { verifyToken } = require('../utils/auth.js');

const authenticateToken = async (req, res, next) => {
  // Bypass authentication in development and test environments
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'staging') {
    // Optionally, mock a user object for development/testing
    req.user = {
      id: 'dev-user-id',
      email: 'dev@example.com',
      role: 'developer',
      // Add any other mock properties you need
    };
    console.log(`${process.env.NODE_ENV.charAt(0).toUpperCase() + process.env.NODE_ENV.slice(1)} mode: Authentication bypassed`);
    return next();
  }
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    // Verify the token
    const payload = verifyToken(token);
    
    if (!payload) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

module.exports = { authenticateToken };
