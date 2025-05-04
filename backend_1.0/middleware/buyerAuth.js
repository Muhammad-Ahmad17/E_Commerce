const { sql, connectDB } = require('../config/db');

const checkBuyerAuth = async (req, res, next) => {
  try {
    const userId = parseInt(req.headers['x-user-id']);
    if (!userId) {
      return res.status(401).json({ error: 'User ID required in headers' });
    }

    const pool = await connectDB();
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(`
        SELECT u.id 
        FROM [user] u
        JOIN user_role ur ON u.id = ur.user_id
        JOIN role r ON ur.role_id = r.id
        WHERE u.id = @UserID AND r.name = 'buyer' AND u.is_active = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid or non-buyer user' });
    }

    req.user = { id: userId };
    next();
  } catch (error) {
    console.error('Buyer auth middleware error:', error.message);
    res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
};

module.exports = { checkBuyerAuth };