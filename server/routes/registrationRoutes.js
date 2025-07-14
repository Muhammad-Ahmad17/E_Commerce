const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

router.post('/register', registrationController.register);
router.post('/login', registrationController.login);

module.exports = router;