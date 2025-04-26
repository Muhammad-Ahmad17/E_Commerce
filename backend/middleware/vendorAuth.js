const { sql, connectDB } = require('../config/db');

const checkVendorAuth = async (req, res, next) => {
  try {
    const userId = parseInt(req.headers['x-user-id']);
    if (!userId) {
      return res.status(401).json({ error: 'User ID required in headers' });
    }

    const pool = await connectDB();
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(`
        SELECT v.id 
        FROM [user] u
        JOIN user_role ur ON u.id = ur.user_id
        JOIN role r ON ur.role_id = r.id
        JOIN vendor v ON u.id = v.user_id
        WHERE u.id = @UserID AND r.name = 'vendor' AND u.is_active = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid or non-vendor user' });
    }

    req.user = { id: result.recordset[0].id }; // Sets vendor.id
    next();
  } catch (error) {
    console.error('Vendor auth middleware error:', error.message);
    res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
};

module.exports = { checkVendorAuth };