const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { checkBuyerAuth } = require('../middleware/buyerAuth');

router.get('/', checkBuyerAuth, cartController.getCart);
router.post('/', checkBuyerAuth, cartController.addToCart);
router.delete('/:cartItemId', checkBuyerAuth, cartController.deleteFromCart);
router.post('/checkout', checkBuyerAuth, cartController.checkout);

module.exports = router;
