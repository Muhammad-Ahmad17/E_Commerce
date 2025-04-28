// controllers/registrationController.js
//register
//login
//logout
//forgot password
//reset password
//update profile

const Registration = require('../models/Registration');

exports.register = async (req, res) => {
  try {
    const { full_name, email_address, password, role, vendor_name, preferences, address_line1, city, postal_code, country } = req.body;
    if (!full_name || !email_address || !password || !role || !address_line1 || !city || !postal_code || !country) {
      return res.status(400).json({ message: 'Full name, email, password, role, and address details are required' });
    }
    if (role === 'vendor' && !vendor_name) {
      return res.status(400).json({ message: 'Vendor name is required for vendor role' });
    }
    if (role === 'buyer' && !preferences) {
      return res.status(400).json({ message: 'Preferences are required for buyer role' });
    }

    const user = await Registration.register({ full_name, email_address, password, role, vendor_name, preferences, address_line1, city, postal_code, country, is_default });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await Registration.login(email, password);
    res.json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(401).json({ error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.json({ message: 'Logout successful. Remove x-user-id on client side.' });
  } catch (error) {
    console.error('Error logging out:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }
    await Registration.updatePassword(userId, newPassword);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, email_address } = req.body;
    if (!full_name || !email_address) {
      return res.status(400).json({ message: 'Full name and email are required' });
    }
    const profile = await Registration.updateProfile(userId, { full_name, email_address });
    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error('Error updating profile:', error.message);
    res.status(500).json({ error: error.message });
  }
};
