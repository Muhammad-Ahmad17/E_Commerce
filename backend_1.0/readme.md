ecommerce-backend/
├── config/
│   └── db.js                   # Database connection config
├── controllers/
│   ├── buyerController.js      # Buyer-related endpoints
│   ├── vendorController.js     # Vendor-related endpoints
│   └── registrationController.js # Auth-related endpoints
├── middleware/
│   ├── auth.js                # Generic checkAuth middleware
│   ├── buyerAuth.js           # Buyer-specific auth middleware
│   └── vendorAuth.js          # Vendor-specific auth middleware
├── models/
│   ├── Buyer.js               # Buyer model with SQL queries
│   ├── Vendor.js              # Vendor model with SQL queries
│   └── Registration.js        # Registration model with SQL queries
├── routes/
│   ├── buyerRoutes.js         # Buyer routes
│   ├── vendorRoutes.js        # Vendor routes
│   └── authRoutes.js          # Auth routes
├── package.json               # Project dependencies
└── app.js                     # Main Express app