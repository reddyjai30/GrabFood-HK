const express = require('express');
const router = express.Router();
const locationController = require('../controller/locationController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Assuming authMiddleware handles user authentication

router.post('/save-location',  locationController.saveLocation);

// New route to calculate distance
router.post('/calculate-distance', locationController.calculateDistance);

module.exports = router;
