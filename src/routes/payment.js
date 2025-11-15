const express = require('express');
const router = express.Router();
const controller = require('../controllers/payment.js');
const {authenticateToken} = require('../middleware/auth');

// Apply authentication to all users routes
router.use(authenticateToken);

//generate midtrans token and payment
router.post('/generate', controller.generate);

//midtrans notifications webhook
router.post('/webhook', controller.webhook);

module.exports = router;