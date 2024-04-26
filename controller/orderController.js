const Order = require('../model/Order');
const AdminSettings = require('../model/AdminSettings');
const axios = require('axios');

// Function to fetch delivery fee from Lalamove
async function fetchLalamoveDeliveryFee(orderId) {
    const response = await axios.get(`https://rest.sandbox.lalamove.com/v3/orders/${orderId}`);
    return response.data.priceBreakdown.total;
}

// Create an order
exports.createOrder = async (req, res) => {
    const { userId, restaurantId, items } = req.body;
    const adminSettings = await AdminSettings.findOne({}); // Assuming only one document exists

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const gst = subtotal * 0.07; // Assuming 7% GST
    const deliveryFee = await fetchLalamoveDeliveryFee(req.body.orderId); // Assuming orderId is provided

    // Check distance for additional fee
    const distance = req.body.distance; // Assuming distance is provided in the request
    const adminFee = distance > adminSettings.thresholdDistance ? adminSettings.additionalFee : 0;

    const order = new Order({
        user: userId,
        restaurant: restaurantId,
        items,
        total: subtotal,
        gst,
        deliveryFee,
        adminFee,
        grandTotal: subtotal + gst + deliveryFee + adminFee
    });

    try {
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Retrieve an order
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user').populate('restaurant');
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
