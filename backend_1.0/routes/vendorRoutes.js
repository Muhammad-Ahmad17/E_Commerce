const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { checkVendorAuth } = require('../middleware/vendorAuth');


router.get('/products', checkVendorAuth, vendorController.getMyProducts);
router.post('/products', checkVendorAuth, vendorController.addProduct);
router.put('/products/:id/quantity', checkVendorAuth, vendorController.updateProduct);
router.delete('/products/:id', checkVendorAuth, vendorController.deleteProduct);
router.get('/profile', checkVendorAuth, vendorController.getProfile);
router.get('/pending-orders', checkVendorAuth, vendorController.getPendingOrders);
router.get('/analytics', checkVendorAuth, vendorController.getAnalytics);

module.exports = router;
