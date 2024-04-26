const mongoose = require('mongoose');

// MenuItem Schema
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  image: { type: String },  // Image URL stored here
  key: {type: String}
});

// Category Schema
const categorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true }, // Main category of food
  menuItems: [menuItemSchema]  // Direct list of menu items under each category
});

// Restaurant Schema
const restaurantSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending', // Initial status of the restaurant upon creation
  },
  name: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number], // Format: [longitude, latitude]
      index: '2dsphere' // Geospatial indexing for efficient querying
    }
  },
  cuisineType: { type: String, required: true }, // Overall cuisine type of the restaurant
  categories: [categorySchema], // Food categories and their corresponding menu items
  rating: { type: Number, default: 0 },
  deliveryTime: String,
  minimumOrder: Number,
}, { timestamps: true });

// Creating text index for menu item name
restaurantSchema.index({ "categories.menuItems.name": "text" });

module.exports = mongoose.model('Restaurant', restaurantSchema);
