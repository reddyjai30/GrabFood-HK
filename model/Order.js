const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: mongoose.Schema.Types.ObjectId,
  name: String,
  price: Number
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'RestaurantOwner', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [orderItemSchema],
  total: Number,
  GST: Number,
  CGST: Number,
  grandTotal: Number
});

module.exports = mongoose.model('Order', orderSchema);
