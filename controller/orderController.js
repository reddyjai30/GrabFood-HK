const Order = require('../model/Order');
const stripe = require('../config/stripeConfig');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const CryptoJS = require('crypto-js');




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
          let totalQuantity = itemsArray.reduce((acc, item) => acc + item.quantity, 0); // Calculate total quantity

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

          // Call Lalamove Quotation API
          const lalamoveApiKey = 'pk_test_17d72ce20ccd65cde241e2da9b07d8c1';
          const lalamoveSecret = 'sk_test_ZOnyEK2o6dF2j31lF2KcEY/PdyD7FyWDNhoT71lkEqKloq6hrnATroxedNhiuxui'; // Replace with your Lalamove secret
          const market = 'HK';
          const timestamp = new Date().getTime();

          const lalamoveBody = {
            "data": {
              "serviceType": "MOTORCYCLE",
              "specialRequests": ["PURCHASE_SERVICE_1"],
              "language": "en_HK",
              "stops": [
                {
                  "coordinates": {
                    "lat": "22.33547351186244",
                    "lng": "114.17615807116502"
                  },
                  "address": "test1 location1"
                },
                {
                  "coordinates": {
                    "lat": "22.29553167157697",
                    "lng": "114.16885175766998"
                  },
                  "address": "test1 location2"
                }
              ],
              "isRouteOptimized": true,
              "item": {
                "quantity": totalQuantity.toString(),
                "weight": "LESS_THAN_3_KG",
                "categories": [
                  "FOOD_DELIVERY",
                  "OFFICE_ITEM"
                ],
                "handlingInstructions": [
                  "KEEP_UPRIGHT"
                ]
              },
            }
          };

          const bodyString = JSON.stringify(lalamoveBody);
          console.log('Lalamove Quotation Body:', bodyString); // Log the body for debugging
          const signature = CryptoJS.HmacSHA256(`${timestamp}\r\nPOST\r\n/v3/quotations\r\n\r\n${bodyString}`, lalamoveSecret);

          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `hmac ${lalamoveApiKey}:${timestamp}:${signature}`,
            'Market': market
          };

          try {
            const response = await axios.post('https://rest.sandbox.lalamove.com/v3/quotations', lalamoveBody, { headers });
            const quotationId = response.data.data.quotationId;
            const stops = response.data.data.stops; // Get stops from the quotation response
            console.log('Lalamove Quotation API response:', response.data);

            // Call Lalamove Place Order API
            const placeOrderBody = {
              "data": {
                "quotationId": quotationId,
                "sender": {
                  "stopId": stops[0].stopId, // Use the stopId from the stops array
                  "name": "Michal",
                  "phone": "+85238485765"
                },
                "recipients": [
                  {
                    "stopId": stops[1].stopId, // Use the stopId from the stops array
                    "name": "Katrina",
                    "phone": "+85238485696",
                    "remarks": "YYYYYY" // optional
                  }
                ],
                "isPODEnabled": true, // optional
                "partner": "Lalamove Partner 1" // optional 
              }
            };

            const placeOrderBodyString = JSON.stringify(placeOrderBody);
            console.log('Lalamove Place Order Body:', placeOrderBodyString); // Log the body for debugging
            const placeOrderSignature = CryptoJS.HmacSHA256(`${timestamp}\r\nPOST\r\n/v3/orders\r\n\r\n${placeOrderBodyString}`, lalamoveSecret);

            const placeOrderHeaders = {
              'Content-Type': 'application/json',
              'Authorization': `hmac ${lalamoveApiKey}:${timestamp}:${placeOrderSignature}`,
              'Market': market
            };

            try {
              const placeOrderResponse = await axios.post('https://rest.sandbox.lalamove.com/v3/orders', placeOrderBody, { headers: placeOrderHeaders });
              console.log('Lalamove Place Order API response:', placeOrderResponse.data);

              // Update the order in the database with Lalamove order details
              newOrder.lalamoveOrderId = placeOrderResponse.data.data.orderId;
              newOrder.quotationId = placeOrderResponse.data.data.quotationId;
              newOrder.priceBreakdown = placeOrderResponse.data.data.priceBreakdown;
              newOrder.driverId = placeOrderResponse.data.data.driverId;
              newOrder.shareLink = placeOrderResponse.data.data.shareLink;
              newOrder.lalamoveStatus = placeOrderResponse.data.data.status;
              
              await newOrder.save();
              console.log('Lalamove order details saved:', newOrder._id);

              resolve({ message: "Payment successful, order saved, and Lalamove order placed.", orderId: newOrder._id });
            } catch (placeOrderError) {
              console.error('Error calling Lalamove Place Order API:', placeOrderError.response?.data || placeOrderError.message);
              reject(placeOrderError);
            }
          } catch (error) {
            console.error('Error calling Lalamove Quotation API:', error.response?.data || error.message);
            reject(error);
          }
        }
      } catch (error) {
        console.error(`Error retrieving session ${sessionId}:`, error);
        clearInterval(interval);
        reject(error);
      }
    }, 5000); // Check every 5 second
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
        extraCharges, // Include extraCharges in the response
        grandTotal
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
