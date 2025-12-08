const express = require('express');
const router = express.Router();
const reportFile = require('../controllers/report_files');
const {authenticateToken} = require('../middleware/auth');

// Apply authentication to all grades routes
router.use(authenticateToken);

// Get all report file
router.get('/', reportFile.getAll);

// get report file by id
router.get('/:id', reportFile.getById);

module.exports = router;