const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/grades');
const {authenticateToken} = require('../middleware/auth');
const multerConfig = require('../config/multer');

// Apply authentication to all grades routes
router.use(authenticateToken);

// Get all class
router.get('/', gradeController.getAll);

// Create a new class
router.post('/', multerConfig.single('file'), gradeController.create);

// // Get a single class by ID
router.get('/:id', gradeController.getById);

// Update a class
router.put('/:id', multerConfig.single('file'), gradeController.update);

// Delete a class
router.delete('/:id', gradeController.delete);

module.exports = router;