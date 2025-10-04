const express = require('express');
const router = express.Router();
const studentController = require('../controllers/students');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all student routes
router.use(authenticateToken);

// Get all students
router.get('/', studentController.getAll);

// Get a single student by ID
router.get('/:id', studentController.getById);

// Create a new student
router.post('/', studentController.create);

// Update a student
router.put('/:id', studentController.update);

// Delete a student
router.delete('/:id', studentController.delete);

module.exports = router;