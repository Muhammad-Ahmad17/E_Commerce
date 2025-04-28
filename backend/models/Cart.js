const { sql, connectDB } = require('../config/db');

class Cart {
  static async getCart(userId) {
    try {
      const pool = await connectDB();
      const query = `
        SELECT cart_item_id, user_id, product_id, product_name, product_description, 
               unit_price, quantity, total_price, image_url, vendor_name, category_name
        FROM buyerCartView
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

  static async addToCart(userId, productId, quantity) {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('ProductID', sql.Int, productId)
        .input('Quantity', sql.Int, quantity)
        .execute('sp_add_to_cart');

      const { Message } = result.recordset[0];
      return { message: Message };
    } catch (error) {
      throw new Error(`Failed to add to cart: ${error.message}`);
    }
  }

  static async deleteFromCart(userId, cartItemId) {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('CartItemID', sql.Int, cartItemId)
        .execute('sp_delete_from_cart');

      const { Message } = result.recordset[0];
      return { message: Message };
    } catch (error) {
      throw new Error(`Failed to delete from cart: ${error.message}`);
    }
  }

  static async checkout(userId) {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .execute('sp_checkout');

      const record = result.recordset[0];
      if (record.OrderID === 0) {
        throw new Error(record.Message);
      }
      return result.recordset;
    } catch (error) {
      throw new Error(`Failed to checkout: ${error.message}`);
    }
  }
}

module.exports = Cart;
