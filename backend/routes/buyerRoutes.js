const express = require('express');
const router = express.Router();
const buyerController = require('../controllers/buyerController');
const { checkBuyerAuth } = require('../middleware/buyerAuth');

router.get('/recommended', checkBuyerAuth, buyerController.getRecommendedProducts);
router.get('/products', checkBuyerAuth, buyerController.getSelectedProducts);
router.get('/product/:id', checkBuyerAuth, buyerController.getProductDetails);
router.get('/profile', checkBuyerAuth, buyerController.getProfile);
router.get('/cart', checkBuyerAuth, buyerController.viewCart);
router.get('/orders', checkBuyerAuth, buyerController.getOrderHistory);

module.exports = router;