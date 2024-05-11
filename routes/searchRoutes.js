const express = require('express');
const router = express.Router();
const searchController = require('../controller/searchController');

router.get('/', searchController.searchMenuItem);

// Route to search for menu items within a specific restaurant
router.get('/search-in-restaurant', searchController.searchMenuItemsInRestaurant);


module.exports = router;
