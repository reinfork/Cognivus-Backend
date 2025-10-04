const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.js');
const { authenticateToken } = require('../middleware/auth');
const passport = require('../config/passport');

//inform auth is working
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth endpoint is working!',
  });
});

// Public routes
router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/google/callback', passport.authenticate('google', { session: false }), controller.googleCallback)

// Protected routes
router.get('/profile', authenticateToken, controller.getProfile);
router.post('/logout', authenticateToken, controller.logout);

module.exports = router;