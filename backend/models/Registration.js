const { sql, connectDB } = require('../config/db');

class Registration {
  static async register(userData) {
    try {
      const pool = await connectDB();
      let result;

      if (userData.role === 'buyer') {
        result = await pool.request()
          .input('FullName', sql.NVarChar, userData.full_name)
          .input('Email', sql.NVarChar, userData.email_address)
          .input('Password', sql.NVarChar, userData.password)
          .input('Preferences', sql.NVarChar, userData.preferences)
          .input('AddressLine1', sql.NVarChar, userData.address_line1)
          .input('City', sql.NVarChar, userData.city)
          .input('PostalCode', sql.NVarChar, userData.postal_code)
          .input('Country', sql.NVarChar, userData.country)
          .input('IsDefault', sql.Bit, userData.is_default || 1)
          .execute('sp_add_buyer');
      } else if (userData.role === 'vendor') {
        result = await pool.request()
          .input('FullName', sql.NVarChar, userData.full_name)
          .input('Email', sql.NVarChar, userData.email_address)
          .input('Password', sql.NVarChar, userData.password)
          .input('VendorName', sql.NVarChar, userData.vendor_name)
          .input('AddressLine1', sql.NVarChar, userData.address_line1)
          .input('City', sql.NVarChar, userData.city)
          .input('PostalCode', sql.NVarChar, userData.postal_code)
          .input('Country', sql.NVarChar, userData.country)
          .input('IsDefault', sql.Bit, userData.is_default || 1)
          .execute('sp_add_vendor');
      } else {
        throw new Error('Invalid role specified');
      }

      const { user_id, message } = result.recordset[0];
      if (user_id === 0) {
        throw new Error(message);
      }

      return { userId: user_id, email: userData.email_address, role: userData.role, message };
    } catch (error) {
      throw new Error(`Failed to register user: ${error.message}`);
    }
  }

  static async login(email, password) {
    try {
      const pool = await connectDB();
      const query = `
        SELECT u.id, u.email_address, u.password_hash AS password, r.name AS role
        FROM [user] u
        JOIN user_role ur ON u.id = ur.user_id
        JOIN role r ON ur.role_id = r.id
        WHERE u.email_address = @Email AND u.is_active = 1
      `;
      const result = await pool.request()
        .input('Email', sql.NVarChar, email)
        .query(query);

      if (!result.recordset.length || result.recordset[0].password !== password) {
        throw new Error('Invalid email or password');
      }

      const user = result.recordset[0];
      return { userId: user.id, email: user.email_address, role: user.role };
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
        .query(`UPDATE [user] SET password_hash = @NewPassword WHERE id = @UserID`);
    } catch (error) {
      throw new Error(`Failed to update password: ${error.message}`);
    }
  }

  static async updateProfile(userId, profileData) {
    try {
      const pool = await connectDB();
      const query = `
        UPDATE [user]
        SET full_name = @FullName, email_address = @Email
        OUTPUT INSERTED.id, INSERTED.full_name, INSERTED.email_address
        WHERE id = @UserID
      `;
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('FullName', sql.NVarChar, profileData.full_name)
        .input('Email', sql.NVarChar, profileData.email_address)
        .query(query);
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }
}

module.exports = Registration;
