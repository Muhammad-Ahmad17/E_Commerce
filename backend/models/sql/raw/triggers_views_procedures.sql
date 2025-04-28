-- Drop All Triggers, Views, and Stored Procedures Script
-- Purpose: Removes all existing triggers, views, and stored procedures from db_E_Commerce database
--          to allow updating with new versions (e.g., artifact_id: 5ba7cffe-fcbd-418d-866b-b1b97055c14d).
-- Objects Dropped:
-- - Triggers: trg_set_default_address, trg_validate_review, trg_cleanup_cart_on_product_deactivation, trg_assign_user_role
-- - Views: BuyerDashboardView, CartView, BuyerOrderHistoryView, BuyerReviewHistoryView, VendorDashboardView, VendorAnalyticsView
-- - Stored Procedures: sp_register_user, sp_add_to_cart, sp_delete_from_cart, sp_checkout, sp_add_product,
--                     sp_update_product_quantity, sp_delete_product, sp_delete_address, sp_auto_deliver_orders
-- Notes:
-- - Uses IF EXISTS to avoid errors if objects don't exist.
-- - Does not affect schema tables, data, or constraints (artifact_id: 961d1420-c9f6-447b-a0ec-9a1f0fe5ef43).
-- - Run before applying new triggers, views, procedures file.
-- Created by: Grok 3 for xAI
-- Date: April 25, 2025

USE E_Commerce;
GO
-- SECTION 1: DROP TRIGGERS

IF EXISTS (SELECT 1 FROM sys.triggers WHERE name = 'trg_set_default_address')
    DROP TRIGGER trg_set_default_address;
GO

IF EXISTS (SELECT 1 FROM sys.triggers WHERE name = 'trg_validate_review')
    DROP TRIGGER trg_validate_review;
GO

IF EXISTS (SELECT 1 FROM sys.triggers WHERE name = 'trg_cleanup_cart_on_product_deactivation')
    DROP TRIGGER trg_cleanup_cart_on_product_deactivation;
GO

use E_Commerce
IF EXISTS (SELECT 1 FROM sys.triggers WHERE name = 'trg_assign_user_role')
    DROP TRIGGER trg_assign_user_role;
GO

-- SECTION 2: DROP VIEWS

IF EXISTS (SELECT 1 FROM sys.views WHERE name = 'BuyerDashboardView')
    DROP VIEW BuyerDashboardView;
GO

IF EXISTS (SELECT 1 FROM sys.views WHERE name = 'CartView')
    DROP VIEW CartView;
GO

IF EXISTS (SELECT 1 FROM sys.views WHERE name = 'BuyerOrderHistoryView')
    DROP VIEW BuyerOrderHistoryView;
GO

IF EXISTS (SELECT 1 FROM sys.views WHERE name = 'BuyerReviewHistoryView')
    DROP VIEW BuyerReviewHistoryView;
GO

IF EXISTS (SELECT 1 FROM sys.views WHERE name = 'VendorDashboardView')
    DROP VIEW VendorDashboardView;
GO

IF EXISTS (SELECT 1 FROM sys.views WHERE name = 'VendorAnalyticsView')
    DROP VIEW VendorAnalyticsView;
GO

-- SECTION 3: DROP STORED PROCEDURES

IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'sp_register_user')
    DROP PROCEDURE sp_register_user;
GO

IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'sp_add_to_cart')
    DROP PROCEDURE sp_add_to_cart;
GO

IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'sp_delete_from_cart')
    DROP PROCEDURE sp_delete_from_cart;
GO

IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'sp_checkout')
    DROP PROCEDURE sp_checkout;
GO

IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'sp_add_product')
    DROP PROCEDURE sp_add_product;
GO

IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'sp_update_product_quantity')
    DROP PROCEDURE sp_update_product_quantity;
GO

IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'sp_delete_product')
    DROP PROCEDURE sp_delete_product;
GO

IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'sp_delete_address')
    DROP PROCEDURE sp_delete_address;
GO

IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'sp_auto_deliver_orders')
    DROP PROCEDURE sp_auto_deliver_orders;
GO



-- E-Commerce Triggers, Views, and Stored Procedures Script (Updated with Role Trigger)
-- Purpose: Defines all triggers, views, and stored procedures with automatic role assignment via trigger.
-- Updates:
-- 1. Added trg_assign_user_role: Automatically assigns role to user in user_role table after user insert.
-- 2. Modified sp_register_user: Removed manual role assignment, uses CONTEXT_INFO to pass @RoleName to trigger.
-- 3. Previous updates retained:
--    - sp_update_product_quantity: Adds stock instead of replacing.
--    - sp_add_product: Takes @CategoryName and @SubCategoryName, creates if not exist.
--    - sp_auto_deliver_orders: Marks Pending orders as Delivered after 24 hours.
-- Flow Covered:
-- 1. /login: User registration (buyer/vendor), preferences, vendor name, address, role assignment via trigger.
-- 2. /buyer_dashboard: Recommended products, category/subcategory filter.
-- 3. /buyer_dashboard/profile: View profile, order history, reviews.
-- 4. /buyer_dashboard/cart: Add/delete items, checkout with receipt.
-- 5. /vendor_dashboard: Add/update/delete products, view products, reviews, analytics.
-- Components:
-- - Triggers (4): Default address, review validation, cart cleanup, role assignment.
-- - Views (6): Dashboards and analytics.
-- - Stored Procedures (9): Business logic, including auto-delivery.
-- Notes:
-- - Incorporates foreign key fixes (ON DELETE NO ACTION).
-- - Aligned with schema (artifact_id: 961d1420-c9f6-447b-a0ec-9a1f0fe5ef43).
-- - Optional triggers (trg_validate_review, trg_cleanup_cart_on_product_deactivation) included; comment out if not needed.
-- Created by: Grok 3 for xAI
-- Date: April 25, 2025

USE E_Commerce;
GO

-- SECTION 1: TRIGGERS
-- Purpose: Automate actions on data changes.

CREATE TRIGGER trg_set_default_address
ON address
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE address
    SET is_default = 1
    WHERE id IN (
        SELECT i.id
        FROM inserted i
        WHERE NOT EXISTS (
            SELECT 1
            FROM address a
            WHERE a.user_id = i.user_id AND a.id != i.id
        )
    );
END;
GO

CREATE TRIGGER trg_validate_review
ON product_review
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE NOT EXISTS (
            SELECT 1
            FROM order_items oi
            JOIN shop_order so ON oi.order_id = so.id
            WHERE so.user_id = (SELECT user_id FROM buyer WHERE id = i.buyer_id)
            AND oi.product_id = i.product_id
        )
    )
    BEGIN
        THROW 50001, 'Cannot review product not purchased', 1;
        ROLLBACK;
    END
END;
GO

CREATE TRIGGER trg_cleanup_cart_on_product_deactivation
ON product
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(is_active)
    BEGIN
        DELETE FROM cart
        WHERE product_id IN (
            SELECT i.id
            FROM inserted i
            JOIN deleted d ON i.id = d.id
            WHERE i.is_active = 0 AND d.is_active = 1
        );
    END
END;
GO


-- droped the trigger to avoid conflict 
CREATE TRIGGER trg_assign_user_role
ON [user]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @RoleName NVARCHAR(50);
    DECLARE @RoleID INT;
    DECLARE @UserID INT;

    -- Get RoleName from CONTEXT_INFO
    SELECT @RoleName = CAST(CAST(CONTEXT_INFO() AS VARCHAR(128)) AS NVARCHAR(50));

    -- Validate role
    SELECT @RoleID = id FROM role WHERE name = @RoleName;
    IF @RoleID IS NULL
    BEGIN
        THROW 50002, 'Invalid role specified for user', 1;
        ROLLBACK;
        RETURN;
    END

    -- Get inserted user ID
    SELECT @UserID = id FROM inserted;

    -- Assign role
    INSERT INTO user_role (user_id, role_id)
    VALUES (@UserID, @RoleID);
END;
GO

-- SECTION 2: VIEWS
-- Purpose: Simplify data retrieval for UI and analytics.

-- View to show products based on buyer's preferred category
CREATE OR ALTER VIEW buyerCategoryProducts
AS
SELECT 
    u.id AS user_id,
    u.full_name,
    b.preferences AS preferred_category,
    c.id AS category_id,
    c.name AS category_name,
    p.id AS product_id,
    p.name AS product_name,
    p.price,
    p.image_url,
    v.vendor_name
FROM [user] u
INNER JOIN user_role ur ON u.id = ur.user_id
INNER JOIN role r ON ur.role_id = r.id
INNER JOIN buyer b ON u.id = b.user_id
INNER JOIN category c ON b.preferences = c.name
INNER JOIN product p ON c.id = p.category_id
INNER JOIN vendor v ON p.vendor_id = v.id
WHERE r.name = 'buyer' AND u.is_active = 1;
GO

SELECT * FROM buyerCategoryProducts

-- View to show product details for buyers, filterable by product ID
CREATE OR ALTER VIEW productDetails
AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.price,
    p.description,
    c.name AS category_name,
    p.image_url,
    v.vendor_name

FROM product p
INNER JOIN category c ON p.category_id = c.id
INNER JOIN vendor v ON p.vendor_id = v.id
INNER JOIN [user] u ON v.user_id = u.id
WHERE u.is_active = 1
  AND EXISTS (
      SELECT 1 
      FROM user_role ur 
      INNER JOIN role r ON ur.role_id = r.id 
      WHERE r.name = 'buyer'
  );
GO

select * from productDetails where product_id = 1
--useless view
CREATE VIEW BuyerDashboardView
AS
SELECT 
    u.id AS UserID,
    u.full_name,
    u.email_address,
    b.preferences,
    a.address_line1,
    a.city,
    a.postal_code,
    a.country,
    p.id AS RecommendedProductID,
    p.name AS RecommendedProduct,
    p.price AS RecommendedPrice,
    p.image_url AS RecommendedProductImage
FROM [user] u
JOIN buyer b ON u.id = b.user_id
LEFT JOIN address a ON u.id = a.user_id AND a.is_default = 1
LEFT JOIN product p ON p.category_id = (SELECT id FROM category WHERE name = b.preferences)
WHERE u.is_active = 1 AND p.is_active = 1;
GO


CREATE OR ALTER VIEW buyerCartView
AS
SELECT 
    c.id AS cart_item_id,
    c.user_id AS user_id,
    p.id AS product_id,
    p.name AS product_name,
    p.description AS product_description,
    p.price AS unit_price,
    c.quantity,
    (p.price * c.quantity) AS total_price,
    p.image_url,
    v.vendor_name,
    cat.name AS category_name
FROM cart c
INNER JOIN product p ON c.product_id = p.id
INNER JOIN vendor v ON p.vendor_id = v.id
INNER JOIN category cat ON p.category_id = cat.id
INNER JOIN [user] u ON c.user_id = u.id
INNER JOIN user_role ur ON u.id = ur.user_id
INNER JOIN role r ON ur.role_id = r.id
WHERE p.is_active = 1
  AND u.is_active = 1
  AND r.name = 'buyer';
GO


SELECT * FROM buyerCartView WHERE user_id = 1;


CREATE VIEW BuyerOrderHistoryView
AS
SELECT 
    so.id AS OrderID,
    so.user_id AS UserID,
    so.order_date,
    so.total_amount,
    so.status AS OrderStatus,
    so.expected_delivery_date,
    p.name AS ProductName,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) AS ItemTotal,
    a.address_line1 AS ShippingAddress,
    a.city,
    a.postal_code,
    a.country
FROM shop_order so
JOIN order_items oi ON so.id = oi.order_id
JOIN product p ON oi.product_id = p.id
JOIN address a ON so.shipping_address_id = a.id
WHERE so.user_id IN (SELECT user_id FROM buyer);
GO
SELECT 
   *
FROM BuyerOrderHistoryView
WHERE UserID = 1;
-- View for vendor dashboard with low stock alert
CREATE OR ALTER VIEW VendorDashboardView
AS
SELECT 
    u.id AS UserID,                -- Add this line
    v.id AS VendorID,
    v.vendor_name,
    p.id AS ProductID,
    p.name AS ProductName,
    p.description,
    p.price,
    p.stock_quantity,
    p.image_url,
    c.name AS CategoryName,
    cs.name AS SubCategoryName,
    pr.rating AS ProductRating,
    pr.comment AS ProductComment,
    CASE 
        WHEN p.stock_quantity < 5 THEN 'Low Stock'
        ELSE 'Sufficient Stock'
    END AS LowStockAlert
FROM vendor v
JOIN [user] u ON v.user_id = u.id
JOIN product p ON v.id = p.vendor_id
JOIN category c ON p.category_id = c.id
JOIN category_sub cs ON p.category_sub_id = cs.id
LEFT JOIN product_review pr ON p.id = pr.product_id
WHERE u.is_active = 1 AND p.is_active = 1;
GO


use E_Commerce
CREATE VIEW VendorPendingOrdersView
AS
SELECT 
    v.id AS VendorID,
    v.vendor_name AS VendorName,
    so.id AS OrderID,
    u.full_name AS BuyerName,
    p.name AS ProductName,
    oi.quantity AS Quantity,
    oi.unit_price AS UnitPrice,
    (oi.quantity * oi.unit_price) AS TotalPrice,
    so.order_date AS OrderDate,
    so.expected_delivery_date AS ExpectedDeliveryDate,
    a.address_line1 + ', ' + a.city + ', ' + a.postal_code + ', ' + a.country AS ShippingAddress
FROM shop_order so
JOIN order_items oi ON so.id = oi.order_id
JOIN product p ON oi.product_id = p.id
JOIN vendor v ON p.vendor_id = v.id
JOIN [user] u ON so.user_id = u.id
JOIN address a ON so.shipping_address_id = a.id
WHERE so.status = 'Pending' AND p.is_active = 1;
GO

-- Show pending orders for vendor with VendorID = 11
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
WHERE vendorid = 11;

SELECT * FROM VendorPendingOrdersView WHERE vendorid = 1;

CREATE VIEW VendorAnalyticsView
AS
SELECT 
    u.id AS UserID,
    v.vendor_name AS StoreName,
    p.id AS ProductID,
    p.name AS ProductName,
    COUNT(oi.id) AS TotalOrders,
    SUM(oi.quantity) AS TotalUnitsSold,
    SUM(oi.quantity * oi.unit_price) AS TotalRevenue,
    AVG(CAST(pr.rating AS FLOAT)) AS AverageRating,
    SUM(CASE WHEN so.status = 'Pending' THEN 1 ELSE 0 END) AS PendingOrders,
    SUM(CASE WHEN so.status = 'Delivered' THEN 1 ELSE 0 END) AS DeliveredOrders,
    SUM(CASE WHEN so.status = 'Rejected' THEN 1 ELSE 0 END) AS RejectedOrders
FROM [user] u
JOIN vendor v ON u.id = v.user_id
JOIN product p ON v.id = p.vendor_id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN shop_order so ON oi.order_id = so.id
LEFT JOIN product_review pr ON p.id = pr.product_id
WHERE u.is_active = 1
GROUP BY u.id, v.vendor_name, p.id, p.name;
GO


select * from VendorAnalyticsView where userid = 11
-- SECTION 3: STORED PROCEDURES
-- Purpose: Encapsulate business logic for user actions.

CREATE OR ALTER PROCEDURE sp_add_buyer
    @FullName NVARCHAR(100),
    @Email NVARCHAR(100),
    @Password NVARCHAR(256),
    @Preferences NVARCHAR(20),
    @AddressLine1 NVARCHAR(255),
    @City NVARCHAR(100),
    @PostalCode NVARCHAR(20),
    @Country NVARCHAR(100),
    @IsDefault BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Validate inputs
        IF @FullName IS NULL OR @Email IS NULL OR @Password IS NULL OR @Preferences IS NULL
            THROW 50001, 'Full name, email, password, and preferences are required', 1;
        IF @AddressLine1 IS NULL OR @City IS NULL OR @PostalCode IS NULL OR @Country IS NULL
            THROW 50002, 'Address line 1, city, postal code, and country are required', 1;
        IF @Preferences NOT IN ('male', 'female', 'children')
            THROW 50003, 'Preferences must be male, female, or children', 1;

        -- Check if email already exists
        IF EXISTS (SELECT 1 FROM [user] WHERE email_address = @Email)
            THROW 50004, 'Email already exists', 1;

        DECLARE @UserID INT;
        DECLARE @RoleID INT;

        -- Start transaction
        BEGIN TRANSACTION;

        -- Insert into user table
        INSERT INTO [user] (full_name, email_address, password_hash, created_at, is_active)
        VALUES (@FullName, @Email, @Password, GETDATE(), 1);

        -- Get the new user ID
        SET @UserID = SCOPE_IDENTITY();

        -- Get buyer role ID
        SELECT @RoleID = id FROM role WHERE name = 'buyer';
        IF @RoleID IS NULL
        BEGIN
            ROLLBACK;
            THROW 50005, 'Buyer role not found', 1;
        END;

        -- Insert into user_role
        INSERT INTO user_role (user_id, role_id, assigned_at)
        VALUES (@UserID, @RoleID, GETDATE());

        -- Insert into buyer table
        INSERT INTO buyer (user_id, preferences, created_at)
        VALUES (@UserID, @Preferences, GETDATE());

        -- Insert into address table
        INSERT INTO address (user_id, address_line1, city, postal_code, country, is_default)
        VALUES (@UserID, @AddressLine1, @City, @PostalCode, @Country, @IsDefault);

        COMMIT TRANSACTION;

        -- Return success
        SELECT @UserID AS user_id, 'Buyer added successfully' AS message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        SELECT 0 AS user_id, @ErrorMessage AS message;
    END CATCH;
END;
GO

-- Stored procedure to add a vendor with address
CREATE OR ALTER PROCEDURE sp_add_vendor
    @FullName NVARCHAR(100),
    @Email NVARCHAR(100),
    @Password NVARCHAR(256),
    @VendorName NVARCHAR(100),
    @AddressLine1 NVARCHAR(255),
    @City NVARCHAR(100),
    @PostalCode NVARCHAR(20),
    @Country NVARCHAR(100),
    @IsDefault BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Validate inputs
        IF @FullName IS NULL OR @Email IS NULL OR @Password IS NULL OR @VendorName IS NULL
            THROW 50001, 'Full name, email, password, and vendor name are required', 1;
        IF @AddressLine1 IS NULL OR @City IS NULL OR @PostalCode IS NULL OR @Country IS NULL
            THROW 50002, 'Address line 1, city, postal code, and country are required', 1;

        -- Check if email already exists
        IF EXISTS (SELECT 1 FROM [user] WHERE email_address = @Email)
            THROW 50003, 'Email already exists', 1;

        -- Check if vendor name already exists
        IF EXISTS (SELECT 1 FROM vendor WHERE vendor_name = @VendorName)
            THROW 50004, 'Vendor name already exists', 1;

        DECLARE @UserID INT;
        DECLARE @RoleID INT;

        -- Start transaction
        BEGIN TRANSACTION;

        -- Insert into user table
        INSERT INTO [user] (full_name, email_address, password_hash, created_at, is_active)
        VALUES (@FullName, @Email, @Password, GETDATE(), 1);

        -- Get the new user ID
        SET @UserID = SCOPE_IDENTITY();

        -- Get vendor role ID
        SELECT @RoleID = id FROM role WHERE name = 'vendor';
        IF @RoleID IS NULL
        BEGIN
            ROLLBACK;
            THROW 50005, 'Vendor role not found', 1;
        END;

        -- Insert into user_role
        INSERT INTO user_role (user_id, role_id, assigned_at)
        VALUES (@UserID, @RoleID, GETDATE());

        -- Insert into vendor table
        INSERT INTO vendor (user_id, vendor_name, created_at)
        VALUES (@UserID, @VendorName, GETDATE());

        -- Insert into address table
        INSERT INTO address (user_id, address_line1, city, postal_code, country, is_default)
        VALUES (@UserID, @AddressLine1, @City, @PostalCode, @Country, @IsDefault);

        COMMIT TRANSACTION;

        -- Return success
        SELECT @UserID AS user_id, 'Vendor added successfully' AS message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        SELECT 0 AS user_id, @ErrorMessage AS message;
    END CATCH;
END;
GO

-- droped the procedure to avoid conflict
CREATE PROCEDURE sp_register_user
    @FullName NVARCHAR(100),
    @EmailAddress NVARCHAR(100),
    @PasswordHash NVARCHAR(256),
    @RoleName NVARCHAR(50),
    @Preferences NVARCHAR(20) = NULL,
    @VendorName NVARCHAR(100) = NULL,
    @AddressLine1 NVARCHAR(255) = NULL,
    @City NVARCHAR(100) = NULL,
    @PostalCode NVARCHAR(20) = NULL,
    @Country NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @UserID INT;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF EXISTS (SELECT 1 FROM [user] WHERE email_address = @EmailAddress)
        BEGIN
            THROW 50001, 'Email address already exists', 1;
        END

        -- Set CONTEXT_INFO for trigger to pick up RoleName
        DECLARE @ContextInfo VARBINARY(128) = CAST(@RoleName AS VARBINARY(128));
        SET CONTEXT_INFO @ContextInfo;

        INSERT INTO [user] (full_name, email_address, password_hash)
        VALUES (@FullName, @EmailAddress, @PasswordHash);
        SET @UserID = SCOPE_IDENTITY();

        IF @RoleName = 'buyer' AND @Preferences IS NOT NULL
        BEGIN
            IF @Preferences NOT IN ('male', 'female', 'children')
            BEGIN
                THROW 50003, 'Invalid preference', 1;
            END
            INSERT INTO buyer (user_id, preferences)
            VALUES (@UserID, @Preferences);
        END

        IF @RoleName = 'vendor' AND @VendorName IS NOT NULL
        BEGIN
            IF EXISTS (SELECT 1 FROM vendor WHERE vendor_name = @VendorName)
            BEGIN
                THROW 50004, 'Vendor name already exists', 1;
            END
            INSERT INTO vendor (user_id, vendor_name)
            VALUES (@UserID, @VendorName);
        END

        IF @AddressLine1 IS NOT NULL AND @City IS NOT NULL AND @PostalCode IS NOT NULL AND @Country IS NOT NULL
        BEGIN
            INSERT INTO address (user_id, address_line1, city, postal_code, country)
            VALUES (@UserID, @AddressLine1, @City, @PostalCode, @Country);
        END

        COMMIT TRANSACTION;
        SELECT 'User registered successfully' AS Message, @UserID AS UserID;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SELECT ERROR_MESSAGE() AS Message, 0 AS UserID;
    END CATCH
END;
GO

CREATE PROCEDURE sp_add_to_cart
    @UserID INT,
    @ProductID INT,
    @Quantity INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (
        SELECT 1 
        FROM product 
        WHERE id = @ProductID 
        AND is_active = 1 
        AND stock_quantity > 0 
        AND stock_quantity >= @Quantity
    )
    AND EXISTS (
        SELECT 1 
        FROM [user] u 
        JOIN user_role ur ON u.id = ur.user_id 
        JOIN role r ON ur.role_id = r.id 
        WHERE u.id = @UserID AND r.name = 'buyer'
    )
    BEGIN
        IF EXISTS (SELECT 1 FROM cart WHERE user_id = @UserID AND product_id = @ProductID)
        BEGIN
            DECLARE @CurrentQuantity INT;
            DECLARE @StockQuantity INT;
            SELECT @CurrentQuantity = quantity FROM cart WHERE user_id = @UserID AND product_id = @ProductID;
            SELECT @StockQuantity = stock_quantity FROM product WHERE id = @ProductID;
            
            IF (@CurrentQuantity + @Quantity) <= @StockQuantity
            BEGIN
                UPDATE cart
                SET quantity = quantity + @Quantity
                WHERE user_id = @UserID AND product_id = @ProductID;
                SELECT 'Item quantity updated in cart' AS Message;
            END
            ELSE
            BEGIN
                SELECT 'Requested quantity exceeds available stock' AS Message;
            END
        END
        ELSE
        BEGIN
            INSERT INTO cart (user_id, product_id, quantity)
            VALUES (@UserID, @ProductID, @Quantity);
            SELECT 'Item added to cart' AS Message;
        END
    END
    ELSE
    BEGIN
        SELECT 'Invalid product, no stock available, insufficient stock, or user not a buyer' AS Message;
    END
END;
GO

CREATE PROCEDURE sp_delete_from_cart
    @UserID INT,
    @CartItemID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (SELECT 1 FROM cart WHERE id = @CartItemID AND user_id = @UserID)
    BEGIN
        DELETE FROM cart WHERE id = @CartItemID AND user_id = @UserID;
        SELECT 'Item removed from cart' AS Message;
    END
    ELSE
    BEGIN
        SELECT 'Cart item not found' AS Message;
    END
END;
GO

CREATE PROCEDURE sp_checkout
    @UserID INT,
    @ShippingAddressID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @TotalAmount DECIMAL(10,2);
    DECLARE @OrderID INT;

    SELECT @TotalAmount = SUM(p.price * c.quantity)
    FROM cart c
    JOIN product p ON c.product_id = p.id
    WHERE c.user_id = @UserID;

    IF @TotalAmount > 0 
       AND EXISTS (SELECT 1 FROM address WHERE id = @ShippingAddressID AND user_id = @UserID)
       AND NOT EXISTS (
           SELECT 1 
           FROM cart c
           JOIN product p ON c.product_id = p.id
           WHERE c.user_id = @UserID AND c.quantity > p.stock_quantity
       )
    BEGIN
        BEGIN TRY
            BEGIN TRANSACTION;

            INSERT INTO shop_order (user_id, total_amount, status, payment_method, shipping_address_id, expected_delivery_date)
            VALUES (@UserID, @TotalAmount, 'Pending', 'CashOnDelivery', @ShippingAddressID, DATEADD(DAY, 2, GETDATE()));

            SET @OrderID = SCOPE_IDENTITY();

            INSERT INTO order_items (order_id, product_id, quantity, unit_price)
            SELECT @OrderID, c.product_id, c.quantity, p.price
            FROM cart c
            JOIN product p ON c.product_id = p.id
            WHERE c.user_id = @UserID;

            UPDATE p
            SET p.stock_quantity = p.stock_quantity - c.quantity
            FROM product p
            JOIN cart c ON p.id = c.product_id
            WHERE c.user_id = @UserID;

            DELETE FROM cart WHERE user_id = @UserID;

            COMMIT TRANSACTION;

            SELECT 
                @OrderID AS OrderID,
                so.order_date,
                so.total_amount,
                so.status AS OrderStatus,
                p.name AS ProductName,
                oi.quantity,
                oi.unit_price,
                (oi.quantity * oi.unit_price) AS ItemTotal,
                a.address_line1 AS ShippingAddress,
                a.city,
                a.postal_code,
                a.country,
                so.expected_delivery_date
            FROM shop_order so
            JOIN order_items oi ON so.id = oi.order_id
            JOIN product p ON oi.product_id = p.id
            JOIN address a ON so.shipping_address_id = a.id
            WHERE so.id = @OrderID;
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            SELECT ERROR_MESSAGE() AS Message, 0 AS OrderID;
        END CATCH
    END
    ELSE
    BEGIN
        SELECT 'Cart is empty, invalid address, or insufficient stock' AS Message, 0 AS OrderID;
    END
END;
GO

CREATE PROCEDURE sp_add_product
    @VendorID INT,
    @CategoryName NVARCHAR(100),
    @SubCategoryName NVARCHAR(100),
    @Name NVARCHAR(100),
    @Description NVARCHAR(500),
    @Price DECIMAL(10,2),
    @StockQuantity INT,
    @ImageUrl NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @CategoryID INT;
    DECLARE @CategorySubID INT;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF EXISTS (SELECT 1 FROM category WHERE name = @CategoryName)
            SELECT @CategoryID = id FROM category WHERE name = @CategoryName;
        ELSE
        BEGIN
            INSERT INTO category (name) VALUES (@CategoryName);
            SET @CategoryID = SCOPE_IDENTITY();
        END

        IF EXISTS (SELECT 1 FROM category_sub WHERE name = @SubCategoryName AND category_id = @CategoryID)
            SELECT @CategorySubID = id FROM category_sub WHERE name = @SubCategoryName AND category_id = @CategoryID;
        ELSE
        BEGIN
            INSERT INTO category_sub (category_id, name) VALUES (@CategoryID, @SubCategoryName);
            SET @CategorySubID = SCOPE_IDENTITY();
        END

        IF EXISTS (SELECT 1 FROM vendor WHERE id = @VendorID)
        BEGIN
            INSERT INTO product (vendor_id, category_id, category_sub_id, name, description, price, stock_quantity, image_url)
            VALUES (@VendorID, @CategoryID, @CategorySubID, @Name, @Description, @Price, @StockQuantity, @ImageUrl);
            COMMIT TRANSACTION;
            SELECT 'Product added successfully' AS Message, SCOPE_IDENTITY() AS ProductID;
        END
        ELSE
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 'Invalid vendor' AS Message, 0 AS ProductID;
        END
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SELECT ERROR_MESSAGE() AS Message, 0 AS ProductID;
    END CATCH
END;
GO

CREATE PROCEDURE sp_update_product_quantity
    @ProductID INT,
    @VendorID INT,
    @StockQuantity INT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM product WHERE id = @ProductID AND vendor_id = @VendorID)
    BEGIN
        IF @StockQuantity < 0
        BEGIN
            SELECT 'Stock quantity cannot be negative' AS Message;
            RETURN;
        END
        UPDATE product
        SET stock_quantity = stock_quantity + @StockQuantity
        WHERE id = @ProductID;
        SELECT 'Quantity added successfully' AS Message;
    END
    ELSE
    BEGIN
        SELECT 'Product not found or not owned by vendor' AS Message;
    END
END;
GO

CREATE PROCEDURE sp_delete_product
    @ProductID INT,
    @VendorID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (SELECT 1 FROM product WHERE id = @ProductID AND vendor_id = @VendorID)
    BEGIN
        BEGIN TRY
            BEGIN TRANSACTION;

            DELETE FROM cart WHERE product_id = @ProductID;
            DELETE FROM order_items WHERE product_id = @ProductID;
            DELETE FROM product_review WHERE product_id = @ProductID;

            DELETE FROM product WHERE id = @ProductID;

            COMMIT TRANSACTION;
            SELECT 'Product deleted successfully' AS Message;
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            SELECT ERROR_MESSAGE() AS Message;
        END CATCH
    END
    ELSE
    BEGIN
        SELECT 'Product not found or not owned by vendor' AS Message;
    END
END;
GO

CREATE PROCEDURE sp_delete_address
    @AddressID INT,
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (SELECT 1 FROM address WHERE id = @AddressID AND user_id = @UserID)
    BEGIN
        BEGIN TRY
            BEGIN TRANSACTION;

            DELETE FROM shop_order WHERE shipping_address_id = @AddressID;

            DELETE FROM address WHERE id = @AddressID;

            COMMIT TRANSACTION;
            SELECT 'Address deleted successfully' AS Message;
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            SELECT ERROR_MESSAGE() AS Message;
        END CATCH
    END
    ELSE
    BEGIN
        SELECT 'Address not found or not owned by user' AS Message;
    END
END;
GO

CREATE PROCEDURE sp_auto_deliver_orders
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE shop_order
    SET status = 'Delivered'
    WHERE status = 'Pending'
    AND order_date <= DATEADD(HOUR, -24, GETDATE());
    SELECT 'Pending orders older than 24 hours marked as Delivered' AS Message;
END;
GO

