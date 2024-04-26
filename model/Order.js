const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: [{
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true } // price at the time of order
    }],
    total: Number, // Sum of items' prices
    gst: Number, // GST calculated on the total
    deliveryFee: Number, // Delivery fee fetched from Lalamove
    adminFee: Number, // Additional charge if applicable
    grandTotal: Number // Final total including all charges
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
