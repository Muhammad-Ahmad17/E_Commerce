
const Cart = require('../models/Cart');

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.getCart(userId);
    if (!cart.length) {
      return res.status(404).json({ message: 'Cart is empty' });
    }
    res.json({ message: 'Cart fetched successfully', cart });
  } catch (error) {
    console.error('Error fetching cart:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;
    if (!product_id || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Product ID and valid quantity are required' });
    }
    const result = await Cart.addToCart(userId, product_id, quantity);
    res.json(result);
  } catch (error) {
    console.error('Error adding to cart:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;
    // how cartitem id is passed in the request params
    // e.g., DELETE /cart/:cartItemId
    // where :cartItemId represents the dynamic part of the URL
    // and will be available in req.params.cartItemId
    // e.g., req.params.cartItemId will contain the value of cartItemId
    // e.g., req.params.cartItemId = 123

    if (!cartItemId) {
      return res.status(400).json({ message: 'Cart Item ID is required' });
    }
    const result = await Cart.deleteFromCart(userId, parseInt(cartItemId));
    res.json(result);
  } catch (error) {
    console.error('Error deleting from cart:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.checkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shipping_address_id } = req.body;
    if (!shipping_address_id) {
      return res.status(400).json({ message: 'Shipping address ID is required' });
    }
    const orderDetails = await Cart.checkout(userId, shipping_address_id);
    res.json({ message: 'Checkout successful', orderDetails });
  } catch (error) {
    console.error('Error during checkout:', error.message);
    res.status(500).json({ error: error.message });
  }
};
