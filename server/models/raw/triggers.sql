/*
* E-Commerce Triggers
* Version: 1.0
* Last Updated: 2025-05-01
* Database: ecom
*/

USE ecom
GO

-- 1. Default Address Trigger
CREATE OR ALTER TRIGGER SetDefaultAddressTrigger
ON Address
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Address
    SET isDefault = 1
    WHERE addressId IN (
        SELECT i.addressId
        FROM inserted i
        WHERE NOT EXISTS (
            SELECT 1
            FROM Address a
            WHERE a.userId = i.userId AND a.addressId != i.addressId
        )
    );
END;
GO

-- 2. Review Validation Trigger
CREATE OR ALTER TRIGGER ValidateReviewTrigger
ON ProductReview
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE NOT EXISTS (
            SELECT 1
            FROM OrderItem oi
            JOIN ShopOrder o ON oi.orderId = o.orderId
            JOIN Buyer b ON b.userId = o.userId
            WHERE b.buyerId = i.buyerId
            AND oi.productId = i.productId
        )
    )
    BEGIN
        THROW 50001, 'Cannot review product not purchased', 1;
        ROLLBACK;
    END
END;
GO

-- 3. Cart Cleanup Trigger
CREATE OR ALTER TRIGGER CleanupCartOnDeactivationTrigger
ON Product
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(isActive)
    BEGIN
        DELETE FROM Cart
        WHERE productId IN (
            SELECT i.productId
            FROM inserted i
            JOIN deleted d ON i.productId = d.productId
            WHERE i.isActive = 0 AND d.isActive = 1
        );
    END
END;
GO

-- 4. User Role Assignment Trigger
--DROP TRIGGER IF EXISTS AssignUserRoleTrigger;
CREATE OR ALTER TRIGGER AssignUserRoleTrigger
ON [User]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @roleName NVARCHAR(50);
    DECLARE @roleId INT;
    DECLARE @userId INT;

    -- Get roleName from CONTEXT_INFO
    SELECT @roleName = CAST(CAST(CONTEXT_INFO() AS VARCHAR(128)) AS NVARCHAR(50));

    -- Validate role
    SELECT @roleId = roleId FROM Role WHERE roleName = @roleName;
    IF @roleId IS NULL
    BEGIN
        THROW 50002, 'Invalid role specified for user', 1;
        ROLLBACK;
        RETURN;
    END

    -- Get inserted user ID
    SELECT @userId = userId FROM inserted;

    -- Assign role
    INSERT INTO UserRole (userId, roleId)
    VALUES (@userId, @roleId);
END;
GO

/*
* Trigger: AutoDeliveryTrigger
* Purpose: Automatically marks orders as delivered after creation
* Dependencies: ShopOrder
*/
-- deleted and inserted it as a procedure
--DROP TRIGGER IF EXISTS AutoDeliveryTrigger;
CREATE OR ALTER TRIGGER AutoDeliveryTrigger
ON ShopOrder
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Wait for 3 seconds (simulating 3 days delivery time)
    WAITFOR DELAY '00:00:01';
    
    -- Update to Delivered status
    UPDATE ShopOrder
    SET 
        status = 'Delivered'
    WHERE orderId IN (SELECT orderId FROM inserted);
END;
GO