const { sql, connectDB } = require('../config/db');

class Cart {
  // Get cart items for a buyer using BuyerCartView
  static async getCart(buyerId) {
    console.log('Fetching cart for buyerId:', buyerId);

    try {
      const pool = await connectDB();
      const query = `
           SELECT buyerId, cartId, productId, productName, unitPrice, quantity,imageUrl, totalPrice, availabilityStatus
           FROM BuyerCartView
           WHERE buyerId = @buyerId
          `;
      const result = await pool.request()
        .input('buyerId', sql.Int, buyerId)
        .query(query);
        //console.log('Cart fetched successfully:', result.recordset);
        if(result.recordset.length === 0) {
          throw new Error('No items found in cart for buyerId:', buyerId);
        } else {
          console.log('Items found in cart for buyerId:', result.recordset);
        }
      return result.recordset;
    } catch (error) {
      throw new Error(`Failed to fetch cart: ${error.message}`);
    }
  }

  // Add or update product in cart using AddToCartProcedure
  static async addToCart(buyerId, productId, quantity) {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('buyerId', sql.Int, buyerId)
        .input('productId', sql.Int, productId)
        .input('quantity', sql.Int, quantity)
        .execute('AddToCartProcedure');
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Failed to add to cart: ${error.message}`);
    }
  }

  // Delete item from cart using DeleteFromCartProcedure
  static async deleteFromCart(buyerId, productId) {
    //console.log('requst body:',req.productId);
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('buyerId', sql.Int, buyerId)
        .input('productId', sql.Int, productId)
        .execute('DeleteFromCartProcedure');
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Failed to delete from cart: ${error.message}`);
    }
  }

  // Checkout using CheckoutProcedure
  static async checkout(buyerId) {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('buyerId', sql.Int, buyerId)
        .execute('CheckoutProcedure');
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Checkout failed: ${error.message}`);
    }
  }
}

module.exports = Cart;