//vendor controller
// my products
// add product
// update product
// delete product
// vendor profile
// pending orders
// vendor analytics


const Vendor = require('../models/Vendor');

// Get all products of the vendor
exports.getMyProducts = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const products = await Vendor.getMyProducts(vendorId);
    if (!products.length) {
      return res.status(404).json({ message: 'No products found' });
    }
    res.json(products);
  } catch (error) {
    console.error('Error fetching vendor products:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { name, price, description, stock_quantity, category_name, sub_category_name, image_url } = req.body;
    if (!name || !price || !stock_quantity || !category_name || !sub_category_name) {
      return res.status(400).json({ message: 'Name, price, stock_quantity, category_name, and sub_category_name are required' });
    }
    const product = await Vendor.addProduct(vendorId, { 
      name, 
      price, 
      description, 
      stock_quantity, 
      category_name, 
      sub_category_name, 
      image_url 
    });
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    console.error('Error adding product:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Update an existing product (only quantity)
exports.updateProduct = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const productId = req.params.id;
    const { stock_quantity } = req.body;
    if (stock_quantity === undefined) {
      return res.status(400).json({ message: 'stock_quantity is required' });
    }
    const product = await Vendor.updateProduct(vendorId, productId, stock_quantity);
    if (!product) {
      return res.status(404).json({ message: 'Product not found or not owned by vendor' });
    }
    res.json({ message: 'Product quantity updated successfully', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const productId = req.params.id;
    const product = await Vendor.deleteProduct(vendorId, productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found or not owned by vendor' });
    }
    res.json({ message: 'Product deleted successfully', product });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get vendor profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // userid == vendor id
    console.log('UserID from token:', userId);
    const profile = await Vendor.getProfile(userId);
    console.log('UserID from token:', req.user.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching vendor profile:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get pending orders
exports.getPendingOrders = async (req, res) => {
  try {
    const vendorId = req.user.id;
    console.log('Vendor ID from token:', vendorId);
    const orders = await Vendor.getPendingOrders(vendorId);
    if (!orders.length) {
      return res.status(404).json({ message: 'No pending orders found' });
    }
    res.json(orders);
  } catch (error) {
    console.error('Error fetching pending orders:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get vendor analytics
exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;  // userid == vendor id
    console.log('UserID from token:', userId);
    const analytics = await Vendor.getAnalytics(userId);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};