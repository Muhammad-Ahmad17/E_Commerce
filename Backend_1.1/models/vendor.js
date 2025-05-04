const { sql, connectDB } = require('../config/db');

class Vendor {
  // Get all products for the vendor using latest procedure/view
  static async getMyProducts(vendorId) {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('vendorId', sql.Int, vendorId)
        .execute('GetVendorProductsProcedure');
      return result.recordset;
    } catch (error) {
      throw new Error(`Failed to fetch vendor products: ${error.message}`);
    }
  }

  // Add a new product using AddProductProcedure
  static async addProduct(vendorId, productData) {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('vendorId', sql.Int, vendorId)
        .input('categoryName', sql.NVarChar, productData.categoryName)
        .input('subCategoryName', sql.NVarChar, productData.subCategoryName)
        .input('productName', sql.NVarChar, productData.productName)
        .input('description', sql.NVarChar, productData.description)
        .input('price', sql.Decimal(18, 2), productData.price)
        .input('stockQuantity', sql.Int, productData.stockQuantity)
        .input('imageUrl', sql.NVarChar, productData.imageUrl || null)
        .execute('AddProductProcedure');
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Failed to add product: ${error.message}`);
    }
  }

  // Update product quantity using UpdateProductQuantityProcedure
  static async updateProduct(vendorId, productId, quantity) {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('vendorId', sql.Int, vendorId)
        .input('productId', sql.Int, productId)
        .input('quantity', sql.Int, quantity)
        .execute('UpdateProductQuantityProcedure');
      if (!result.recordset || result.recordset.length === 0) {
        throw new Error('Product not found or not owned by vendor');
      }
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Failed to update product quantity: ${error.message}`);
    }
  }

  // Delete a product using DeleteProductProcedure
  static async deleteProduct(vendorId, productId) {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('vendorId', sql.Int, vendorId)
        .input('productId', sql.Int, productId)
        .execute('DeleteProductProcedure');
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  // Get vendor profile from VendorDashboardView
  static async getProfile(vendorId) {
    try {
      const pool = await connectDB();
      const query = `
        SELECT *
        FROM VendorDashboardView
        WHERE vendorId = @vendorId
      `;
      const result = await pool.request()
        .input('vendorId', sql.Int, vendorId)
        .query(query);
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Failed to fetch vendor profile: ${error.message}`);
    }
  }

  // Get pending orders from VendorPendingOrdersView
  static async getPendingOrders(vendorId) {
    try {
      const pool = await connectDB();
      const query = `
        SELECT *
        FROM VendorPendingOrdersView
        WHERE vendorId = @vendorId
      `;
      const result = await pool.request()
        .input('vendorId', sql.Int, vendorId)
        .query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Failed to fetch pending orders: ${error.message}`);
    }
  }

  // Get vendor analytics from VendorAnalyticsView
  static async getAnalytics(vendorId) {
    try {
      const pool = await connectDB();
      const query = `
        SELECT *
        FROM VendorAnalyticsView
        WHERE vendorId = @vendorId
      `;
      const result = await pool.request()
        .input('vendorId', sql.Int, vendorId)
        .query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Failed to fetch vendor analytics: ${error.message}`);
    }
  }
}

module.exports = Vendor;