const express = require('express');
const router = express.Router();
const courseFile = require('../controllers/course_files');
const {authenticateToken} = require('../middleware/auth');
const { requireActiveValidity } = require('../middleware/validity');

// Apply authentication to all grades routes
router.use(authenticateToken);

// Students with a lapsed class period cannot reach course material
router.use(requireActiveValidity);

// Get all class
router.get('/', courseFile.getAll);

// // Get a single class by ID
router.get('/:id', courseFile.getById);

router.delete('/:id', courseFile.delete);

module.exports = router;