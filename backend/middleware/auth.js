// registration middleware to check if the user is authenticated

const { sql, connectDB } = require('../config/db');
const checkAuth = async (req, res, next) => {
  try {
    const userId = parseInt(req.headers['x-user-id']);
    if (!userId) {
      return res.status(401).json({ error: 'User ID required in headers' });
    }

    const pool = await connectDB();
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(`SELECT id FROM [user] WHERE id = @UserID AND is_active = 1`);

    if (!result.recordset.length) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    req.user = { id: userId };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = { checkAuth };
