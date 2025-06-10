const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const buyerController = require('../controllers/buyerController');

router.get('/profile', authenticateJWT, buyerController.getProfile);
router.get('/recommended', authenticateJWT, buyerController.getRecommendedProducts);
router.get('/selected', authenticateJWT, buyerController.getSelectedProducts);
router.get('/product/:productId', authenticateJWT, buyerController.getProductDetails);
router.get('/orders', authenticateJWT, buyerController.getOrderHistory);
router.post('/addReview', authenticateJWT, buyerController.addReview);
router.get('/getReviews/:productId', authenticateJWT, buyerController.getReviews);
module.exports = router;
