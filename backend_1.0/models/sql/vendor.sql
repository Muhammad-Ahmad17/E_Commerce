-- ===========================================
-- All Views and Procedures in this file
-- ===========================================
-- Views:
--   1. VendorDashboardView
--   2. VendorPendingOrdersView
--   3. VendorAnalyticsView

-- Procedures:
--   1. sp_add_product
--   2. sp_update_product_quantity
--   3. sp_delete_product
--   4. sp_delete_address
--   5. sp_auto_deliver_orders
--   6. sp_get_vendor_products
-- ===========================================


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

CREATE PROCEDURE sp_get_vendor_products
    @VendorID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT p.id AS ProductID, p.name AS ProductName, p.description, p.price, p.stock_quantity, c.name AS CategoryName, cs.name AS SubCategoryName
    FROM product p
    JOIN category c ON p.category_id = c.id
    JOIN category_sub cs ON p.category_sub_id = cs.id
    WHERE p.vendor_id = @VendorID;
END;
GO  
-- test sp_get_vendor_products
EXEC sp_get_vendor_products @VendorID = 1;

SELECT * FROM vendor WHERE user_id = 12
SELECT * FROM [user] WHERE id = 12 AND is_active = 1;
SELECT * FROM product WHERE vendor_id = 3 AND is_active = 1;

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
SELECT *
FROM VendorDashboardView
WHERE vendorid   = 1


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

CREATE or ALTER VIEW VendorAnalyticsView
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


SELECT v.id AS VendorID, v.vendor_name, va.*
FROM VendorAnalyticsView va
JOIN vendor v ON v.user_id = va.UserID
WHERE v.id = 1