const express = require('express');
const router = express.Router();
const controller = require('../controllers/payment.js');
const {authenticateToken} = require('../middleware/auth');

// Apply authentication to all users routes
router.use(authenticateToken);

//generate midtrans token and payment
router.post('/generate', controller.generate);

//midtrans notifications webhook (no auth - called by Midtrans)
router.post('/webhook', controller.webhook);

//get payment history
router.get('/history', authenticateToken, controller.history);

//get payment history for a student
router.get('/history/:studentid', authenticateToken, controller.historyByID);

module.exports = router;