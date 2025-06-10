const { sql, connectDB } = require('../config/db');

class Buyer {
  // Get recommended products based on buyer's preferences
  static async getRecommendedProducts(buyerId) {
    try {
      const pool = await connectDB();
      console.log('Buyer ID:', buyerId); // Debugging line to check the buyerId
      const query = `
        SELECT 
          productId,
          productName,
          price,
          categoryName,
          description,
          vendorName,
          imageUrl
        FROM BuyerCategoryProducts
        WHERE buyerId = @buyerId
      `;
      const result = await pool.request()
        .input('buyerId', sql.Int, buyerId)
        .query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Failed to fetch recommended products: ${error.message}`);
    }
  }

  // Get products by selected category
  static async getSelectedProducts(category) {
    console.log('Category:', category); // Debugging line to check the category
    try {
      const pool = await connectDB();
      const query = `
        SELECT distinct
          productId,
          productName,
          price,
          categoryName,
          vendorName,
          description,
          imageUrl
          
        FROM BuyerCategoryProducts
        WHERE categoryName = @category
      `;
      const result = await pool.request()
        .input('category', sql.NVarChar, category)
        .query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Failed to fetch selected products: ${error.message}`);
    }
  }

  // Get product details by ID
  static async getProductDetails(productId) {
    try {
      const pool = await connectDB();
      const query = `
         SELECT 
          productId,
          productName,
          price,
          description,
          categoryName,
          vendorName,
          imageUrl,
          averageRating,
          reviewCount,
          stockQuantity        
        FROM ProductDetails
        WHERE productId = @productId
      `;
      const result = await pool.request()
        .input('productId', sql.Int, productId)
        .query(query);
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Failed to fetch product details: ${error.message}`);
    }
  }

  // Get buyer profile
  static async getProfile(buyerId) {
    try {
      const pool = await connectDB();
      const query = `
      SELECT 
        u.fullName,
        u.emailAddress,
        b.preferences,
        (a.addressLine1 + ', ' + a.city + ', ' + a.postalCode + ', ' + a.country) AS address
      FROM [User] u
      JOIN Buyer b ON u.userId = b.userId
      LEFT JOIN Address a ON u.userId = a.userId AND a.isDefault = 1
      WHERE b.buyerId = @buyerId
    `;
      const result = await pool.request()
        .input('buyerId', sql.Int, buyerId)
        .query(query);
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }
  }

  /*
  // Get buyer cart
  static async getCart(buyerId) {
    try {
      const pool = await connectDB();
      const query = `
        SELECT 
          cartId,
          productId,
          productName,
          description,
          price,
          quantity,
          (price * quantity) AS totalPrice,
          imageUrl,
          vendorName,
          categoryName
        FROM BuyerCartView
        WHERE buyerId = @buyerId
      `;
      const result = await pool.request()
        .input('buyerId', sql.Int, buyerId)
        .query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Failed to fetch cart: ${error.message}`);
    }
  }
    */

  // Get order history
  static async getOrderHistory(buyerId) {
    try {
      const pool = await connectDB();
      const query = `
        SELECT boh.*
        FROM BuyerOrderHistoryView boh
        JOIN Buyer b ON boh.userId = b.userId
        WHERE b.buyerId = @buyerId;
      `;
      const result = await pool.request()
        .input('buyerId', sql.Int, buyerId)
        .query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Failed to fetch order history: ${error.message}`);
    }
  }


  static async getReviews(productId) {
    try {
      const pool = await connectDB();
      const query = `
          select * from ProductReviews
          where productId = @productId; 
      `;
      const result = await pool.request()
        .input('productId', sql.Int, productId)
        .query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }
  }


  static async addReview(buyerId, productId, rating, comment) {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('buyerId', sql.Int, buyerId)
        .input('productId', sql.Int, productId)
        .input('rating', sql.Int, rating)
        .input('comment', sql.NVarChar(500), comment)
        .execute('AddReviewProcedure');
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Failed to add review: ${error.message}`);
    }
  }
}



module.exports = Buyer;

