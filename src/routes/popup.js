const express = require('express');
const router = express.Router();
const popupController = require('../controllers/popup');
const { authenticateToken } = require('../middleware/auth');
const multerConfig = require('../config/multer');

router.use(authenticateToken);

// Active popup for students
router.get('/active', popupController.getActive);

// Current popup for admin
router.get('/', popupController.get);

// Create or replace popup
router.post('/', multerConfig.single('file'), popupController.upsert);

// Delete popup
router.delete('/', popupController.remove);

module.exports = router;
