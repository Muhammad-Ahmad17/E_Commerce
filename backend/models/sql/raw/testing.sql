-- Comprehensive E-Commerce System Testing Script
-- Purpose: Tests all flows and components of the e-commerce system after updates.
-- Updates Tested:
-- - sp_update_product_quantity: Adds stock instead of replacing.
-- - sp_add_product: Uses @CategoryName, @SubCategoryName, creates if not exist.
-- - sp_auto_deliver_orders: Marks Pending orders as Delivered after 24 hours.
-- - trg_assign_user_role: Automatically assigns roles during user registration.
-- - Cleanup: Deletes data from non-empty tables and reseeds identity columns to start from 1.
-- Flows Tested:
-- - /login: Register buyer/vendor, verify role assignment, preferences, default address.
-- - /buyer_dashboard: Recommendations, category/subcategory filter.
-- - /buyer_dashboard/profile: Profile, order history, reviews.
-- - /buyer_dashboard/cart: Add/delete items, checkout with receipt.
-- - /vendor_dashboard: Add/update/delete products, analytics.
-- Components Tested:
-- - Triggers: trg_set_default_address, trg_validate_review, trg_cleanup_cart_on_product_deactivation, trg_assign_user_role.
-- - Views: BuyerDashboardView, CartView, BuyerOrderHistoryView, BuyerReviewHistoryView, VendorDashboardView, VendorAnalyticsView.
-- - Stored Procedures: sp_register_user, sp_add_to_cart, sp_delete_from_cart, sp_checkout, sp_add_product, sp_update_product_quantity, sp_delete_product, sp_delete_address, sp_auto_deliver_orders.
-- Prerequisites:
-- - Schema (artifact_id: 961d1420-c9f6-447b-a0ec-9a1f0fe5ef43) created.
-- - Triggers, views, procedures (artifact_id: 5ba7cffe-fcbd-418d-866b-b1b97055c14d) applied.
-- Notes:
-- - Silent execution with minimal output (SET NOCOUNT ON).
-- - Cleanup uses conditional delete and reseed (artifact_id: c7973765-e18d-4973-91a3-cc4361113be6).
-- - Verifies identity reseed (IDs start from 1).
-- - Optional triggers (trg_validate_review, trg_cleanup_cart_on_product_deactivation) tested; disable in main file if not needed.
-- Created by: Grok 3 for xAI
-- Date: April 25, 2025

USE E_Commerce;
GO

SET NOCOUNT ON;

-- SECTION 1: SETUP
-- Insert initial roles (needed for registration)
INSERT INTO role (name) VALUES ('buyer'), ('vendor'), ('manager');

-- SECTION 2: TEST CASES

-- TEST CASE 1: /login - Register Buyer and Vendor with Role Trigger
EXEC sp_register_user 
    @FullName = 'Ali Khan', 
    @EmailAddress = 'ali@example.com', 
    @PasswordHash = 'hashed_password_1', 
    @RoleName = 'buyer', 
    @Preferences = 'male', 
    @AddressLine1 = '123 Main St', 
    @City = 'Karachi', 
    @PostalCode = '75000', 
    @Country = 'Pakistan';

EXEC sp_register_user 
    @FullName = 'Sana Malik', 
    @EmailAddress = 'sana@example.com', 
    @PasswordHash = 'hashed_password_2', 
    @RoleName = 'vendor', 
    @VendorName = 'Sana’s Shop', 
    @AddressLine1 = '456 Shop St', 
    @City = 'Lahore', 
    @PostalCode = '54000', 
    @Country = 'Pakistan';

-- Verify Buyer Registration, Role, and Default Address
SELECT 
    u.id AS UserID,
    u.full_name,
    b.preferences,
    a.address_line1,
    a.is_default,
    r.name AS RoleName
FROM [user] u
JOIN buyer b ON u.id = b.user_id
LEFT JOIN address a ON u.id = a.user_id
JOIN user_role ur ON u.id = ur.user_id
JOIN role r ON ur.role_id = r.id
WHERE u.email_address = 'ali@example.com';
-- Expected: UserID=1, preferences='male', is_default=1, RoleName='buyer'

-- Verify Vendor Registration and Role
SELECT 
    u.id AS UserID,
    v.vendor_name,
    r.name AS RoleName
FROM [user] u
JOIN vendor v ON u.id = v.user_id
JOIN user_role ur ON u.id = ur.user_id
JOIN role r ON ur.role_id = r.id
WHERE u.email_address = 'sana@example.com';
-- Expected: UserID=2, vendor_name='Sana’s Shop', RoleName='vendor'
-- Test Invalid Role
BEGIN TRY
    EXEC sp_register_user 
        @FullName = 'Test User', 
        @EmailAddress = 'test@example.com', 
        @PasswordHash = 'hashed_password_3', 
        @RoleName = 'invalid_role';
END TRY
BEGIN CATCH
    SELECT ERROR_MESSAGE() AS ErrorMessage;
END CATCH
-- Expected: ErrorMessage='Invalid role specified for user'

-- TEST CASE 2: /vendor_dashboard - Add and Update Products
EXEC sp_add_product 
    @VendorID = 3, 
    @CategoryName = 'male', 
    @SubCategoryName = 'clothes', 
    @Name = 'Men’s T-Shirt', 
    @Description = 'Cotton T-Shirt', 
    @Price = 500.00, 
    @StockQuantity = 20, 
    @ImageUrl = 'http://example.com/tshirt.jpg';

EXEC sp_add_product 
    @VendorID = 3, 
    @CategoryName = 'male', 
    @SubCategoryName = 'shoes', 
    @Name = 'Men’s Shoes', 
    @Description = 'Leather Shoes', 
    @Price = 1500.00, 
    @StockQuantity = 10, 
    @ImageUrl = 'http://example.com/shoes.jpg';

-- Verify Added Products and Categories
SELECT 
    p.id AS ProductID,
    p.name,
    p.stock_quantity,
    c.name AS CategoryName,
    cs.name AS SubCategoryName
FROM product p
JOIN category c ON p.category_id = c.id
JOIN category_sub cs ON p.category_sub_id = cs.id
WHERE p.vendor_id = 3;
-- Expected: ProductID=1 (Men’s T-Shirt, CategoryName='male', SubCategoryName='clothes', stock_quantity=20)
--           ProductID=2 (Men’s Shoes, SubCategoryName='shoes', stock_quantity=10)
select * from product
-- Test Stock Addition
EXEC sp_update_product_quantity 
    @ProductID = 2, 
    @VendorID = 3, 
    @StockQuantity = 5;
-- Verify Stock Addition
SELECT stock_quantity 
FROM product 
WHERE id = 1;
-- Expected: stock_quantity=25 (20 + 5)

-- Test Negative Stock
BEGIN TRY
    EXEC sp_update_product_quantity 
        @ProductID = 1, 
        @VendorID = 3, 
        @StockQuantity = -5;
END TRY
BEGIN CATCH
    SELECT ERROR_MESSAGE() AS ErrorMessage;
END CATCH
-- Expected: ErrorMessage='Stock quantity cannot be negative'

-- TEST CASE 3: /buyer_dashboard - Recommendations and Category Filter
-- Verify Recommendations
SELECT 
    UserID,
    preferences,
    RecommendedProductID,
    RecommendedProduct
FROM BuyerDashboardView
WHERE UserID = 1;
-- Expected: UserID=1, preferences='male', RecommendedProduct='Men’s T-Shirt', 'Men’s Shoes'

-- Verify Category/Subcategory Filter
SELECT 
    p.id,
    p.name,
    c.name AS CategoryName,
    cs.name AS SubCategoryName
FROM product p
JOIN category c ON p.category_id = c.id
JOIN category_sub cs ON p.category_sub_id = cs.id
WHERE c.name = 'male' AND cs.name = 'clothes' AND p.is_active = 1;
-- Expected: id=1, name='Men’s T-Shirt', CategoryName='male', SubCategoryName='clothes'

-- TEST CASE 4: /buyer_dashboard/cart - Cart Management and Checkout
EXEC sp_add_to_cart 
    @UserID = 1, 
    @ProductID = 1, 
    @Quantity = 2;

EXEC sp_add_to_cart 
    @UserID = 1, 
    @ProductID = 2, 
    @Quantity = 1;

-- Verify Cart Contents
SELECT 
    CartItemID,
    ProductID,
    ProductName,
    quantity,
    TotalPrice
FROM CartView
WHERE UserID = 1;
-- Expected: 2 rows, ProductID=1 (quantity=2, TotalPrice=1000), ProductID=2 (quantity=1, TotalPrice=1500)

EXEC sp_delete_from_cart 
    @UserID = 1, 
    @CartItemID = 5;

-- Verify Cart After Deletion
SELECT * FROM CartView WHERE UserID = 1;
-- Expected: 1 row, ProductID=1 (Men’s T-Shirt)

EXEC sp_checkout 
    @UserID = 1, 
    @ShippingAddressID = 1;

-- Verify Checkout
SELECT 
    OrderID,
    total_amount,
    OrderStatus,
    ProductName,
    quantity,
    ItemTotal
FROM BuyerOrderHistoryView
WHERE UserID = 1;
-- Expected: OrderID=1, total_amount=1000, OrderStatus='Pending', ProductName='Men’s T-Shirt', quantity=2

-- Verify Stock After Checkout
SELECT stock_quantity 
FROM product 
WHERE id = 1;
-- Expected: stock_quantity=23 (25 - 2)

-- Verify Cart Cleared
SELECT * FROM CartView WHERE UserID = 1;
-- Expected: No rows

-- TEST CASE 5: /buyer_dashboard/profile - Profile, Order History, Reviews
-- Verify Profile
SELECT distinct
    UserID,
    full_name,
    preferences,
    address_line1
FROM BuyerDashboardView
WHERE UserID = 1;
-- Expected: UserID=1, full_name='Ali Khan', preferences='male'

-- Verify Order History
SELECT 
    OrderID,
    total_amount,
    ProductName,
    quantity
FROM BuyerOrderHistoryView
WHERE UserID = 1;
-- Expected: OrderID=1, total_amount=1000, ProductName='Men’s T-Shirt'

INSERT INTO product_review (buyer_id, product_id, rating, comment)
VALUES (4, 1, 4, 'Good quality T-Shirt');
select * from buyer
-- Verify Review
SELECT 
    ReviewID,
    ProductName,
    rating
FROM BuyerReviewHistoryView
WHERE UserID = 1;
-- Expected: ReviewID=1, ProductName='Men’s T-Shirt', rating=4

-- Test Invalid Review
BEGIN TRY
    INSERT INTO product_review (buyer_id, product_id, rating, comment)
    VALUES (1, 2, 3, 'Test review for unpurchased product');
END TRY
BEGIN CATCH
    SELECT ERROR_MESSAGE() AS ErrorMessage;
END CATCH
-- Expected: ErrorMessage='Cannot review product not purchased'

-- TEST CASE 6: Auto-Delivery of Pending Orders
UPDATE shop_order
SET order_date = DATEADD(DAY, -2, GETDATE())
WHERE id = 1;

-- Verify Pending Order
SELECT id, status 
FROM shop_order 
WHERE id = 2;
-- Expected: status='Pending'

EXEC sp_auto_deliver_orders;

-- Verify Auto-Delivery
SELECT id, status 
FROM shop_order 
WHERE id = 2;
-- Expected: status='Delivered'
select * from shop_order
-- TEST CASE 7: /vendor_dashboard - Product Deletion and Analytics
-- Verify Vendor Dashboard
SELECT 
    UserID,
    ProductID,
    ProductName,
    stock_quantity,
    ProductRating
FROM VendorDashboardView
WHERE UserID = 2;
-- Expected: ProductID=1 (Men’s T-Shirt, rating=4), ProductID=2 (Men’s Shoes)

-- Verify Analytics
SELECT 
    ProductID,
    ProductName,
    TotalUnitsSold,
    TotalRevenue,
    AverageRating,
    DeliveredOrders
FROM VendorAnalyticsView
WHERE UserID = 2;
-- Expected: ProductID=1, TotalUnitsSold=2, TotalRevenue=1000, AverageRating=4, DeliveredOrders=1

-- Test Product Deactivation
EXEC sp_add_to_cart @UserID = 1, @ProductID = 2, @Quantity = 1;
UPDATE product SET is_active = 0 WHERE id = 2;

-- Verify Cart Cleanup
SELECT * FROM CartView WHERE UserID = 1 AND ProductID = 2;
-- Expected: No rows

EXEC sp_delete_product 
    @ProductID = 1, 
    @VendorID = 1;

-- Verify Product Deletion
SELECT * FROM product WHERE id = 1;
-- Expected: No rows

-- TEST CASE 8: Address Deletion
EXEC sp_delete_address 
    @AddressID = 1, 
    @UserID = 1;

-- Verify Address Deletion
SELECT * FROM address WHERE id = 1;
-- Expected: No rows

-- TEST CASE 9: Verify Identity Reseed
-- Insert a new user to check ID starts from 1 after cleanup
EXEC sp_register_user 
    @FullName = 'New User', 
    @EmailAddress = 'new@example.com', 
    @PasswordHash = 'hashed_password_4', 
    @RoleName = 'buyer', 
    @Preferences = 'female';

-- Verify New User ID
SELECT id AS UserID
FROM [user]
WHERE email_address = 'new@example.com';
-- Expected: UserID=1 (after reseed)

-- SECTION 3: CLEANUP
-- go to admain related for cleaning


-- Test Script for VendorPendingOrdersView
-- Purpose: Tests VendorPendingOrdersView to ensure it correctly displays pending orders for vendors.
-- Tests:
-- - Main: Verify pending orders for vendor (VendorID, OrderID, ProductName, etc.).
-- - Edge Case 1: No pending orders (empty view).
-- - Edge Case 2: Non-vendor (no data for non-vendor user).
-- - Setup: Adds vendor, buyer, products, and pending orders.
-- - Cleanup: Conditional delete and identity reseed (artifact_id: c7973765-e18d-4973-91a3-cc4361113be6).
-- Prerequisites:
-- - Schema (artifact_id: 961d1420-c9f6-447b-a0ec-9a1f0fe5ef43).
-- - Triggers, views, procedures (artifact_id: 5ba7cffe-fcbd-418d-866b-b1b97055c14d).
-- Notes:
-- - Silent execution (SET NOCOUNT ON).
-- - Compatible with vendor_dashboard flow.
-- Created by: Grok 3 for xAI
-- Date: April 25, 2025

USE db_E_Commerce;
GO

SET NOCOUNT ON;

-- SECTION 1: SETUP
-- Insert roles
INSERT INTO role (name) VALUES ('buyer'), ('vendor');

-- Register buyer
EXEC sp_register_user 
    @FullName = 'Ali Khan', 
    @EmailAddress = 'ali@example.com', 
    @PasswordHash = 'hashed_password_1', 
    @RoleName = 'buyer', 
    @Preferences = 'male', 
    @AddressLine1 = '123 Main St', 
    @City = 'Karachi', 
    @PostalCode = '75000', 
    @Country = 'Pakistan';

-- Register vendor
EXEC sp_register_user 
    @FullName = 'Sana Malik', 
    @EmailAddress = 'sana@example.com', 
    @PasswordHash = 'hashed_password_2', 
    @RoleName = 'vendor', 
    @VendorName = 'Sana’s Shop', 
    @AddressLine1 = '456 Shop St', 
    @City = 'Lahore', 
    @PostalCode = '54000', 
    @Country = 'Pakistan';
	select * from vendor
-- Add products by vendor
EXEC sp_add_product 
    @VendorID = 1, 
    @CategoryName = 'male', 
    @SubCategoryName = 'clothes', 
    @Name = 'Men’s T-Shirt', 
    @Description = 'Cotton T-Shirt', 
    @Price = 500.00, 
    @StockQuantity = 20, 
    @ImageUrl = 'http://example.com/tshirt.jpg';

EXEC sp_add_product 
    @VendorID = 1, 
    @CategoryName = 'male', 
    @SubCategoryName = 'shoes', 
    @Name = 'Men’s Shoes', 
    @Description = 'Leather Shoes', 
    @Price = 1500.00, 
    @StockQuantity = 10, 
    @ImageUrl = 'http://example.com/shoes.jpg';

-- Buyer adds to cart and checks out
EXEC sp_add_to_cart 
    @UserID = 1, 
    @ProductID = 1, 
    @Quantity = 2;

EXEC sp_checkout 
    @UserID = 1, 
    @ShippingAddressID = 1;

-- SECTION 2: TEST CASES

-- TEST CASE 1: Verify Pending Orders for Vendor
SELECT 
    VendorID,
    VendorName,
    OrderID,
    BuyerName,
    ProductName,
    Quantity,
    TotalPrice,
    ShippingAddress
FROM VendorPendingOrdersView
WHERE VendorID = 1;
-- Expected: VendorID=1, VendorName='Sana’s Shop', OrderID=1, ProductName='Men’s T-Shirt', Quantity=2, TotalPrice=1000

-- TEST CASE 2: No Pending Orders (Mark Order as Delivered)
UPDATE shop_order SET status = 'Delivered' WHERE id = 1;

SELECT * FROM VendorPendingOrdersView WHERE VendorID = 1;
-- Expected: No rows

-- TEST CASE 3: Non-Vendor (No Data)
SELECT * FROM VendorPendingOrdersView WHERE VendorID = 999;
-- Expected: No rows
