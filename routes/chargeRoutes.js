const express = require('express');
const router = express.Router();
const chargeController = require('../controller/chargeController');

router.post('/calculate-charges', chargeController.calculateCharges);

module.exports = router;
