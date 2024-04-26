const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/orders', authMiddleware, orderController.createOrder);
router.get('/orders/:id', authMiddleware, orderController.getOrder);

module.exports = router;
