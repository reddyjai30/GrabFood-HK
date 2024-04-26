const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity can not be less then 1.'],
    default: 1
  },
  price: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [cartItemSchema],
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
  },
  subtotal: Number, // Sum of price * quantity for all items
  taxes: Number, // Calculated as a percentage of subtotal
  fees: Number, // Additional fees, could also be a percentage of subtotal
  total: Number, // Subtotal + taxes + fees
}, {
  timestamps: true,
});

module.exports = mongoose.model('Cart', cartSchema);
