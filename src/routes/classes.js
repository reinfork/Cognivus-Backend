const express = require('express');
const router = express.Router();
const classController = require('../controllers/classes');
const {authenticateToken} = require('../middleware/auth');

// Apply authentication to all classes routes
router.use(authenticateToken);

// Get all class
router.get('/', classController.getAll);

// Create a new class
router.post('/', classController.create);

// // Get a single class by ID
router.get('/:id', classController.getById);

// Update a class
router.put('/:id', classController.update);

// Delete a class
router.delete('/:id', classController.delete);

module.exports = router;