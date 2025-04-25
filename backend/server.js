// Main server file to initialize Express and connect routes
const express = require('express');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const vendorRoutes = require('./routes/vendorRoutes');
const cartRoutes = require('./routes/cartRoutes');

dotenv.config();
const app = express();

app.use(express.json());

// Routes
app.use('/api/cart', cartRoutes);
app.use('/api/vendors', vendorRoutes);

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
};

startServer();
