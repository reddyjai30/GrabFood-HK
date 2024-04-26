const express = require('express');
const router = express.Router();
const { register, login, verifyOTP,verifyEmail, verifyEmailOtp } = require('../controller/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.get('/verify-email', verifyEmail);
router.post('/verify-email-otp', verifyEmailOtp);

module.exports = router;
