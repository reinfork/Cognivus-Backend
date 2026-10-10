const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courses');
const { authenticateToken } = require('../middleware/auth');
const { requireActiveValidity } = require('../middleware/validity');
const multerConfig = require('../config/multer');

router.use(authenticateToken);
router.use(requireActiveValidity);

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