-- ===========================================
-- All Views and Procedures in this file
-- ===========================================
-- Views:
--   1. buyerCartView

-- Procedures:
--   1. sp_add_to_cart
--   2. sp_delete_from_cart
--   3. sp_checkout
-- ===========================================



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
---
select * from buyerCartView 
join product p on p.id = buyerCartView.product_id
where user_id = 1;


SELECT cart_item_id, user_id, product_id, product_name, product_description, 
               unit_price, quantity, total_price, image_url, vendor_name, category_name
        FROM buyerCartView
        WHERE user_id = 1
---

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