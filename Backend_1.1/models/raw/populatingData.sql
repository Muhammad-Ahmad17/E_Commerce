/*
* E-Commerce Data Population Script
* Version: 1.0
* Last Updated: 2025-05-01
* Database: ecom
*/

USE ecom
GO

-- Initialize roles with IDs
IF NOT EXISTS (SELECT 1 FROM Role)
BEGIN
    INSERT INTO Role (roleId, roleName) VALUES 
    (1, 'buyer'),
    (2, 'vendor'),
    (3, 'manager');
END
GO

-- Verify roles before proceeding
IF NOT EXISTS (SELECT 1 FROM Role WHERE roleName IN ('buyer', 'vendor', 'manager'))
BEGIN
    THROW 50002, 'Required roles not found in database', 1;
END
GO

-- Initialize categories
INSERT INTO Category (categoryName) VALUES 
('male'),
('female'),
('children');
GO

-- Initialize subcategories
INSERT INTO CategorySub (categoryId, subCategoryName) VALUES 
(1, 'clothes'),
(1, 'shoes'),
(1, 'accessories'),
(2, 'clothes'),
(2, 'shoes'),
(2, 'accessories'),
(3, 'clothes'),
(3, 'shoes'),
(3, 'accessories');
GO

-- Add test vendors
DECLARE @vendorRole INT;
SELECT @vendorRole = roleId FROM Role WHERE roleName = 'vendor';

IF @vendorRole IS NULL
    THROW 50002, 'Vendor role not found', 1;

EXEC AddVendorProcedure
    @fullName = 'Fashion Hub Owner',
    @email = 'fashion.hub@example.com',
    @password = 'Hash123!',
    @vendorName = 'Fashion Hub Store',
    @addressLine1 = 'Store Address 1',
    @city = 'Mumbai',
    @postalCode = '400001',
    @country = 'India';
GO

EXEC AddVendorProcedure
    @fullName = 'Kids Paradise Owner',
    @email = 'kids.paradise@example.com',
    @password = 'Hash123!',
    @vendorName = 'Kids Paradise Store',
    @addressLine1 = 'Store Address 2',
    @city = 'Mumbai',
    @postalCode = '400002',
    @country = 'India';
GO

EXEC AddVendorProcedure
    @fullName = 'Sports Elite Owner',
    @email = 'sports.elite@example.com',
    @password = 'Hash123!',
    @vendorName = 'Sports Elite Store',
    @addressLine1 = 'Store Address 3',
    @city = 'Mumbai',
    @postalCode = '400003',
    @country = 'India';
GO

-- Add Products using stored procedure
EXEC AddProductProcedure 
    @vendorId = 1,
    @categoryName = 'male',
    @subCategoryName = 'clothes',
    @productName = 'Men''s Casual Shirt',
    @description = 'Comfortable cotton shirt',
    @price = 999.99,
    @stockQuantity = 50,
    @imageUrl = '/images/mens-shirt.jpg';
GO

EXEC AddProductProcedure 
    @vendorId = 1,
    @categoryName = 'female',
    @subCategoryName = 'clothes',
    @productName = 'Women''s Summer Dress',
    @description = 'Floral pattern dress',
    @price = 1499.99,
    @stockQuantity = 30,
    @imageUrl = '/images/womens-dress.jpg';
GO

EXEC AddProductProcedure 
    @vendorId = 2,
    @categoryName = 'children',
    @subCategoryName = 'clothes',
    @productName = 'Kids T-Shirt Pack',
    @description = 'Pack of 3 cotton t-shirts',
    @price = 799.99,
    @stockQuantity = 100,
    @imageUrl = '/images/kids-tshirt.jpg';
GO

EXEC AddProductProcedure 
    @vendorId = 2,
    @categoryName = 'male',
    @subCategoryName = 'clothes',
    @productName = 't-shirts',
    @description = 'Comfortable t shirt for for men',
    @price = 1299.99,
    @stockQuantity = 80,
    @imageUrl = 'https://th.bing.com/th/id/OIP.mii6o50vDN0cJxqulxR-ggHaIG?w=174&h=191&c=7&r=0&o=5&cb=iwc2&dpr=1.4&pid=1.7';

-- Add test buyers
DECLARE @buyerRole INT;
SELECT @buyerRole = roleId FROM Role WHERE roleName = 'buyer';

IF @buyerRole IS NULL
    THROW 50002, 'Buyer role not found', 1;

EXEC AddBuyerProcedure
    @fullName = 'John Doe',
    @email = 'john.doe@example.com',
    @password = 'Hash123!',
    @preferences = 'male',
    @addressLine1 = 'Residential Address 1',
    @city = 'Mumbai',
    @postalCode = '400001',
    @country = 'India';
GO

EXEC AddBuyerProcedure
    @fullName = 'Jane Smith',
    @email = 'jane.smith@example.com',
    @password = 'Hash123!',
    @preferences = 'female',
    @addressLine1 = 'Residential Address 2',
    @city = 'Mumbai',
    @postalCode = '400002',
    @country = 'India';
GO

-- Add test orders
EXEC AddToCartProcedure @buyerId = 1, @productId = 1, @quantity = 2;
EXEC AddToCartProcedure @buyerId = 1, @productId = 2, @quantity = 1;
EXEC AddToCartProcedure @buyerId = 2, @productId = 3, @quantity = 3;
EXEC AddToCartProcedure @buyerId = 2, @productId = 1, @quantity = 1;
GO

-- Process checkout for test orders

EXEC CheckoutProcedure @buyerId = 1, @addressId = 1;
GO

EXEC AddToCartProcedure @buyerId = 6, @productId = 2, @quantity = 2;
EXEC CheckoutProcedure @buyerId = 6,addressId = 1;

-- Add products to the cart for Buyer 1
EXEC AddToCartProcedure @buyerId = 1, @productId = 1, @quantity = 2;
EXEC AddToCartProcedure @buyerId = 1, @productId = 2, @quantity = 1;

-- Add products to the cart for Buyer 2
EXEC AddToCartProcedure @buyerId = 2, @productId = 3, @quantity = 3;
EXEC AddToCartProcedure @buyerId = 2, @productId = 1, @quantity = 1;
-- Checkout for Buyer 1
EXEC CheckoutProcedure @buyerId = 1, @addressId = 1;

-- Checkout for Buyer 2
EXEC CheckoutProcedure @buyerId = 2, @addressId = 2;
-- Add a review for a product by Buyer 1
EXEC AddReviewProcedure
    @buyerId = 1,
    @productId = 1,
    @rating = 5,
    @comment = 'Excellent shirt! Perfect fit and great material.';

-- Add a review for a product by Buyer 2
EXEC AddReviewProcedure
    @buyerId = 2,
    @productId = 3,
    @rating = 4,
    @comment = 'Great quality t-shirts for kids.';


SELECT * FROM VendorAnalyticsView;
SELECT * FROM VendorPendingOrdersView
SELECT * FROM VendorDashboardView;
SELECT * FROM ProductDetails;