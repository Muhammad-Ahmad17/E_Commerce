const Buyer = require('../models/Buyer');

// Recommended products based on preferences
exports.getRecommendedProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const products = await Buyer.getRecommendedProducts(userId);
    if (!products.length) {
      return res.status(404).json({ message: 'No recommended products found' });
    }
    res.json(products);
  } catch (error) {
    console.error('Error fetching recommended products:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Selected products based on category
exports.getSelectedProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const category = req.query.category; // hardcode 
    console.log('Category:', category); // Debugging line to check the category value
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }
    const products = await Buyer.getSelectedProducts(userId, category);
    if (!products.length) {
      return res.status(404).json({ message: 'No products found for this category' });
    }
    res.json(products);
  } catch (error) {
    console.error('Error fetching selected products:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Product details by ID
exports.getProductDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id; // from frontend on product click get id
    const product = await Buyer.getProductDetails(userId, productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product details:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Buyer profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await Buyer.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// View cart
exports.viewCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Buyer.getCart(userId);
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Order history
exports.getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Buyer.getOrderHistory(userId);
    if (!orders.length) {
      return res.status(404).json({ message: 'No orders found' });
    }
    res.json(orders);
  } catch (error) {
    console.error('Error fetching order history:', error.message);
    res.status(500).json({ error: error.message });
  }
};