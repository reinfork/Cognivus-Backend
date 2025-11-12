const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard');
const { authenticateToken } = require('../middleware/auth');

// Get recent activity
router.get('/recent-activity', authenticateToken, dashboardController.getRecentActivity);

module.exports = router;
