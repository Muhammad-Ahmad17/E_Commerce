const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const vendorController = require('../controllers/vendorController');

router.get('/profile', authenticateJWT, vendorController.getProfile);
router.get('/products', authenticateJWT, vendorController.getMyProducts);
router.post('/addProduct', authenticateJWT, vendorController.addProduct);
router.put('/updateProduct', authenticateJWT, vendorController.updateProduct);
router.delete('/deleteProduct', authenticateJWT, vendorController.deleteProduct);
router.get('/pendingOrders', authenticateJWT, vendorController.getPendingOrders);
router.get('/analytics', authenticateJWT, vendorController.getAnalytics);

module.exports = router;