// const mongoose = require('mongoose');

// const orderItemSchema = new mongoose.Schema({
//   menuItemId: mongoose.Schema.Types.ObjectId,
//   name: String,
//   price: Number
// });

// const orderSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   restaurantOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'RestaurantOwner', required: true },
//   restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
//   items: [orderItemSchema],
//   total: Number,
//   GST: Number,
//   CGST: Number,
//   grandTotal: Number
// });

// module.exports = mongoose.model('Order', orderSchema);




const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RestaurantOwner',
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [
    {
      menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  total: { type: Number, required: true },
  GST: { type: Number, required: true },
  CGST: { type: Number, required: true },
  extraCharges: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  paymentConfirmed: { type: Boolean, default: false },
  paymentIntentId: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
