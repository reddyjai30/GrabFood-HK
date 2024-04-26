const express = require('express');
const cartController = require('../controller/cartController'); // Adjust the path as needed
const { authMiddleware } = require('../middleware/authMiddleware'); // Adjust the path as needed


const router = express.Router();

router.get('/test', (req, res) => res.send('Test route working'));
router.get('/cart', authMiddleware, cartController.getCart);
// Add item to cart route
router.post('/cart/add-item', authMiddleware, cartController.addItemToCart);



// Update an item's quantity in the cart
router.put('/cart/item/:itemId', authMiddleware, cartController.updateCartItem);

// Remove an item from the cart
router.delete('/cart/item/:itemId', authMiddleware, cartController.removeCartItem);

// Clear the entire cart
router.delete('/cart', authMiddleware, cartController.clearCart);

module.exports = router;
