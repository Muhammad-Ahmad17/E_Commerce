const Registration = require('../models/registeration');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    // Explicitly pick allowed fields
    const {
      fullName, email, password, preferences,
      addressLine1, city, postalCode, country, isDefault, vendorName, role
    } = req.body;

    // Basic validation
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Build userData object
    const userData = {
      fullName, email, password: hashedPassword, preferences,
      addressLine1, city, postalCode, country,
      isDefault: isDefault ?? 1, vendorName, role
    };

    const result = await Registration.register(userData);
    res.status(201).json(result);
  } catch (error) {
    // 500 for server errors, 400 for known user errors
    const status = error.message && error.message.toLowerCase().includes('invalid') ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    // Fetch user from DB
    const user = await Registration.login(email);

    // Compare password hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid email or password');

    // Fetch buyerId or vendorId
    let buyerId = null, vendorId = null;
    
    if (user.role === 'buyer') {
      const buyer = await Registration.getBuyerId(user.userId);
      buyerId = buyer ? buyer.buyerId : null;
    }
    if (user.role === 'vendor') {
      const vendor = await Registration.getVendorId(user.userId);
      vendorId = vendor ? vendor.vendorId : null;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.userId, email: user.emailAddress, role: user.role, buyerId, vendorId },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      userId: user.userId,
      email: user.emailAddress,
      role: user.role,
      buyerId,
      vendorId,
      token
    });
    
  } catch (error) {
    const status = error.message && error.message.toLowerCase().includes('invalid') ? 401 : 500;
    res.status(status).json({ message: error.message });
  }
};