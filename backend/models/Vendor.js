const { sql, connectDB } = require('../config/db');

class Vendor {
  // Get all products of the vendor
  static async getMyProducts(vendorId) {
    try {
      const pool = await connectDB();
      // Stored Procedure: Fetch all active products for the vendor using sp_get_vendor_products
      const result = await pool.request()
        .input('VendorID', sql.Int, vendorId)
        .execute('sp_get_vendor_products');
      return result.recordset;
    } catch (error) {
      throw new Error(`Failed to fetch vendor products: ${error.message}`);
    }
  }

  // Add a new product
  static async addProduct(vendorId, productData) {
    try {
      const pool = await connectDB();
      // Stored Procedure: Insert a new product using sp_add_product
      const result = await pool.request()
        .input('VendorID', sql.Int, vendorId)
        .input('Name', sql.NVarChar, productData.name)
        .input('Price', sql.Decimal(10, 2), productData.price)
        .input('Description', sql.NVarChar, productData.description)
        .input('StockQuantity', sql.Int, productData.stock_quantity)
        .input('CategoryID', sql.Int, productData.category_id)
        .execute('sp_add_product');
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Failed to add product: ${error.message}`);
    }
  }

  // Update an existing product (only quantity)
  static async updateProduct(vendorId, productId, productData) {
    try {
      const pool = await connectDB();
      // Stored Procedure: Update product quantity using sp_update_product_quantity
      const result = await pool.request()
        .input('ProductID', sql.Int, productId)
        .input('Quantity', sql.Int, productData.stock_quantity)
        .input('VendorID', sql.Int, vendorId)
        .execute('sp_update_product_quantity');

      if (!result.recordset || result.recordset.length === 0) {
        throw new Error('Product not found or not owned by vendor');
      }

      return result.recordset[0];
    } catch (error) {
      throw new Error(`Failed to update product quantity: ${error.message}`);
    }
  }

  // Delete a product
  static async deleteProduct(vendorId, productId) {
    try {
      const pool = await connectDB();
      // Stored Procedure: Delete product using sp_delete_product
      const result = await pool.request()
        .input('ProductID', sql.Int, productId)
        .input('VendorID', sql.Int, vendorId)
        .execute('sp_delete_product');
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  // Get vendor profile
  static async getProfile(vendorId) {
    try {
      const pool = await connectDB();
      // View: Fetch vendor profile details from VendorDashboardView
      const query = `
        SELECT 
          VendorID AS vendor_id,
          vendor_name,
          full_name,
          email_address,
          created_at
        FROM VendorDashboardView
        WHERE VendorID = @VendorID
      `;
      const result = await pool.request()
        .input('VendorID', sql.Int, vendorId)
        .query(query);
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Failed to fetch vendor profile: ${error.message}`);
    }
  }

  // Get pending orders
  static async getPendingOrders(vendorId) {
    try {
      const pool = await connectDB();
      // View: Fetch pending orders from VendorPendingOrdersView
      const query = `
        SELECT 
          VendorID,
          VendorName,
          OrderID,
          BuyerName,
          ProductName,
          Quantity,
          UnitPrice,
          TotalPrice,
          OrderDate,
          ExpectedDeliveryDate,
          ShippingAddress
        FROM VendorPendingOrdersView
        WHERE VendorID = @VendorID
      `;
      const result = await pool.request()
        .input('VendorID', sql.Int, vendorId)
        .query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Failed to fetch pending orders: ${error.message}`);
    }
  }

  // Get vendor analytics
  static async getAnalytics(vendorId) {
    try {
      const pool = await connectDB();
      // View: Fetch vendor analytics from VendorAnalyticsView
      const query = `
        SELECT 
          total_orders,
          total_sales,
          total_products_sold,
          active_products
        FROM VendorAnalyticsView
        WHERE vendor_id = @VendorID
      `;
      const result = await pool.request()
        .input('VendorID', sql.Int, vendorId)
        .query(query);
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Failed to fetch vendor analytics: ${error.message}`);
    }
  }
}

module.exports = Vendor;