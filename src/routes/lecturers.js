const express = require('express');
const router = express.Router();
const lecturerController = require('../controllers/lecturers');
const {authenticateToken} = require('../middleware/auth');

// Apply authentication to all lecturer routes
router.use(authenticateToken);

// Get all students
router.get('/', lecturerController.getAll);

// Get a single student by ID
router.get('/:id', lecturerController.getById);

// Create a new student
router.post('/', lecturerController.create);

// Update a student
router.put('/:id', lecturerController.update);

// Delete a student
router.delete('/:id', lecturerController.delete);

module.exports = router;