// middleware/ownerAuthMiddleware.js
const jwt = require('jsonwebtoken');
const RestaurantOwner = require('../model/restaurantOwnerModel'); // Update path as needed
const Restaurant = require('../model/restaurantModel'); // Update path as needed

const jwtSecret = process.env.JWT_SECRET; // Use environment variable for JWT_SECRET

const ownerAuthMiddleware = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1] || req.body.token;
  delete req.body.token; // Clean up token from the body if it was there

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const owner = await RestaurantOwner.findById(decoded.id);

    if (!owner) {
      return res.status(403).json({ message: 'Access denied. Owners only.' });
    }

    req.owner = owner; // Add the owner to the request object

    // If there's a restaurant ID in the request parameters, check if the owner matches
    if (req.params.id) {
      const restaurant = await Restaurant.findById(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found." });
      }

      if (restaurant.owner.toString() !== owner.id) {
        return res.status(403).json({ message: "You do not have permission to modify this restaurant." });
      }

      req.restaurant = restaurant; // Attach restaurant to the request object
    }

    next();
  } catch (error) {
    res.status(400).json({ message: 'Token is not valid', error });
  }
};

module.exports = ownerAuthMiddleware;
