const Cart = require('../model/Cart');
const Restaurant = require('../model/restaurantModel'); // Adjusted to use your Restaurant model


exports.addItemToCart = async (req, res) => {
    const userId = req.user.id;
    const { restaurantId, menuItemId, quantity } = req.body;

    try {
        let restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(400).json({ message: 'Restaurant not found.' });
        }
        
        const menuItem = restaurant.menuItems.id(menuItemId);
        if (!menuItem) {
            return res.status(400).json({ message: 'Menu item not found.' });
        }
        
        let cart = await Cart.findOne({ userId });
        
        if (cart && cart.restaurantId.toString() !== restaurantId.toString()) {
            return res.status(400).json({ message: "You can't add items from different restaurants in one cart." });
        }

        if (!cart) {
            // Create new cart if not exists
            cart = new Cart({ userId, restaurantId, items: [{ menuItemId, quantity, price: menuItem.price }] });
        } else {
            // Update cart with new item
            const itemIndex = cart.items.findIndex(item => item.menuItemId.toString() === menuItemId.toString());
            if (itemIndex > -1) {
                // Update quantity if item exists
                cart.items[itemIndex].quantity += quantity;
            } else {
                // Push new item if not exists
                cart.items.push({ menuItemId, quantity, price: menuItem.price });
            }
        }
        
        // Recalculate cart totals
        let subtotal = 0;
        cart.items.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        
        const TAX_RATE = 0.08; // 8% tax
        const SERVICE_FEE = 0.02; // 2% service fee
        cart.subtotal = subtotal;
        cart.taxes = subtotal * TAX_RATE;
        cart.fees = subtotal * SERVICE_FEE;
        cart.total = subtotal + cart.taxes + cart.fees;
        
        await cart.save();
        
        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding item to cart", error: error.message });
    }
};


// Update item quantity in the cart
exports.updateCartItem = async (req, res) => {
    const userId = req.user.id; // Extracted by authMiddleware from JWT
    const itemId = req.params.itemId; // Get the item ID from the URL parameter
    const { quantity } = req.body; // Get the new quantity from the request body

    try {
        // Find the cart that belongs to the user
        let cart = await Cart.findOne({ userId }).exec();
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        // Find the item in the cart
        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart.' });
        }

        // Update the quantity of the item
        cart.items[itemIndex].quantity = quantity;

        // Save the updated cart
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating item quantity", error: error.message });
    }
};

  
  // Remove item from the cart
  exports.removeCartItem = async (req, res) => {
    const userId = req.user.id;
    const itemId = req.params.itemId; // Ensure itemId is passed from frontend
  
    try {
      let cart = await Cart.findOne({ userId });
  
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found.' });
      }
  
      cart.items = cart.items.filter(item => item._id.toString() !== itemId);
  
      await cart.save();
      res.status(200).json(cart);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error removing item from cart", error: error.message });
    }
  };
  
  // Clear the cart
  exports.clearCart = async (req, res) => {
    const { userId } = req.body;
  
    try {
      let cart = await Cart.findOne({ userId });
  
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found.' });
      }
  
      cart.items = []; // Clear all items
  
      await cart.save();
      res.status(200).json(cart);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error clearing cart", error: error.message });
    }
  };
  exports.getCart = async (req, res) => {
    const userId = req.user.id; // Assuming you're extracting the userId from the JWT token in the auth middleware
  
    try {
      const cart = await Cart.findOne({ userId });
  
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found.' });
      }
  
      res.json(cart);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error retrieving cart", error: error.message });
    }
  };
  

// Additional methods to update quantity, remove items, etc., would be similar in structure
