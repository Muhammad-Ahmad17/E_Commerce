// Routes for cart APIs
const express = require('express');
const { addToCart } = require('../controllers/cartController');

const router = express.Router();

// Add item to cart
router.post('/add', addToCart);

module.exports = router;