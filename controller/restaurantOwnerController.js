const jwt = require('jsonwebtoken');
const RestaurantOwner = require('../model/restaurantOwnerModel');
const Restaurant = require('../model/restaurantModel');
const upload = require('../middleware/uploadMiddleware'); 
const AdminSettings = require('../model/AdminSettings')
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


exports.createRestaurant = async (req, res) => {
  const owner = req.owner.id;
  const { name, locationCoordinates, cuisineType, categories, deliveryTime, minimumOrder, rating } = req.body;

  try {
      if (!owner || !name || !locationCoordinates || !cuisineType || !categories || !Array.isArray(categories)) {
          return res.status(400).json({ message: "Missing required fields or incorrect data format" });
      }

      const newRestaurant = await Restaurant.create({
          owner,
          name,
          location: {
              type: 'Point',
              coordinates: [locationCoordinates.longitude, locationCoordinates.latitude],
          },
          cuisineType,
          categories,
          deliveryTime,
          minimumOrder,
          rating,
          status: 'pending'
      });

      res.status(201).json(newRestaurant);
  } catch (error) {
      console.error('Error creating new restaurant:', error);
      res.status(500).json({ message: "Failed to add restaurant", error: error.message });
  }
};








exports.submitRestaurant = async (req, res) => {
    try {
      const owner= req.owner.id;
      const { name, location, categories, menuItems,cuisineType,categoryName,rating,deliveryTime,minimumOrder } = req.body;
      const newRestaurant = new Restaurant({
        owner,
        name,
        location,
        cuisineType,
        categoryName,
        categories,
        menuItems,
        rating,
        deliveryTime,
        minimumOrder,
        status: 'pending' // status set to 'pending' by default
      });
      await newRestaurant.save();
      res.status(201).json({ message: 'Restaurant submitted for approval', restaurant: newRestaurant });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to submit restaurant", error: error.message });
    }
  };

  exports.updateRestaurant = async (req, res) => {
    try {
        const updatedFields = { ...req.body, status: 'pending' }; // Ensure status is reset to pending
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(req.restaurant._id, updatedFields, { new: true });
        res.status(200).json({ message: "Restaurant updated and pending approval.", restaurant: updatedRestaurant });
    } catch (error) {
        res.status(500).json({ message: "Error updating restaurant.", error: error.message });
    }
};

exports.updateMenuItem = async (req, res) => {
  const { restaurantId, menuItemId } = req.params;
  const menuItemUpdates = req.body;

  try {
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
          return res.status(404).json({ message: "Restaurant not found." });
      }

      if (restaurant.owner.toString() !== req.owner.id) {
          return res.status(403).json({ message: "You do not have permission to update this menu item." });
      }

      let updateSuccessful = false;
      // Iterate over categories directly since 'types' layer is removed
      for (let category of restaurant.categories) {
          let itemIndex = category.menuItems.findIndex(item => item._id.toString() === menuItemId);
          if (itemIndex !== -1) {
              // Update the menu item with new details from menuItemUpdates
              category.menuItems[itemIndex] = { ...category.menuItems[itemIndex]._doc, ...menuItemUpdates };
              updateSuccessful = true;
              break;
          }
      }

      if (!updateSuccessful) {
          return res.status(404).json({ message: "Menu item not found." });
      }

      restaurant.status = 'pending'; // Reset status to pending for approval
      await restaurant.save();
      res.status(200).json({ message: "Menu item updated successfully and pending approval.", restaurant });
  } catch (error) {
      console.error('Error updating menu item:', error);
      res.status(500).json({ message: "Error updating menu item.", error: error.message });
  }
};


  

exports.deleteRestaurant = async (req, res) => {
    try {
      await Restaurant.findByIdAndDelete(req.restaurant._id);
      res.status(200).json({ message: "Restaurant deleted successfully." });
    } catch (error) {
      res.status(500).json({ message: "Error deleting restaurant.", error: error.message });
    }
  };



// Function to verify the password
const verifyPassword = (inputPassword, savedHash, savedSalt) => {
  const inputHash = crypto.pbkdf2Sync(inputPassword, savedSalt, 1000, 64, 'sha512').toString('hex');
  return savedHash === inputHash;
};

// Function to generate a JWT token for an owner
const generateToken = (owner) => {
  return jwt.sign(
    { id: owner._id, role: owner.role },
    process.env.JWT_SECRET, // The secret should be in an environment variable
    { expiresIn: '4h' }
  );
};
  
exports.ownerLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
      const owner = await RestaurantOwner.findOne({ email }).select('+password +salt'); // Make sure password and salt are included in the result
  
      if (!owner) {
        return res.status(401).json({ message: 'Invalid credentialssssss.' });
      }
  
      // Check if salt is undefined
      if (!owner.salt) {
        return res.status(500).json({ message: "Salt not found for this user." });
      }
  
      if (verifyPassword(password, owner.password, owner.salt)) {
        // If the password matches, generate a JWT token for the owner
        const token = generateToken(owner);
  
        res.json({
          message: 'Logged in successfully',
          token: token, // Send the token to the client
          ownerId: owner._id,
          role: owner.role
        });
      } else {
        res.status(401).json({ message: 'Invalid credentials.' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };


// Assuming you have a route that handles this logic
exports.getRestaurantsWithinRadius = async (req, res) => {
  const { latitude, longitude } = req.query; // coordinates from which to calculate the distance
  const adminSettings = await AdminSettings.findOne(); // Retrieve settings

  try {
    const radius = adminSettings.restaurantRadius || 5; // Default radius to 5 km if not specified
    const restaurants = await Restaurant.find({
      status: 'approved', // Only fetch approved restaurants
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radius / 6378.1] // Convert radius to radians for $centerSphere
        }
      }
    });

    res.status(200).json(restaurants);
  } catch (error) {
    console.error('Error finding restaurants within radius:', error);
    res.status(500).json({ message: "Failed to retrieve restaurants", error: error.message });
  }
};
