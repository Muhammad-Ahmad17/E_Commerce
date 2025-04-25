// Controller for cart-related APIs
const { sql, connectDB } = require('../config/db');

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    // Validate input
    if (!userId || !productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const pool = await connectDB();
    await pool.request()
      .input('UserID', sql.Int, userId)
      .input('ProductID', sql.Int, productId)
      .input('Quantity', sql.Int, quantity)
      .execute('sp_add_to_cart');

    res.status(201).json({ message: 'Item added to cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
};

module.exports = { addToCart };