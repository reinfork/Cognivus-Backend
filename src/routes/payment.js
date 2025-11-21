const express = require('express');
const router = express.Router();
const controller = require('../controllers/payment.js');
const {authenticateToken} = require('../middleware/auth');

//generate midtrans token and payment
router.post('/generate', authenticateToken, controller.generate);

//midtrans notifications webhook (no auth - called by Midtrans)
router.post('/webhook', controller.webhook);

//get payment history for a student
router.get('/history/:studentid', authenticateToken, controller.getPaymentHistory);

module.exports = router;