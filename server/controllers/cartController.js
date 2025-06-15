const Cart = require('../models/cart');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.getCart(req.user.buyerId);
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const result = await Cart.addToCart(req.user.buyerId, productId, quantity);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteFromCart = async (req, res) => {
  try {
    const { productId } = req.body; // or req.params if you prefer
    const result = await Cart.deleteFromCart(req.user.buyerId, productId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.checkout = async (req, res) => {
  try {
    const result = await Cart.checkout(req.user.buyerId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};