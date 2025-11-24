const express = require('express');
const router = express.Router();
const controller = require('../controllers/payment.js');
const {authenticateToken} = require('../middleware/auth');

//webhook without authorization
router.post('/webhook', controller.webhook);

//authorization
router.use(authenticateToken);

//generate midtrans token and payment
router.post('/generate', controller.generate);

//get payment history
router.get('/history', controller.history);

//get payment history for a student
router.get('/history/:studentid', controller.historyByID);

module.exports = router;