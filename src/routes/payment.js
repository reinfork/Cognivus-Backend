const express = require('express');
const router = express.Router();
const controller = require('../controllers/payment.js');
const {authenticateToken} = require('../middleware/auth');
const middleware = require('../middleware/midtrans');

//webhook without authorization
router.post('/webhook', middleware.verify, controller.webhook);

//authorization
router.use(authenticateToken);

//generate midtrans token and payment
router.post('/generate', controller.generate);

//get all payment history
router.get('/history', controller.history);

//get payment history for a student
router.get('/history/:studentid', controller.historyByID);

//update new status by orderId
router.put('/refresh/', controller.refreshOrderID);

//update new status for a student
router.put('/refresh/:studentid', controller.refreshStudentID);


module.exports = router;