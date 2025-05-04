const { sql, connectDB } = require('../config/db');

class Registration {
  static async register(userData) {
    try {
      const pool = await connectDB();
      let result;

      if (userData.role === 'buyer') {
        result = await pool.request()
          .input('fullName', sql.NVarChar, userData.fullName)
          .input('email', sql.NVarChar, userData.email)
          .input('password', sql.NVarChar, userData.password)
          .input('preferences', sql.NVarChar, userData.preferences)
          .input('addressLine1', sql.NVarChar, userData.addressLine1)
          .input('city', sql.NVarChar, userData.city)
          .input('postalCode', sql.NVarChar, userData.postalCode)
          .input('country', sql.NVarChar, userData.country)
          .input('isDefault', sql.Bit, userData.isDefault ?? 1)
          .execute('AddBuyerProcedure');
      } else if (userData.role === 'vendor') {
        result = await pool.request()
          .input('fullName', sql.NVarChar, userData.fullName)
          .input('email', sql.NVarChar, userData.email)
          .input('password', sql.NVarChar, userData.password)
          .input('vendorName', sql.NVarChar, userData.vendorName)
          .input('addressLine1', sql.NVarChar, userData.addressLine1)
          .input('city', sql.NVarChar, userData.city)
          .input('postalCode', sql.NVarChar, userData.postalCode)
          .input('country', sql.NVarChar, userData.country)
          //.input('isDefault', sql.Bit, userData.isDefault ?? 1)
          .execute('AddVendorProcedure');
      } else {
        throw new Error('Invalid role specified');
      }

      const { buyerId, vendorId, message } = result.recordset[0];
      if ((userData.role === 'buyer' && buyerId === 0) || (userData.role === 'vendor' && vendorId === 0)) {
        throw new Error(message);
      }

      return {
        ...(userData.role === 'buyer' ? { buyerId: buyerId } : { vendorId: vendorId }),
        // userId: buyerId || vendorId, // if needed
        email: userData.email,
        role: userData.role,
        message
      };
      
    } catch (error) {
      throw new Error(`Failed to register user: ${error.message}`);
    }
  }

  static async login(email) {
    try {
      const pool = await connectDB();
      const query = `
        SELECT u.userId, u.emailAddress, u.passwordHash AS password, r.roleName AS role
        FROM [User] u
        JOIN UserRole ur ON u.userId = ur.userId
        JOIN Role r ON ur.roleId = r.roleId
        WHERE u.emailAddress = @Email AND u.isActive = 1
      `;
      const result = await pool.request()
        .input('Email', sql.NVarChar, email)
        .query(query);

      if (!result.recordset.length) {
        throw new Error('Invalid email or password');
      }

      const user = result.recordset[0];

      // Log the user object to see the structure
      // This is useful for debugging to ensure the data is as expected
      console.log('User from DB:', user);
      return user; // Return the user record with hashed password and role
    } catch (error) {
      throw new Error(`Failed to login: ${error.message}`);
    }
  }
  static async updatePassword(userId, newPassword) {
    try {
      const pool = await connectDB();
      await pool.request()
        .input('UserID', sql.Int, userId)
        .input('NewPassword', sql.NVarChar, newPassword)
        .query(`UPDATE [User] SET passwordHash = @NewPassword WHERE userId = @UserID`);
    } catch (error) {
      throw new Error(`Failed to update password: ${error.message}`);
    }
  }

  static async updateProfile(userId, profileData) {
    try {
      const pool = await connectDB();
      const query = `
        UPDATE [User]
        SET fullName = @FullName, emailAddress = @Email
        OUTPUT INSERTED.userId, INSERTED.fullName, INSERTED.emailAddress
        WHERE userId = @UserID
      `;
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('FullName', sql.NVarChar, profileData.fullName)
        .input('Email', sql.NVarChar, profileData.email)
        .query(query);
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  static async getBuyerId(userId) {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT buyerId FROM Buyer WHERE userId = @userId');
      return result.recordset[0] || null;
    } catch (error) {
      throw new Error('Failed to fetch buyerId');
    }
  }

  static async getVendorId(userId) {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT vendorId FROM Vendor WHERE userId = @userId');
      return result.recordset[0] || null;
    } catch (error) {
      throw new Error('Failed to fetch vendorId');
    }
  }
}

module.exports = Registration;