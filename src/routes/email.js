const express = require('express');
const router = express.Router();
const controller = require('../controllers/emails');
const {authenticateToken} = require('../middleware/auth');

// Apply authentication to all users routes
router.use(authenticateToken);

router.get('/send', controller.send);

module.exports = router;