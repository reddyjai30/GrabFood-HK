// routes/profileRoutes.js

const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware'); // Destructured if authMiddleware.js exports an object
const profileController = require('../controller/profileController');

const router = express.Router();

router.post('/profile', authMiddleware, profileController.createOrUpdateProfile);
router.get('/profile', authMiddleware, profileController.getUserProfile);

module.exports = router;
