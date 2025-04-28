const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/db');

const registrationRoutes = require('./routes/registrationRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const cartRoutes = require('./routes/cartRoutes');
const vendorRoutes = require('./routes/vendorRoutes');

const PORT = process.env.PORT || 5000;

const app = express();
dotenv.config();
app.use(cors()); // <-- Then use cors
dotenv.config();

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/api/registration', registrationRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/buyer/cart', cartRoutes); // Cart routes under /api/buyer/cart
app.use('/api/vendors', vendorRoutes);

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
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