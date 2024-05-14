const stripe = require('../config/stripeConfig');
const Order = require('../model/Order');

exports.checkPaymentStatus = async (req, res) => {
  const { sessionId } = req.body;

  try {
    // Retrieve the Checkout Session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Check the payment status
    const paymentStatus = session.payment_status;

    if (paymentStatus === 'paid') {
      // Retrieve metadata
      const { userId, restaurantOwnerId, restaurantId, items, extraCharges } = session.metadata;

      // Parse items back to array
      const itemsArray = JSON.parse(items);

      // Calculate totals again if needed
      let itemTotal = itemsArray.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      let GST = itemTotal * 0.10; // 10% GST
      let CGST = itemTotal * 0.05; // 5% CGST
      let grandTotal = itemTotal + GST + CGST + parseFloat(extraCharges);

      // Save the order details in the database
      const newOrder = new Order({
        userId,
        restaurantOwnerId,
        restaurantId,
        items: itemsArray,
        total: itemTotal,
        GST,
        CGST,
        extraCharges: parseFloat(extraCharges),
        grandTotal,
        status: 'Paid',
        paymentConfirmed: true,
        paymentIntentId: session.payment_intent
      });

      await newOrder.save();
      console.log('Payment succeeded and order saved:', newOrder._id);
    }

    res.status(200).json({ paymentStatus });
  } catch (error) {
    console.error(`Error retrieving session ${sessionId}:`, error);
    res.status(500).json({ error: error.message });
  }
};
