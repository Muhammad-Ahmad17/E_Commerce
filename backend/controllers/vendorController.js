// Controller for vendor-related APIs
const { sql, connectDB } = require('../config/db');

const getPendingOrders = async (req, res) => {
  try {
    // TODO: Replace with req.user.id after auth middleware
    const vendorId = 1; // Sana (VendorID=1) for testing
    const pool = await connectDB();
    const result = await pool.request()
      .input('vendorId', sql.Int, vendorId)
      .query('SELECT * FROM VendorPendingOrdersView WHERE VendorID = @vendorId');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No pending orders found' });
    }

    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    res.status(500).json({ error: 'Failed to fetch pending orders' });
  }
};

module.exports = { getPendingOrders };
