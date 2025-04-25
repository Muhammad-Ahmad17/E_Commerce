// Routes for vendor APIs
const express = require('express');
const { getPendingOrders } = require('../controllers/vendorController');

const router = express.Router();

// Get pending orders for vendor
router.get('/orders/pending', getPendingOrders);

module.exports = router;