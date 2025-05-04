const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const vendorController = require('../controllers/vendorController');

router.get('/profile', authenticateJWT, vendorController.getProfile);
router.get('/products', authenticateJWT, vendorController.getMyProducts);
router.post('/product', authenticateJWT, vendorController.addProduct);
router.put('/product', authenticateJWT, vendorController.updateProduct);
router.delete('/product', authenticateJWT, vendorController.deleteProduct);
router.get('/pending-orders', authenticateJWT, vendorController.getPendingOrders);
router.get('/analytics', authenticateJWT, vendorController.getAnalytics);

module.exports = router;