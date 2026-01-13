const Buyer = require('../models/buyer');

exports.getProfile = async (req, res) => {
  try {
    const profile = await Buyer.getProfile(req.user.buyerId);//
    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getRecommendedProducts = async (req, res) => {

  try {
    const products = await Buyer.getRecommendedProducts(req.user.buyerId);//
    res.json(products);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getSelectedProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const products = await Buyer.getSelectedProducts(category);
    res.json(products);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getProductSearch = async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const products = await Buyer.getProductSearch(searchTerm);
    res.json(products);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Buyer.getProductDetails(Number(productId));
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.getOrderHistory = async (req, res) => {
  try {
    const orders = await Buyer.getOrderHistory(req.user.buyerId);
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body; 
    const result = await Buyer.addReview(req.user.buyerId, productId, rating, comment); 
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  } 
};
exports.getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Buyer.getReviews(Number(productId));
    res.json(reviews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}