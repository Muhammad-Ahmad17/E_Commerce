const Vendor = require('../models/vendor');

exports.getProfile = async (req, res) => {
  try {
    const profile = await Vendor.getProfile(req.user.vendorId);
    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const products = await Vendor.getMyProducts(req.user.vendorId);
    res.json(products);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const result = await Vendor.addProduct(req.user.vendorId, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const result = await Vendor.updateProduct(req.user.vendorId, productId, quantity);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const result = await Vendor.deleteProduct(req.user.vendorId, productId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPendingOrders = async (req, res) => {
  try {
    const orders = await Vendor.getPendingOrders(req.user.vendorId);
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const analytics = await Vendor.getAnalytics(req.user.vendorId);
    res.json(analytics);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.markOrderAsDelivered = async (req, res) => {    
  try {
    const { orderId } = req.body;
    const result = await Vendor.markOrderAsDelivered(orderId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
