const express = require('express');
const router = express.Router();
const reportFile = require('../controllers/report_files');
const {authenticateToken} = require('../middleware/auth');
const multerConfig = require('../config/multer');

// Apply authentication to all grades routes
router.use(authenticateToken);

// Get all class
router.get('/', reportFile.getAll);

// // Get a single class by ID
router.get('/:id', reportFile.getById);

module.exports = router;