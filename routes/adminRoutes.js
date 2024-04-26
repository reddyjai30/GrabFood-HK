const express = require('express');
const router = express.Router();

// Assuming the controllers are correctly exported and imported
const adminController = require('../controller/adminController');
const adminAuthController = require('../controller/adminAuthController');

const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

//admin settings
router.post('/settings', adminController.setAdminSettings);

// Route for Admin to register
router.post('/register', adminAuthController.registerAdmin);

// Route for Admin to login
router.post('/login', adminAuthController.adminLogin);


// Route for admins to register restaurant owners
router.post('/register-owner', authMiddleware, isAdmin, adminController.registerRestaurantOwner);

// Route for restaurant owners to login (handled by adminAuthController for simplicity)
//router.post('/owner-login', adminAuthController.ownerLogin);

// Route to create a restaurant, ensuring the user is logged in and is an admin
//router.post('/restaurants', authMiddleware, isAdmin, adminController.createRestaurant);

// Route to get all restaurants, with admin privileges
//router.get('/restaurants', [authMiddleware, isAdmin], adminController.getAllRestaurants);

// Route to get a specific restaurant by ID, with admin privileges
//router.get('/restaurants/:id', [authMiddleware, isAdmin], adminController.getRestaurantById);

// Route to update a restaurant's information, with admin privileges
//router.put('/restaurants/:id', [authMiddleware, isAdmin], adminController.updateRestaurant);

// Route to delete a restaurant, with admin privileges
//router.delete('/restaurants/:id', [authMiddleware, isAdmin], adminController.deleteRestaurant);

// Routes for managing restaurant approval process
router.get('/pending-restaurants', authMiddleware, isAdmin, adminController.listPendingRestaurants);
router.put('/approve-restaurant/:id', authMiddleware, isAdmin, adminController.approveRestaurant);
router.put('/reject-restaurant/:id', authMiddleware, isAdmin, adminController.rejectRestaurant);

module.exports = router;
