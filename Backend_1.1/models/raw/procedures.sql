/*
* E-Commerce Stored Procedures
* Version: 1.0
* Last Updated: 2025-05-01
* Database: ecom
*
* Global Error Codes:
* 50001 - Invalid user/buyer/vendor ID
* 50002 - Insufficient stock/quantity
* 50003 - Invalid category/subcategory
* 50004 - Duplicate entry
* 50005 - Invalid address
* 50006 - Empty cart
* 50007 - Order processing failed
* 50008 - Payment failed
* 50009 - Authorization failed
* 50010 - Database constraint violation
*/

USE ecom
GO

/*
* Procedure: AddBuyerProcedure
* Purpose: Registers a new buyer with address and preferences
* Used By: User registration, Account creation
* Dependencies: User, Role, Buyer, Address
* Error Codes:
*   50001 - Invalid user data
*   50004 - Email already exists
*   50005 - Invalid address data
*   50010 - Database constraint violation
*/
CREATE OR ALTER PROCEDURE AddBuyerProcedure
    @fullName NVARCHAR(100),
    @email NVARCHAR(100),
    @password NVARCHAR(256),
    @preferences NVARCHAR(20),
    @addressLine1 NVARCHAR(255),
    @city NVARCHAR(100),
    @postalCode NVARCHAR(20),
    @country NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
            -- Create user account
            INSERT INTO [User] (fullName, emailAddress, passwordHash, isActive)
            VALUES (@fullName, @email, @password, 1);
            
            DECLARE @userId INT = SCOPE_IDENTITY();
            DECLARE @roleId INT;
            
            -- Assign buyer role
            SELECT @roleId = roleId FROM Role WHERE roleName = 'buyer';
            
            INSERT INTO UserRole (userId, roleId)
            VALUES (@userId, @roleId);
            
            -- Create buyer profile
            INSERT INTO Buyer (userId, preferences)
            VALUES (@userId, @preferences);
            
            DECLARE @buyerId INT = SCOPE_IDENTITY();
            
            -- Add default address
            INSERT INTO Address (userId, addressLine1, city, postalCode, country, isDefault)
            VALUES (@userId, @addressLine1, @city, @postalCode, @country, 1);

        COMMIT TRANSACTION;
        SELECT @buyerId AS buyerId, 'Buyer registered successfully' AS message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH;
END;
GO

/*
* Procedure: AddToCartProcedure
* Purpose: Adds or updates product quantity in cart
* Used By: Shopping cart operations
* Dependencies: Buyer, Product, Cart
* Error Codes:
*   50001 - Invalid buyer ID
*   50002 - Insufficient stock
*   50010 - Database constraint violation
*/
CREATE OR ALTER PROCEDURE AddToCartProcedure
    @buyerId INT,
    @productId INT,
    @quantity INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Validate buyer
        DECLARE @userId INT;
        SELECT @userId = userId FROM Buyer WHERE buyerId = @buyerId;
        
        IF @userId IS NULL 
            THROW 50001, 'Invalid buyer ID', 1;
        
        -- Check stock availability
        IF NOT EXISTS (
            SELECT 1 FROM Product 
            WHERE productId = @productId 
            AND isActive = 1 
            AND stockQuantity >= @quantity
        )
            THROW 50002, 'Insufficient stock', 1;
            
        -- Add or update cart
        MERGE Cart AS target
        USING (SELECT @userId, @productId, @quantity) AS source (userId, productId, quantity)
        ON (target.userId = source.userId AND target.productId = source.productId)
        WHEN MATCHED THEN
            UPDATE SET quantity = target.quantity + source.quantity
        WHEN NOT MATCHED THEN
            INSERT (userId, productId, quantity)
            VALUES (source.userId, source.productId, source.quantity);

        SELECT 'Product added to cart successfully' AS message;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH;
END;
GO

/*
* Procedure: DeleteFromCartProcedure
* Purpose: Removes item from cart
* Dependencies: Buyer, product
*/
CREATE OR ALTER PROCEDURE DeleteFromCartProcedure
    @buyerId INT,
    @productId INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @userId INT;
        SELECT @userId = userId FROM Buyer WHERE buyerId = @buyerId;
        
        IF @userId IS NULL
            THROW 50001, 'Invalid buyer ID', 1;
        
        IF NOT EXISTS (
            SELECT 1 FROM Cart WHERE userId = @userId AND productId = @productId
        )
            THROW 50003, 'Item not found in cart', 1;

        DELETE FROM Cart
        WHERE userId = @userId AND productId = @productId;
        
        SELECT 'Item removed from cart' AS message;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH;
END;
GO
/*
* Procedure: CheckoutProcedure
* Purpose: Processes cart checkout and creates order
* Used By: Order processing
* Dependencies: Buyer, Cart, ShopOrder, OrderItem, Product
* Error Codes:
*   50001 - Invalid buyer ID
*   50002 - Insufficient stock
*   50005 - Invalid shipping address
*   50006 - Empty cart
*   50007 - Order processing failed
*   50008 - Payment processing failed
*   50010 - Database constraint violation
*/
CREATE OR ALTER PROCEDURE CheckoutProcedure
    @buyerId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @paymentMethod NVARCHAR(50) = 'CashOnDelivery'  -- Default to 'COD'

    DECLARE @userId INT, @addressId INT, @orderId INT, @totalAmount DECIMAL(18,2);

    -- Get userId from buyerId
    SELECT @userId = userId FROM Buyer WHERE buyerId = @buyerId;

    IF @userId IS NULL
    BEGIN
        THROW 50001, 'Invalid buyer ID', 1;
        RETURN;
    END

    -- Get default address for the buyer
    SELECT TOP 1 @addressId = addressId FROM Address WHERE userId = @userId AND isDefault = 1;

    IF @addressId IS NULL
    BEGIN
        THROW 50002, 'No default address found for buyer', 1;
        RETURN;
    END

    BEGIN TRANSACTION;

    -- Set isolation level to SERIALIZABLE for strict locking
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

    -- Lock all cart rows for this user
    SELECT * FROM Cart WITH (UPDLOCK, ROWLOCK) WHERE userId = @userId;

    -- Check stock for all cart items
    IF EXISTS (
        SELECT 1
        FROM Cart c
        JOIN Product p WITH (UPDLOCK, ROWLOCK) ON c.productId = p.productId
        WHERE c.userId = @userId AND p.stockQuantity < c.quantity
    )
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50003, 'Insufficient stock for one or more products', 1;
        RETURN;
    END

    -- Calculate totalAmount from cart
    SELECT @totalAmount = SUM(c.quantity * p.price)
    FROM Cart c
    JOIN Product p ON c.productId = p.productId
    WHERE c.userId = @userId;

    IF @totalAmount IS NULL
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50004, 'Cart is empty', 1;
        RETURN;
    END

    -- Insert order with totalAmount
    INSERT INTO ShopOrder (userId, shippingAddressId, orderDate, status, totalAmount, paymentMethod)
    VALUES (@userId, @addressId, GETDATE(), 'Pending', @totalAmount, @paymentMethod);

    SET @orderId = SCOPE_IDENTITY();

    -- Insert order items and update product stock
    INSERT INTO OrderItem (orderId, productId, quantity, unitPrice)
    SELECT 
        @orderId, c.productId, c.quantity, p.price
    FROM Cart c
    JOIN Product p ON c.productId = p.productId
    WHERE c.userId = @userId;

    -- Update product stock
    UPDATE p
    SET p.stockQuantity = p.stockQuantity - c.quantity
    FROM Product p
    JOIN Cart c ON p.productId = c.productId
    WHERE c.userId = @userId;

    -- Clear cart
    DELETE FROM Cart WHERE userId = @userId;

    COMMIT TRANSACTION;

    SELECT 'Checkout successful' AS message, @orderId AS orderId, @totalAmount AS totalAmount;
END;
GO

/*
* Procedure: AddReviewProcedure
* Purpose: Adds a product review after purchase verification
* Used By: Product review system
* Dependencies: Buyer, Product, ProductReview, ShopOrder, OrderItem
* Error Codes:
*   50001 - Invalid buyer/product ID
*   50002 - Invalid rating value (must be 1-5)
*   50003 - Cannot review unpurchased product
*   50004 - Review already exists
*/

CREATE OR ALTER PROCEDURE AddReviewProcedure
    @buyerId INT,
    @productId INT,
    @rating INT,
    @comment NVARCHAR(500),
    @reviewDate DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Validate inputs
        IF @rating NOT BETWEEN 1 AND 5
            THROW 50002, 'Rating must be between 1 and 5', 1;
        
        -- Verify buyer and product exist
        IF NOT EXISTS (SELECT 1 FROM Buyer WHERE buyerId = @buyerId)
            OR NOT EXISTS (SELECT 1 FROM Product WHERE productId = @productId)
            THROW 50001, 'Invalid buyer or product ID', 1;

        -- Check if product was purchased
        IF NOT EXISTS (
            SELECT 1
            FROM OrderItem oi
            JOIN ShopOrder o ON oi.orderId = o.orderId
            JOIN Buyer b ON b.userId = o.userId
            WHERE b.buyerId = @buyerId
            AND oi.productId = @productId
            AND o.status = 'Delivered'
        )
            THROW 50003, 'Cannot review product not purchased', 1;

        -- Check for existing review
        IF EXISTS (
            SELECT 1 FROM ProductReview 
            WHERE buyerId = @buyerId AND productId = @productId
        )
            THROW 50004, 'Review already exists for this product', 1;

        -- Set review date if not provided
        SET @reviewDate = ISNULL(@reviewDate, GETDATE());

        -- Insert review
        INSERT INTO ProductReview (
            buyerId, 
            productId, 
            rating, 
            comment, 
            reviewDate
        )
        VALUES (
            @buyerId, 
            @productId, 
            @rating, 
            @comment, 
            @reviewDate
        );

        SELECT 
            'Review added successfully' AS message,
            SCOPE_IDENTITY() AS reviewId;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH;
END;
GO

SELECT * from productReview

/*
* Procedure: AddVendorProcedure
* Purpose: Registers a new vendor with address
* Used By: Vendor registration
* Dependencies: User, Role, Vendor, Address
* Error Codes:
*   50001 - Invalid vendor data
*   50004 - Email/vendor name already exists
*   50005 - Invalid address data
*   50010 - Database constraint violation
*/
CREATE OR ALTER PROCEDURE AddVendorProcedure
    @fullName NVARCHAR(100),
    @email NVARCHAR(100),
    @password NVARCHAR(256),
    @vendorName NVARCHAR(100),
    @addressLine1 NVARCHAR(255),
    @city NVARCHAR(100),
    @postalCode NVARCHAR(20),
    @country NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
            -- Create user account
            INSERT INTO [User] (fullName, emailAddress, passwordHash, isActive)
            VALUES (@fullName, @email, @password, 1);
            
            DECLARE @userId INT = SCOPE_IDENTITY();
            DECLARE @roleId INT;
            
            -- Assign vendor role
            SELECT @roleId = roleId FROM Role WHERE roleName = 'vendor';
            
            INSERT INTO UserRole (userId, roleId)
            VALUES (@userId, @roleId);
            
            -- Create vendor profile
            INSERT INTO Vendor (userId, vendorName)
            VALUES (@userId, @vendorName);
            
            DECLARE @vendorId INT = SCOPE_IDENTITY();
            
            -- Add business address
            INSERT INTO Address (userId, addressLine1, city, postalCode, country, isDefault)
            VALUES (@userId, @addressLine1, @city, @postalCode, @country, 1);

        COMMIT TRANSACTION;
        SELECT @vendorId AS vendorId, 'Vendor registered successfully' AS message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH;
END;
GO

/*
* Procedure: AddProductProcedure
* Purpose: Adds new product with category and image
* Used By: Product management
* Dependencies: Vendor, Category, CategorySub, Product, ProductImage
* Error Codes:
*   50001 - Invalid vendor ID
*   50003 - Invalid category/subcategory
*   50004 - Duplicate product name
*   50010 - Database constraint violation
*/
CREATE OR ALTER PROCEDURE AddProductProcedure
    @vendorId INT,
    @categoryName NVARCHAR(20),
    @subCategoryName NVARCHAR(20),
    @productName NVARCHAR(100),
    @description NVARCHAR(500),
    @price DECIMAL(10,2),
    @stockQuantity INT,
    @imageUrl NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
            -- Validate vendor
            IF NOT EXISTS (SELECT 1 FROM Vendor WHERE vendorId = @vendorId)
                THROW 50001, 'Invalid vendor ID', 1;
                
            DECLARE @categoryId INT, @subCategoryId INT;
            
            -- Get or create category
            SELECT @categoryId = categoryId 
            FROM Category 
            WHERE categoryName = @categoryName;
            
            IF @categoryId IS NULL
            BEGIN
                INSERT INTO Category (categoryName) VALUES (@categoryName);
                SET @categoryId = SCOPE_IDENTITY();
            END;
            
            -- Get or create subcategory
            SELECT @subCategoryId = subCategoryId 
            FROM CategorySub 
            WHERE categoryId = @categoryId AND subCategoryName = @subCategoryName;
            
            IF @subCategoryId IS NULL
            BEGIN
                INSERT INTO CategorySub (categoryId, subCategoryName) 
                VALUES (@categoryId, @subCategoryName);
                SET @subCategoryId = SCOPE_IDENTITY();
            END;
            
            -- Create product
            INSERT INTO Product (
                vendorId, categoryId, subCategoryId, productName, 
                description, price, stockQuantity, isActive
            )
            VALUES (
                @vendorId, @categoryId, @subCategoryId, @productName,
                @description, @price, @stockQuantity, 1
            );
            
            DECLARE @productId INT = SCOPE_IDENTITY();
            
            -- Add product image
            INSERT INTO ProductImage (productId, imageUrl)
            VALUES (@productId, @imageUrl);

        COMMIT TRANSACTION;
        SELECT @productId AS productId, 'Product added successfully' AS message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH;
END;
GO

/*
* Procedure: UpdateProductQuantityProcedure
* Purpose: Updates product stock quantity
* Used By: Inventory management
* Dependencies: Product, Vendor
* Error Codes:
*   50001 - Invalid product or vendor ID
*   50002 - Invalid quantity (negative stock)
*   50010 - Database constraint violation
*/
CREATE OR ALTER PROCEDURE UpdateProductQuantityProcedure
    @vendorId INT,
    @productId INT,
    @quantity INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Product WHERE productId = @productId AND vendorId = @vendorId)
            THROW 50001, 'Invalid product or vendor ID', 1;

        UPDATE Product 
        SET stockQuantity = stockQuantity + @quantity
        WHERE productId = @productId 
        AND vendorId = @vendorId;

        SELECT 'Stock updated successfully' AS message;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH;
END;
GO

/*
* Procedure: DeleteProductProcedure
* Purpose: Deactivates product and removes images
* Used By: Product management
* Dependencies: Product, ProductImage, Vendor
* Error Codes:
*   50001 - Invalid product or vendor ID
*   50009 - Authorization failed
*   50010 - Database constraint violation
*/
CREATE OR ALTER PROCEDURE DeleteProductProcedure
    @vendorId INT,
    @productId INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
            IF NOT EXISTS (SELECT 1 FROM Product WHERE productId = @productId AND vendorId = @vendorId)
                THROW 50001, 'Invalid product or vendor ID', 1;

            DELETE FROM ProductImage WHERE productId = @productId;
            
            UPDATE Product 
            SET isActive = 0
            WHERE productId = @productId 
            AND vendorId = @vendorId;

        COMMIT TRANSACTION;
        SELECT 'Product deleted successfully' AS message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH;
END;
GO

/*
* Procedure: MarkOrderAsDelivered
* Purpose: Manually mark an order as delivered
* Usage: EXEC MarkOrderAsDelivered @orderId = 123
*/

CREATE OR ALTER PROCEDURE MarkOrderAsDelivered
  @orderId INT
AS
BEGIN
  UPDATE ShopOrder
  SET status = 'Delivered',
      deliveredDate = GETDATE()
  WHERE orderId = @orderId AND status <> 'Delivered';

  -- Return the updated row
  SELECT * FROM ShopOrder WHERE orderId = @orderId;
END
GO