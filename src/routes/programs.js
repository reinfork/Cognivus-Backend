const express = require('express');
const router = express.Router();
const controller = require('../controllers/programs');
const {authenticateToken} = require('../middleware/auth');

// Apply authentication to all users routes
router.use(authenticateToken);

// Get all students
router.get('/', controller.getAll);

// Get a single student by ID
router.get('/:id', controller.getById);

// Create a new student
router.post('/', controller.create);

// Update a student
router.put('/:id', controller.update);

// Delete a student
router.delete('/:id', controller.delete);

module.exports = router;