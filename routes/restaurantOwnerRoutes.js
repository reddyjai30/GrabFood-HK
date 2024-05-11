const express = require('express');
const restaurantOwnerController = require('../controller/restaurantOwnerController');
const ownerAuthMiddleware = require('../middleware/ownerAuthMiddleware');
const router = express.Router();

//router.post('/register', restaurantOwnerController.registerRestaurantOwner);
router.post('/login',  restaurantOwnerController.ownerLogin);
//router.get('/owner/protected', ownerAuthMiddleware, ownerController.protectedEndpoint);
router.post('/submit-restaurant', ownerAuthMiddleware, restaurantOwnerController.submitRestaurant);


// Create a new restaurant by the restaurant owner
router.post('/restaurants', ownerAuthMiddleware, restaurantOwnerController.createRestaurant);

// Update a restaurant owned by the restaurant owner
router.put('/restaurants/:id', ownerAuthMiddleware, restaurantOwnerController.updateRestaurant);

//update restuarent menu items
router.put('/restaurants/:restaurantId/menu-items/:menuItemId', ownerAuthMiddleware, restaurantOwnerController.updateMenuItem);


// Delete a restaurant owned by the restaurant owner
router.delete('/restaurants/:id', ownerAuthMiddleware, restaurantOwnerController.deleteRestaurant);

// New endpoint to get restaurants within a radius
router.get('/restaurants/radius', ownerAuthMiddleware, restaurantOwnerController.getRestaurantsWithinRadius);


module.exports = router;
