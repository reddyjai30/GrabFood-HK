// models/restaurantOwnerModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const restaurantOwnerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'owner'
  },
  salt: { type: String, required: true }
  // You can add more fields as needed
});



const RestaurantOwner = mongoose.model('RestaurantOwner', restaurantOwnerSchema);

module.exports = RestaurantOwner;
