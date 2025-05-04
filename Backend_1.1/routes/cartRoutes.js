const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const cartController = require('../controllers/cartController');

router.get('/', authenticateJWT, cartController.getCart);
router.post('/add', authenticateJWT, cartController.addToCart);
router.delete('/delete', authenticateJWT, cartController.deleteFromCart);
router.post('/checkout', authenticateJWT, cartController.checkout);

module.exports = router;