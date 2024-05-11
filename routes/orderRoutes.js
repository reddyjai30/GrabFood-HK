const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const stripe = require('../config/stripeConfig');
const { authMiddleware } = require('../middleware/authMiddleware'); // Assuming you have authentication middleware


//router.post('/calculate-total', orderController.calculateTotal);
router.post('/order', orderController.calculateTotalAndInitiatePayment);

router.post('/process-payment', authMiddleware, orderController.processPaymentAndStoreOrder);

router.post('/create-payment-intent', orderController.createpaymentintent);

module.exports = router;
