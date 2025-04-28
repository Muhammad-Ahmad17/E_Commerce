const { sql, connectDB } = require('../config/db');

class Buyer {
  // Get recommended products based on buyer's preferences
  static async getRecommendedProducts(userId) {
    try {
      const pool = await connectDB();
      // SQL Query: Fetch products matching buyer's preferred category from vw_buyer_category_products
      const query = `
        SELECT 
          product_id,
          product_name,
          product_description,
          price,
          image_url,
          category_name,
          vendor_name
        FROM buyerCategoryProducts
        WHERE user_id = @UserID
      `;
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Failed to fetch recommended products: ${error.message}`);
    }
  }

  // Get products by selected category
  static async getSelectedProducts(userId, category) {
    try {
      const pool = await connectDB();
      // SQL Query: Fetch products for a specific category from vw_buyer_category_products
      const query = `
        SELECT 
          product_id,
          product_name,
          price,
          category_name,
          vendor_name
        FROM buyerCategoryProducts
        WHERE user_id = @UserID AND category_name = @Category
      `;
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('Category', sql.NVarChar, category)
        .query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Failed to fetch selected products: ${error.message}`);
    }
  }

  // Get product details by ID
  static async getProductDetails(userId, productId) {
    try {
      const pool = await connectDB();
      // SQL Query: Fetch detailed product info from vw_product_details
      const query = `
         SELECT 
          product_id,
          product_name,
          price,
          description,
          category_name,
          vendor_name,
          image_url
        FROM productDetails
        WHERE product_id = @ProductID
      `;
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('ProductID', sql.Int, productId)
        .query(query);
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Failed to fetch product details: ${error.message}`);
    }
  }

  // Get buyer profile
  static async getProfile(userId) {
    try {
      const pool = await connectDB();
      // SQL Query: Fetch buyer's profile details including default address
      const query = `
      SELECT 
        u.full_name,
        u.email_address,
        b.preferences,
        (a.address_line1 + ', ' + a.city + ', ' + a.postal_code + ', ' + a.country) AS address
      FROM [user] u
      JOIN buyer b ON u.id = b.user_id
      LEFT JOIN address a ON u.id = a.user_id AND a.is_default = 1
      WHERE u.id = @UserID
    `;
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .query(query);
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }
  }

  // Get buyer cart
  static async getCart(userId) {
    try {
      const pool = await connectDB();
      // SQL Query: Fetch cart items for the buyer from vw_buyer_cart
      const query = `
        SELECT 
          cart_item_id,
          product_id,
          product_name,
          product_description,
          unit_price,
          quantity,
          total_price,
          image_url,
          vendor_name,
          category_name
        FROM vw_buyer_cart
        WHERE user_id = @UserID
      `;
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Failed to fetch cart: ${error.message}`);
    }
  }

  // Get order history
  static async getOrderHistory(userId) {
    try {
      const pool = await connectDB();
      // SQL Query: Fetch buyer's order history with product and shipping details from BuyerOrderHistoryView
      const query = `
        SELECT 
          OrderID,
          order_date,
          total_amount,
          OrderStatus,
          expected_delivery_date,
          ProductName,
          quantity,
          unit_price,
          ItemTotal,
          ShippingAddress,
          city,
          postal_code,
          country
        FROM BuyerOrderHistoryView
        WHERE UserID = @UserID
      `;
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Failed to fetch order history: ${error.message}`);
    }
  }
}

module.exports = Buyer;
