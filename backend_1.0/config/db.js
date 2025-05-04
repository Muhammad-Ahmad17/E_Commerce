// Database connection to SQL Server for db_E_Commerce
const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

/* 
connection configuration for SQL Server
using environment variables for security
*/
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

/*
Create a connection pool to the database
 and export the connection function to be 
 used in other parts of the application
 This allows for a single connection pool to
 be reused across the application
*/
let pool;
const connectDB = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(dbConfig);
      console.log('Database connected');
    }
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};


module.exports = { connectDB, sql };