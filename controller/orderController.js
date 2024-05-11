// const Order = require('../model/Order');
// const stripe = require('../config/stripeConfig'); // Make sure you have configured Stripe

// Function to calculate total and initiate payment
exports.calculateTotalAndInitiatePayment = async (req, res) => {
  try {
    const { items, userId, restaurantOwnerId, restaurantId, extraCharges } = req.body;
    
    // Calculate totals
    let itemTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let GST = itemTotal * 0.10; // 10% GST
    let CGST = itemTotal * 0.05; // 5% CGST
    let grandTotal = itemTotal + GST + CGST + extraCharges;

    // Create a Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(grandTotal * 100), // Stripe requires the amount in cents
      currency: 'usd',
      metadata: {
        orderFor: restaurantId,
        orderedBy: userId,
        restaurantOwner: restaurantOwnerId
      }
    });

    // Save the order details in the database
    const newOrder = new Order({
      userId,
      restaurantOwnerId,
      restaurantId,
      items,
      total: itemTotal,
      GST,
      CGST,
      grandTotal
    });

    await newOrder.save();

    res.status(201).json({
      message: "Total calculated and payment initiated successfully",
      clientSecret: paymentIntent.client_secret,
      orderDetails: {
        total: itemTotal,
        GST,
        CGST,
        grandTotal
      }
    });
  } catch (error) {
    console.error('Error processing payment or saving order:', error);
    res.status(500).json({ message: 'Failed to process payment and save order', error: error.message });
  }
};


const Order = require('../model/Order');
const stripe = require('../config/stripeConfig');

exports.processPaymentAndStoreOrder = async (req, res) => {
  const { paymentIntentId, userId, restaurantId, items, total, GST, CGST, grandTotal } = req.body;

  try {
    // Attempt to confirm the payment intent
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Create and save the order in the database after successful payment
      const newOrder = new Order({
        userId,
        restaurantId,
        items,
        total,
        GST,
        CGST,
        grandTotal,
        paymentStatus: 'Paid'
      });

      await newOrder.save();

      // Optionally, generate an invoice here or send a confirmation email

      res.status(201).json({
        message: 'Payment successful and order stored',
        orderDetails: {
          total,
          GST,
          CGST,
          grandTotal
        }
      });
    } else {
      res.status(400).json({ message: 'Payment failed' });
    }
  } catch (error) {
    console.error('Payment or database error:', error);
    res.status(500).json({ message: 'Failed to process payment and store order', error: error.message });
  }
};


exports.createpaymentintent = async (req, res) => {
  const { amount, restaurantId, userId, menuItemId, menuItemName } = req.body;

  try {
      // Convert amount to cents for Stripe processing
      const paymentIntent = await stripe.paymentIntents.create({
          amount: amount * 100, // Assuming amount is in dollars for simplicity
          currency: 'usd',
          metadata: { restaurantId, userId, menuItemId, menuItemName },
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never'  // Ensure that no redirect-based payment methods are used
          }
      });

      res.status(201).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
      console.error('Payment Intent API error:', error);
      res.status(500).json({ error: error.message });
  }
};
