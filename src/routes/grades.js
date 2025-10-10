const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/grades');
const {authenticateToken} = require('../middleware/auth');

// Apply authentication to all grades routes
router.use(authenticateToken);

// Get all class
router.get('/', gradeController.getAll);

// Create a new class
router.post('/', gradeController.create);

// // Get a single class by ID
router.get('/:id', gradeController.getById);

// Update a class
router.put('/:id', gradeController.update);

// Delete a class
router.delete('/:id', gradeController.delete);

module.exports = router;