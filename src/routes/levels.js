const express = require('express');
const router = express.Router();
const levelsController = require('../controllers/levels');
const {authenticateToken} = require('../middleware/auth');

// Apply authentication to all users routes
router.use(authenticateToken);

// Get all students
router.get('/', levelsController.getAll);

// Get a single student by ID
router.get('/:id', levelsController.getById);

// Create a new student
router.post('/', levelsController.create);

// Update a student
router.put('/:id', levelsController.update);

// Delete a student
router.delete('/:id', levelsController.delete);

module.exports = router;