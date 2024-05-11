const Restaurant = require('../model/restaurantModel');
const User = require('../model/userModel');
const RestaurantOwner = require('../model/restaurantOwnerModel'); // Adjust path as needed
const  {sendMail}  = require('../utils/mail');
const AdminSettings = require('../model/AdminSettings');
const bcrypt = require('bcryptjs');

const crypto = require('crypto');

//admin settings
exports.setAdminSettings = async (req, res) => {
  const { distanceLimitKm, extraChargePerKm, restaurantRadius } = req.body;  // Include restaurantRadius in the destructuring
  try {
    const settings = new AdminSettings({ distanceLimitKm, extraChargePerKm, restaurantRadius });  // Pass restaurantRadius to the settings
    await settings.save();
    res.status(201).json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings', error: error.message });
  }
};



function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

// Register a restaurant owner
exports.registerRestaurantOwner = async (req, res) => {
  try {
    const { email, password } = req.body;
    let owner = await RestaurantOwner.findOne({ email });

    if (owner) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  
    owner = new RestaurantOwner({ email, password: hash, salt });
    await owner.save();

    const ownerName = 'John Doe'; // The restaurant owner's name
    const restaurantName = 'John\'s BBQ'; // The restaurant's name
    const appLink = 'https://dummylink.com/app'; // Dummy link to the app 
    const yourName = 'Admin GrabFood'; // Your name
    const companyName = 'GrabFood Hk'; // Your company's name
    const contactInfo = 'GrabFood@gmail.com'; // Your contact information
    const emailToSend = req.body.email;
    

    await sendMail(emailToSend, password, ownerName,restaurantName, appLink, yourName, companyName,contactInfo, email);

    res.status(201).json({ message: 'Restaurant owner registered successfully and email sent.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering restaurant owner.', error: error.message });
  }
};

// Create a new restaurant
// Create a new restaurant
exports.createRestaurant = async (req, res) => {
    const { owner, name, locationCoordinates, type, categories, menuItems, rating, deliveryTime, minimumOrder } = req.body;
    
    try {
        // Ensure all required fields are provided
        if (!owner || !name || !locationCoordinates || !type || !categories || !menuItems) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const newRestaurant = await Restaurant.create({
            owner,
            name,
            location: {
                type: 'Point',
                coordinates: [locationCoordinates.longitude, locationCoordinates.latitude],
            },
            type,
            categories, // Assuming categories is an array of strings
            menuItems, // Assuming menuItems is an array of menuItem objects
            rating, // Optional: You might want this to be calculated from user reviews
            deliveryTime, // Optional: This might be calculated based on location
            minimumOrder // Optional: This can be a fixed value or based on other business logic
        });
        
        res.status(201).json(newRestaurant);
    } catch (error) {
        console.error('Error creating new restaurant:', error);
        res.status(500).json({ message: "Failed to add restaurant", error: error.message });
    }
};


// Get all restaurants
exports.getAllRestaurants = async (req, res) => {
    const { location, cuisine, rating, deliveryTime, minimumOrder, category } = req.query;
    let query = {};
    
    if (location) {
      // Add geospatial filtering based on the 'location' query parameter
    }
    if (cuisine) {
      query.type = cuisine;
    }
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }
    if (deliveryTime) {
      query.deliveryTime = deliveryTime;
    }
    if (minimumOrder) {
      query.minimumOrder = { $lte: Number(minimumOrder) };
    }
    if (category) {
      query.categories = { $in: [category] }; // Assuming 'categories' is an array in the schema
    }
    
    try {
        const restaurants = await Restaurant.find(query).populate('owner');
        res.json(restaurants.map(restaurant => ({
            ...restaurant.toJSON(),
            menuItems: restaurant.menuItems.filter(item => 
                !category || item.category === category),
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to retrieve restaurants", error: error.message });
    }
};

// Get a single restaurant by ID
exports.getRestaurantById = async (req, res) => {
    const { id } = req.params;
    try {
        const restaurant = await Restaurant.findById(id).populate('owner');
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        res.json(restaurant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to retrieve restaurant", error: error.message });
    }
};

// Update a restaurant
exports.updateRestaurant = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedRestaurant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update restaurant", error: error.message });
    }
};

// Delete a restaurant
exports.deleteRestaurant = async (req, res) => {
    const { id } = req.params;
    try {
        await Restaurant.findByIdAndDelete(id);
        res.json({ message: "Restaurant successfully deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete restaurant", error: error.message });
    }
};

exports.listPendingRestaurants = async (req, res) => {
    try {
      const pendingRestaurants = await Restaurant.find({ status: 'pending' });
      res.json(pendingRestaurants);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to retrieve pending restaurants", error: error.message });
    }
  };
  
exports.approveRestaurant = async (req, res) => {
    const { id } = req.params;
    try {
      const restaurant = await Restaurant.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found or already approved." });
      }
      res.status(200).json({ message: "Restaurant approved successfully.", restaurant });
    } catch (error) {
      res.status(500).json({ message: "Error approving restaurant.", error: error.message });
    }
  };
  
exports.rejectRestaurant = async (req, res) => {
    const { id } = req.params;
    try {
      const restaurant = await Restaurant.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found or already rejected." });
      }
      res.status(200).json({ message: "Restaurant rejected successfully.", restaurant });
    } catch (error) {
      res.status(500).json({ message: "Error rejecting restaurant.", error: error.message });
    }
  };



// Function to disable a restaurant
exports.disableRestaurant = async (req, res) => {
  const { restaurantId } = req.params; // ID of the restaurant to disable
  try {
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
          return res.status(404).json({ message: "Restaurant not found." });
      }
      if (restaurant.status !== 'approved') {
          return res.status(400).json({ message: "Restaurant is not in an approved state." });
      }
      restaurant.status = 'pending';
      await restaurant.save();
      res.status(200).json({ message: "Restaurant has been disabled and set to pending.", restaurant });
  } catch (error) {
      console.error('Error disabling the restaurant:', error);
      res.status(500).json({ message: "Failed to disable restaurant", error: error.message });
  }
};
