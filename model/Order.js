// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   restaurantOwnerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'RestaurantOwner',
//     required: true
//   },
//   restaurantId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Restaurant',
//     required: true
//   },
//   items: [
//     {
//       menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
//       name: { type: String, required: true },
//       price: { type: Number, required: true },
//       quantity: { type: Number, required: true }
//     }
//   ],
//   total: { type: Number, required: true },
//   GST: { type: Number, required: true },
//   CGST: { type: Number, required: true },
//   extraCharges: { type: Number, required: true },
//   grandTotal: { type: Number, required: true },
//   status: { type: String, default: 'Pending' },
//   paymentConfirmed: { type: Boolean, default: false },
//   paymentIntentId: String
// }, { timestamps: true });

// module.exports = mongoose.model('Order', orderSchema);




const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [
    {
      menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
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
  status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
  paymentConfirmed: { type: Boolean, default: false },
  paymentIntentId: { type: String, required: true },
  lalamoveOrderId: { type: String },
  quotationId: { type: String },
  priceBreakdown: {
    base: { type: String },
    surcharge: { type: String },
    specialRequests: { type: String },
    totalExcludePriorityFee: { type: String },
    total: { type: String },
    currency: { type: String }
  },
  driverId: { type: String },
  shareLink: { type: String },
  lalamoveStatus: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
