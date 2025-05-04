const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { checkAuth } = require('../middleware/auth');

router.post('/register', registrationController.register);
router.post('/login', registrationController.login);
router.post('/logout', registrationController.logout);
router.put('/password', checkAuth, registrationController.updatePassword);
router.put('/profile', checkAuth, registrationController.updateProfile);

module.exports = router;