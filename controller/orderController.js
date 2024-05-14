const Order = require('../model/Order');
const stripe = require('../config/stripeConfig');
const jwt = require('jsonwebtoken');


const checkPaymentStatusPeriodically = (sessionId, metadata) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        console.log(`Checking payment status for session ${sessionId}: ${session.payment_status}`);

        if (session.payment_status === 'paid') {
          clearInterval(interval);
          const { userId, restaurantOwnerId, restaurantId, items, extraCharges } = metadata;

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
            grandTotal,
            extraCharges: parseFloat(extraCharges),
            status: 'Paid',
            paymentConfirmed: true,
            paymentIntentId: session.payment_intent
          });

          await newOrder.save();
          console.log('Payment succeeded and order saved:', newOrder._id);
          resolve({ message: "Payment successful and order saved.", orderId: newOrder._id });
        }
      } catch (error) {
        console.error(`Error retrieving session ${sessionId}:`, error);
        clearInterval(interval);
        reject(error);
      }
    }, 5000); // Check every 1 second
  });
};

exports.calculateTotalAndInitiatePayment = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  try {
    const { items, restaurantOwnerId, restaurantId, extraCharges } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Calculate totals
    let itemTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let GST = itemTotal * 0.10; // 10% GST
    let CGST = itemTotal * 0.05; // 5% CGST
    let grandTotal = itemTotal + GST + CGST + extraCharges;

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map(item => {
        let totalItemPrice = item.price * item.quantity;
        let itemGST = totalItemPrice * 0.10;
        let itemCGST = totalItemPrice * 0.05;
        let itemExtraCharge = (totalItemPrice / itemTotal) * extraCharges;
        let finalItemPrice = totalItemPrice + itemGST + itemCGST + itemExtraCharge;

        return {
          price_data: {
            currency: 'inr',
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(finalItemPrice * 100),
          },
          quantity: 1,
        };
      }),
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
      metadata: {
        userId: userId,
        restaurantOwnerId: restaurantOwnerId,
        restaurantId: restaurantId,
        items: JSON.stringify(items),
        extraCharges: extraCharges.toString()
      }
    });

    // Respond immediately with session details
    res.json({
      message: "Checkout session created successfully",
      sessionId: session.id,
      url: session.url,
      orderDetails: {
        total: itemTotal,
        GST,
        CGST,
        grandTotal,
        extraCharges // Add extraCharges to the response
      }
    });

    // Start checking payment status periodically after responding
    try {
      const result = await checkPaymentStatusPeriodically(session.id, session.metadata);
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.error('Error initiating Stripe Checkout session:', error);
    res.status(500).json({ message: 'Failed to initiate payment', error: error.message });
  }
};