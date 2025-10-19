const supabase = require('../config/supabase');
const { verifyToken } = require('../utils/auth.js');

exports.authenticateToken = async (req, res, next) => {
  // Bypass authentication in development environment
  if (process.env.NODE_ENV === 'development') {
    // Optionally, mock a user object for development testing
    req.user = {
      id: 0,
      email: 'dev@example.com',
      roleid: 5,
      // Add any other mock properties you need
    };
    console.log('Development mode: Authentication bypassed');
    return next();
  }
  try {
    const token = req.cookies.accessToken;

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

exports.authenticateRefresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
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