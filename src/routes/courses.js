const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courses');
const { authenticateToken } = require('../middleware/auth');
const multerConfig = require('../config/multer');

// Apply authentication to all lecturer routes
router.use(authenticateToken);

// Get all students 
router.get('/', courseController.getAll);

// Create a new course
router.post('/', multerConfig.array('files') ,courseController.create);

// // Get a single course by ID
router.get('/:id', courseController.getById);

// Update a course
router.put('/:id', multerConfig.array('files'), courseController.update);

// Delete a course
router.delete('/:id', courseController.delete);

module.exports = router;