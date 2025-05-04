
-- Populate E-Commerce Database with Enhanced Meaningful Data and SELECT Statements
-- Purpose: Inserts realistic data into all tables and verifies with SELECT * for API testing.
-- Tables Populated:
-- - role, category, category_sub, [user], user_role, buyer, vendor, address, product, cart, shop_order, order_items, product_review
-- Data Characteristics:
-- - Realistic: Pakistan-based names, addresses, products.
-- - Interconnected: Users to roles, products to vendors/categories, orders to buyers.
-- - Enhanced: 15 users, 20 products, 10 orders, 10 reviews for robust API testing.
-- Features:
-- - Adds SELECT * FROM <table> after each table insert for immediate verification.
-- - Silent execution (SET NOCOUNT ON).
-- - Uses procedures (sp_register_user, sp_add_product, sp_checkout) and triggers.
-- Notes:
-- - Compatible with schema (artifact_id: 961d1420-c9f6-447b-a0ec-9a1f0fe5ef43).
-- - Respects category (Male, Female, Children) and category_sub (clothes, shoes, accessories) constraints.
-- - Fixes error: "Failed to fetch pending orders" by ensuring data in VendorPendingOrdersView.
-- Created by: Grok 3 for xAI
-- Date: April 25, 2025

USE E_Commerce;
GO

SET NOCOUNT ON;

-- Clear existing data (optional, uncomment if needed)
-- EXEC sp_MSforeachtable 'DELETE FROM ?';
-- DBCC CHECKIDENT ('[user]', RESEED, 0);
-- DBCC CHECKIDENT ('product', RESEED, 0);
-- DBCC CHECKIDENT ('shop_order', RESEED, 0);

-- 1. Insert Roles
INSERT INTO role (name) VALUES ('buyer'), ('vendor'), ('manager');
SELECT * FROM role;

-- 2. Insert Categories (Respecting CHECK Constraint)
INSERT INTO category (name) VALUES ('Male'), ('Female'), ('Children');
SELECT * FROM category;

-- 3. Insert Subcategories (Respecting CHECK Constraint)
INSERT INTO category_sub (category_id, name) VALUES 
(1, 'clothes'), (1, 'shoes'), (1, 'accessories'),
(2, 'clothes'), (2, 'shoes'), (2, 'accessories'),
(3, 'clothes'), (3, 'shoes'), (3, 'accessories');
SELECT * FROM category_sub;

-- 4. Insert Users using sp_register_user
-- Buyers (9)
EXEC sp_register_user @FullName = 'Ali Khan', @EmailAddress = 'ali.khan@example.com', @PasswordHash = 'hash1', @RoleName = 'buyer', @Preferences = 'male', @AddressLine1 = '123 Gulshan St', @City = 'Karachi', @PostalCode = '75000', @Country = 'Pakistan';
EXEC sp_register_user @FullName = 'Hassan Raza', @EmailAddress = 'hassan.raza@example.com', @PasswordHash = 'hash2', @RoleName = 'buyer', @Preferences = 'children', @AddressLine1 = '789 F-7', @City = 'Islamabad', @PostalCode = '44000', @Country = 'Pakistan';
EXEC sp_register_user @FullName = 'Fatima Noor', @EmailAddress = 'fatima.noor@example.com', @PasswordHash = 'hash3', @RoleName = 'buyer', @Preferences = 'female', @AddressLine1 = '234 Model Town', @City = 'Lahore', @PostalCode = '54700', @Country = 'Pakistan';
EXEC sp_register_user @FullName = 'Ayesha Siddiqui', @EmailAddress = 'ayesha.siddiqui@example.com', @PasswordHash = 'hash4', @RoleName = 'buyer', @Preferences = 'female', @AddressLine1 = '890 DHA', @City = 'Karachi', @PostalCode = '75500', @Country = 'Pakistan';
EXEC sp_register_user @FullName = 'Maryam Iqbal', @EmailAddress = 'maryam.iqbal@example.com', @PasswordHash = 'hash5', @RoleName = 'buyer', @Preferences = 'children', @AddressLine1 = '654 Sector F', @City = 'Islamabad', @PostalCode = '44200', @Country = 'Pakistan';
EXEC sp_register_user @FullName = 'Usman Tariq', @EmailAddress = 'usman.tariq@example.com', @PasswordHash = 'hash6', @RoleName = 'buyer', @Preferences = 'male', @AddressLine1 = '987 Korangi', @City = 'Karachi', @PostalCode = '74900', @Country = 'Pakistan';
EXEC sp_register_user @FullName = 'Saima Zafar', @EmailAddress = 'saima.zafar@example.com', @PasswordHash = 'hash7', @RoleName = 'buyer', @Preferences = 'female', @AddressLine1 = '321 Gulberg', @City = 'Lahore', @PostalCode = '54660', @Country = 'Pakistan';
EXEC sp_register_user @FullName = 'Bilal Ahmed', @EmailAddress = 'bilal.ahmed@example.com', @PasswordHash = 'hash8', @RoleName = 'buyer', @Preferences = 'male', @AddressLine1 = '456 North Nazimabad', @City = 'Karachi', @PostalCode = '74700', @Country = 'Pakistan';
EXEC sp_register_user @FullName = 'Zainab Malik', @EmailAddress = 'zainab.malik@example.com', @PasswordHash = 'hash9', @RoleName = 'buyer', @Preferences = 'children', @AddressLine1 = '111 Blue Area', @City = 'Islamabad', @PostalCode = '44000', @Country = 'Pakistan';

-- Vendors (5)
EXEC sp_register_user @FullName = 'Sana Malik', @EmailAddress = 'sana.malik@example.com', @PasswordHash = 'hash10', @RoleName = 'vendor', @VendorName = 'Style Hub', @AddressLine1 = '456 Mall Rd', @City = 'Lahore', @PostalCode = '54000', @Country = 'Pakistan';
EXEC sp_register_user @FullName = 'Zara Ahmed', @EmailAddress = 'zara.ahmed@example.com', @PasswordHash = 'hash11', @RoleName = 'vendor', @VendorName = 'Fashion Corner', @AddressLine1 = '101 Clifton', @City = 'Karachi', @PostalCode = '75500', @Country = 'Pakistan';
EXEC sp_register_user @FullName = 'Omar Farooq', @EmailAddress = 'omar.farooq@example.com', @PasswordHash = 'hash12', @RoleName = 'vendor', @VendorName = 'Kids Corner', @AddressLine1 = '567 G-9', @City = 'Islamabad', @PostalCode = '44100', @Country = 'Pakistan';
EXEC sp_register_user @FullName = 'Bilal Sheikh', @EmailAddress = 'bilal.sheikh@example.com', @PasswordHash = 'hash13', @RoleName = 'vendor', @VendorName = 'Trendy Kids', @AddressLine1 = '321 Bahria', @City = 'Lahore', @PostalCode = '54600', @Country = 'Pakistan';
EXEC sp_register_user @FullName = 'Nadia Khan', @EmailAddress = 'nadia.khan@example.com', @PasswordHash = 'hash14', @RoleName = 'vendor', @VendorName = 'Chic Boutique', @AddressLine1 = '222 Saddar', @City = 'Karachi', @PostalCode = '74400', @Country = 'Pakistan';

-- Manager (1)
EXEC sp_register_user @FullName = 'Ahmed Raza', @EmailAddress = 'ahmed.raza@example.com', @PasswordHash = 'hash15', @RoleName = 'manager', @AddressLine1 = '777 F-10', @City = 'Islamabad', @PostalCode = '44000', @Country = 'Pakistan';

-- Verify Users and Related Tables
SELECT * FROM [user];
SELECT * FROM user_role;
SELECT * FROM buyer;
SELECT * FROM vendor;

-- 5. Insert Additional Addresses
INSERT INTO address (user_id, address_line1, city, postal_code, country, is_default) VALUES 
(1, '111 North Nazimabad', 'Karachi', '74700', 'Pakistan', 0), -- Ali
(2, '222 Blue Area', 'Islamabad', '44000', 'Pakistan', 0), -- Hassan
(3, '333 Gulberg', 'Lahore', '54660', 'Pakistan', 0), -- Fatima
(4, '444 Defence', 'Karachi', '75500', 'Pakistan', 0), -- Ayesha
(5, '555 Sector G', 'Islamabad', '44200', 'Pakistan', 0); -- Maryam
SELECT * FROM address;

-- 6. Insert Products using sp_add_product
-- Vendor 1: Sana (Style Hub) - Male
EXEC sp_add_product @VendorID = 1, @CategoryName = 'Male', @SubCategoryName = 'clothes', @Name = 'Mens T-Shirt', @Description = 'Cotton T-Shirt', @Price = 600.00, @StockQuantity = 50, @ImageUrl = 'http://example.com/tshirt.jpg';
EXEC sp_add_product @VendorID = 1, @CategoryName = 'Male', @SubCategoryName = 'shoes', @Name = 'Casual Sneakers', @Description = 'Comfortable Sneakers', @Price = 2200.00, @StockQuantity = 30, @ImageUrl = 'http://example.com/sneakers.jpg';
EXEC sp_add_product @VendorID = 1, @CategoryName = 'Male', @SubCategoryName = 'accessories', @Name = 'Leather Belt', @Description = 'Black Leather Belt', @Price = 900.00, @StockQuantity = 40, @ImageUrl = 'http://example.com/belt.jpg';
EXEC sp_add_product @VendorID = 1, @CategoryName = 'Male', @SubCategoryName = 'clothes', @Name = 'Formal Shirt', @Description = 'White Cotton Shirt', @Price = 1500.00, @StockQuantity = 35, @ImageUrl = 'http://example.com/shirt.jpg';

-- Vendor 2: Zara (Fashion Corner) - Female
EXEC sp_add_product @VendorID = 2, @CategoryName = 'Female', @SubCategoryName = 'clothes', @Name = 'Embroidered Kurti', @Description = 'Chiffon Kurti', @Price = 1300.00, @StockQuantity = 45, @ImageUrl = 'http://example.com/kurti.jpg';
EXEC sp_add_product @VendorID = 2, @CategoryName = 'Female', @SubCategoryName = 'shoes', @Name = 'High Heels', @Description = 'Black High Heels', @Price = 2700.00, @StockQuantity = 25, @ImageUrl = 'http://example.com/heels.jpg';
EXEC sp_add_product @VendorID = 2, @CategoryName = 'Female', @SubCategoryName = 'accessories', @Name = 'Silk Scarf', @Description = 'Printed Silk Scarf', @Price = 700.00, @StockQuantity = 50, @ImageUrl = 'http://example.com/scarf.jpg';
EXEC sp_add_product @VendorID = 2, @CategoryName = 'Female', @SubCategoryName = 'clothes', @Name = 'Lawn Suit', @Description = '3-Piece Lawn Suit', @Price = 2500.00, @StockQuantity = 30, @ImageUrl = 'http://example.com/lawnsuit.jpg';

-- Vendor 3: Omar (Kids Corner) - Children
EXEC sp_add_product @VendorID = 3, @CategoryName = 'Children', @SubCategoryName = 'clothes', @Name = 'Kids T-Shirt', @Description = 'Cartoon T-Shirt', @Price = 450.00, @StockQuantity = 60, @ImageUrl = 'http://example.com/kidsshirt.jpg';
EXEC sp_add_product @VendorID = 3, @CategoryName = 'Children', @SubCategoryName = 'shoes', @Name = 'Kids Sneakers', @Description = 'Comfortable Kids Shoes', @Price = 1000.00, @StockQuantity = 35, @ImageUrl = 'http://example.com/kidssneakers.jpg';
EXEC sp_add_product @VendorID = 3, @CategoryName = 'Children', @SubCategoryName = 'accessories', @Name = 'Kids Cap', @Description = 'Colorful Cap', @Price = 350.00, @StockQuantity = 70, @ImageUrl = 'http://example.com/kidscap.jpg';
EXEC sp_add_product @VendorID = 3, @CategoryName = 'Children', @SubCategoryName = 'clothes', @Name = 'Kids Hoodie', @Description = 'Warm Hoodie', @Price = 800.00, @StockQuantity = 40, @ImageUrl = 'http://example.com/kidshoodie.jpg';

-- Vendor 4: Bilal (Trendy Kids) - Children
EXEC sp_add_product @VendorID = 4, @CategoryName = 'Children', @SubCategoryName = 'clothes', @Name = 'Kids Jeans', @Description = 'Comfortable Jeans', @Price = 750.00, @StockQuantity = 50, @ImageUrl = 'http://example.com/kidsjeans.jpg';
EXEC sp_add_product @VendorID = 4, @CategoryName = 'Children', @SubCategoryName = 'accessories', @Name = 'Kids Belt', @Description = 'Adjustable Belt', @Price = 300.00, @StockQuantity = 60, @ImageUrl = 'http://example.com/kidsbelt.jpg';
EXEC sp_add_product @VendorID = 4, @CategoryName = 'Children', @SubCategoryName = 'clothes', @Name = 'Kids Jacket', @Description = 'Warm Jacket', @Price = 950.00, @StockQuantity = 40, @ImageUrl = 'http://example.com/kidsjacket.jpg';
EXEC sp_add_product @VendorID = 4, @CategoryName = 'Children', @SubCategoryName = 'shoes', @Name = 'Kids Sandals', @Description = 'Summer Sandals', @Price = 600.00, @StockQuantity = 45, @ImageUrl = 'http://example.com/kidssandals.jpg';

-- Vendor 5: Nadia (Chic Boutique) - Female
EXEC sp_add_product @VendorID = 5, @CategoryName = 'Female', @SubCategoryName = 'clothes', @Name = 'Shalwar Kameez', @Description = 'Embroidered Suit', @Price = 3000.00, @StockQuantity = 20, @ImageUrl = 'http://example.com/shalwarkameez.jpg';
EXEC sp_add_product @VendorID = 5, @CategoryName = 'Female', @SubCategoryName = 'accessories', @Name = 'Handbag', @Description = 'Leather Handbag', @Price = 1500.00, @StockQuantity = 30, @ImageUrl = 'http://example.com/handbag.jpg';
EXEC sp_add_product @VendorID = 5, @CategoryName = 'Female', @SubCategoryName = 'shoes', @Name = 'Flats', @Description = 'Comfortable Flats', @Price = 1200.00, @StockQuantity = 35, @ImageUrl = 'http://example.com/flats.jpg';
EXEC sp_add_product @VendorID = 5, @CategoryName = 'Female', @SubCategoryName = 'accessories', @Name = 'Earrings', @Description = 'Gold Earrings', @Price = 800.00, @StockQuantity = 50, @ImageUrl = 'http://example.com/earrings.jpg';
SELECT * FROM product;

-- 7. Insert Cart Items
INSERT INTO cart (user_id, product_id, quantity) VALUES 
(1, 1, 2), -- Ali: 2 Men’s T-Shirts
(2, 9, 1), -- Hassan: 1 Kids T-Shirt
(3, 5, 3), -- Fatima: 3 Kurtis
(4, 7, 2), -- Ayesha: 2 Scarves
(5, 13, 1); -- Maryam: 1 Kids Jeans
SELECT * FROM cart;

-- 8. Insert Orders using sp_checkout
-- Order 1: Ali Khan (Pending, Vendor: Sana)
EXEC sp_add_to_cart @UserID = 1, @ProductID = 1, @Quantity = 2; -- T-Shirt
EXEC sp_add_to_cart @UserID = 1, @ProductID = 2, @Quantity = 1; -- Sneakers
EXEC sp_checkout @UserID = 1, @ShippingAddressID = 1;

-- Order 2: Hassan Raza (Delivered, Vendor: Omar)
EXEC sp_add_to_cart @UserID = 2, @ProductID = 9, @Quantity = 1; -- Kids T-Shirt
EXEC sp_add_to_cart @UserID = 2, @ProductID = 10, @Quantity = 2; -- Kids Sneakers
EXEC sp_checkout @UserID = 2, @ShippingAddressID = 2;
UPDATE shop_order SET status = 'Delivered', order_date = DATEADD(DAY, -5, GETDATE()) WHERE id = 2;

-- Order 3: Fatima Noor (Pending, Vendor: Zara)
EXEC sp_add_to_cart @UserID = 3, @ProductID = 5, @Quantity = 2; -- Kurti
EXEC sp_add_to_cart @UserID = 3, @ProductID = 6, @Quantity = 1; -- Heels
EXEC sp_checkout @UserID = 3, @ShippingAddressID = 3;

-- Order 4: Ayesha Siddiqui (Rejected, Vendor: Zara)
EXEC sp_add_to_cart @UserID = 4, @ProductID = 7, @Quantity = 1; -- Scarf
EXEC sp_checkout @UserID = 4, @ShippingAddressID = 4;
UPDATE shop_order SET status = 'Rejected', order_date = DATEADD(DAY, -2, GETDATE()) WHERE id = 4;

-- Order 5: Maryam Iqbal (Pending, Vendor: Bilal)
EXEC sp_add_to_cart @UserID = 5, @ProductID = 13, @Quantity = 2; -- Kids Jeans
EXEC sp_add_to_cart @UserID = 5, @ProductID = 14, @Quantity = 1; -- Kids Belt
EXEC sp_checkout @UserID = 5, @ShippingAddressID = 5;

-- Order 6: Usman Tariq (Pending, Vendor: Sana)
EXEC sp_add_to_cart @UserID = 6, @ProductID = 3, @Quantity = 1; -- Leather Belt
EXEC sp_add_to_cart @UserID = 6, @ProductID = 4, @Quantity = 1; -- Formal Shirt
EXEC sp_checkout @UserID = 6, @ShippingAddressID = 6;

-- Order 7: Saima Zafar (Delivered, Vendor: Nadia)
EXEC sp_add_to_cart @UserID = 7, @ProductID = 17, @Quantity = 1; -- Shalwar Kameez
EXEC sp_checkout @UserID = 7, @ShippingAddressID = 7;
UPDATE shop_order SET status = 'Delivered', order_date = DATEADD(DAY, -3, GETDATE()) WHERE id = 7;

-- Order 8: Bilal Ahmed (Pending, Vendor: Omar)
EXEC sp_add_to_cart @UserID = 8, @ProductID = 11, @Quantity = 2; -- Kids Cap
EXEC sp_checkout @UserID = 8, @ShippingAddressID = 8;

-- Order 9: Zainab Malik (Delivered, Vendor: Bilal)
EXEC sp_add_to_cart @UserID = 9, @ProductID = 15, @Quantity = 1; -- Kids Jacket
EXEC sp_add_to_cart @UserID = 9, @ProductID = 16, @Quantity = 2; -- Kids Sandals
EXEC sp_checkout @UserID = 9, @ShippingAddressID = 9;
UPDATE shop_order SET status = 'Delivered', order_date = DATEADD(DAY, -4, GETDATE()) WHERE id = 9;

-- Order 10: Ali Khan (Pending, Vendor: Nadia)
EXEC sp_add_to_cart @UserID = 1, @ProductID = 18, @Quantity = 1; -- Handbag
EXEC sp_add_to_cart @UserID = 1, @ProductID = 19, @Quantity = 2; -- Flats
EXEC sp_checkout @UserID = 1, @ShippingAddressID = 1;

-- Verify Orders and Order Items
SELECT * FROM shop_order;
SELECT * FROM order_items;

-- 9. Insert Reviews (for purchased products)
INSERT INTO product_review (buyer_id, product_id, rating, comment, review_date) VALUES 
(2, 9, 4, 'Nice t-shirt for kids!', '2025-04-20'), -- Hassan: Kids T-Shirt
(2, 10, 5, 'Comfortable sneakers for kids', '2025-04-20'), -- Hassan: Kids Sneakers
(1, 1, 3, 'T-shirt quality is average', '2025-04-24'), -- Ali: T-Shirt
(3, 5, 4, 'Beautiful kurti, good fit', '2025-04-24'), -- Fatima: Kurti
(5, 13, 5, 'Kids love these jeans', '2025-04-24'), -- Maryam: Kids Jeans
(7, 17, 4, 'Elegant shalwar kameez', '2025-04-22'), -- Saima: Shalwar Kameez
(9, 15, 5, 'Warm and cozy jacket', '2025-04-21'), -- Zainab: Kids Jacket
(9, 16, 4, 'Good sandals for kids', '2025-04-21'), -- Zainab: Kids Sandals
(1, 2, 4, 'Sneakers are stylish', '2025-04-24'), -- Ali: Sneakers
(3, 6, 3, 'Heels are a bit tight', '2025-04-24'); -- Fatima: Heels
SELECT * FROM product_review;

-- Final Verification: VendorPendingOrdersView
SELECT * FROM VendorPendingOrdersView WHERE VendorID = 10; -- Sana’s pending orders




-- Insert Cart Items using sp_add_to_cart
-- Buyer 1: Ali Khan (UserID=1)
EXEC sp_add_to_cart @UserID = 1, @ProductID = 1, @Quantity = 2; -- Men’s T-Shirt (Sana)
EXEC sp_add_to_cart @UserID = 1, @ProductID = 5, @Quantity = 1; -- Embroidered Kurti (Zara)

-- Buyer 2: Hassan Raza (UserID=2)
EXEC sp_add_to_cart @UserID = 2, @ProductID = 9, @Quantity = 1; -- Kids T-Shirt (Omar)
EXEC sp_add_to_cart @UserID = 2, @ProductID = 11, @Quantity = 3; -- Kids Cap (Omar)

-- Buyer 3: Fatima Noor (UserID=3)
EXEC sp_add_to_cart @UserID = 3, @ProductID = 6, @Quantity = 1; -- High Heels (Zara)
EXEC sp_add_to_cart @UserID = 3, @ProductID = 17, @Quantity = 1; -- Shalwar Kameez (Nadia)

-- Buyer 4: Ayesha Siddiqui (UserID=4)
EXEC sp_add_to_cart @UserID = 4, @ProductID = 7, @Quantity = 2; -- Silk Scarf (Zara)
EXEC sp_add_to_cart @UserID = 4, @ProductID = 19, @Quantity = 1; -- Flats (Nadia)

-- Buyer 5: Maryam Iqbal (UserID=5)
EXEC sp_add_to_cart @UserID = 5, @ProductID = 13, @Quantity = 2; -- Kids Jeans (Bilal)
EXEC sp_add_to_cart @UserID = 5, @ProductID = 15, @Quantity = 1; -- Kids Jacket (Bilal)

-- Verify Cart Data
SELECT * FROM cart;



SELECT * FROM VendorPendingOrdersView WHERE VendorID = 1; -- Sana’s orders