const express = require('express');
const router = express.Router();
const users_controller = require('../controllers/users');
const {authenticateToken} = require('../middleware/auth');

// Apply authentication to all users routes
router.use(authenticateToken);

// Get all students
router.get('/', users_controller.getAll);

// Get a single student by ID
router.get('/:id', users_controller.getById);

// Create a new student
router.post('/', users_controller.create);

// Update a student
router.put('/:id', users_controller.update);

// Delete a student
router.delete('/:id', users_controller.delete);

module.exports = router;