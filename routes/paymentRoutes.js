const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');

router.post('/check-payment-status', paymentController.checkPaymentStatus);

module.exports = router;
