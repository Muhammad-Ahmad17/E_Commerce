-- Drop existing tables in correct order
DROP TABLE IF EXISTS ProductReview;
DROP TABLE IF EXISTS OrderItem;
DROP TABLE IF EXISTS ShopOrder;
DROP TABLE IF EXISTS Cart;
DROP TABLE IF EXISTS ProductImage;
DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS CategorySub;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS Address;
DROP TABLE IF EXISTS Vendor;
DROP TABLE IF EXISTS Buyer;
DROP TABLE IF EXISTS UserRole;
DROP TABLE IF EXISTS Role;
DROP TABLE IF EXISTS [User];
GO
SELECT * FROM ProductReview
SELECT * FROM OrderItem
SELECT * FROM ShopOrder
SELECT * FROM Cart
SELECT * FROM ProductImage
SELECT * FROM Product
SELECT * FROM CategorySub
SELECT * FROM Category
SELECT * FROM Address
SELECT * FROM Vendor
SELECT * FROM Buyer
SELECT * FROM UserRole
SELECT * FROM Role
SELECT * FROM [User]

--      ----

USE ecom
GO

-- First display all database objects
PRINT '=== Current Database Objects ==='
GO

-- Display Triggers
PRINT 'Current Triggers:'
SELECT 
    name AS 'TriggerName',
    OBJECT_NAME(parent_id) AS 'TableName'
FROM sys.triggers 
WHERE parent_class = 1;
GO

-- Display Procedures
PRINT 'Current Stored Procedures:'
SELECT 
    name AS 'ProcedureName'
FROM sys.procedures
WHERE is_ms_shipped = 0;
GO

-- Display Views
PRINT 'Current Views:'
SELECT 
    name AS 'ViewName'
FROM sys.views
WHERE is_ms_shipped = 0;
GO

-- Show all Triggers
SELECT 
    t.name AS TriggerName,
    OBJECT_NAME(t.parent_id) AS TableName,
    CASE 
        WHEN is_instead_of_trigger = 1 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END AS TriggerType,
    OBJECT_DEFINITION(t.object_id) AS TriggerDefinition
FROM sys.triggers t
WHERE t.parent_class = 1  -- Object or column triggers only
ORDER BY TableName, TriggerName;
GO

-- Show all Stored Procedures
SELECT 
    SCHEMA_NAME(schema_id) AS SchemaName,
    name AS ProcedureName,
    OBJECT_DEFINITION(object_id) AS ProcedureDefinition
FROM sys.procedures
ORDER BY name;
GO

-- Show all Views
SELECT 
    SCHEMA_NAME(schema_id) AS SchemaName,
    name AS ViewName,
    OBJECT_DEFINITION(object_id) AS ViewDefinition
FROM sys.views
WHERE is_ms_shipped = 0  -- Exclude system views
ORDER BY name;
GO

-- Show object counts
SELECT 
    'Triggers' AS ObjectType,
    COUNT(*) AS Count
FROM sys.triggers
WHERE parent_class = 1
UNION ALL
SELECT 
    'Procedures',
    COUNT(*)
FROM sys.procedures
UNION ALL
SELECT 
    'Views',
    COUNT(*)
FROM sys.views
WHERE is_ms_shipped = 0;
GO

USE ecom
GO

-- Drop all triggers
DECLARE @dropTriggers NVARCHAR(MAX) = ''
SELECT @dropTriggers += 'DROP TRIGGER IF EXISTS ' + QUOTENAME(name) + ';'
FROM sys.triggers
WHERE parent_class = 1  -- Object or column triggers only
EXEC sp_executesql @dropTriggers

-- Drop all stored procedures
DECLARE @dropProcedures NVARCHAR(MAX) = ''
SELECT @dropProcedures += 'DROP PROCEDURE IF EXISTS ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + ';'
FROM sys.procedures
EXEC sp_executesql @dropProcedures

-- Drop all views
DECLARE @dropViews NVARCHAR(MAX) = ''
SELECT @dropViews += 'DROP VIEW IF EXISTS ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + ';'
FROM sys.views
EXEC sp_executesql @dropViews



-- Print confirmation
PRINT 'All triggers, procedures, and views have been dropped.'
GO

-- Now drop all objects in correct order
PRINT '=== Dropping Database Objects ==='
GO

-- Drop Views first (they depend on tables)
PRINT 'Dropping Views...'
DECLARE @dropView NVARCHAR(MAX)
DECLARE viewCursor CURSOR FOR 
    SELECT 'DROP VIEW IF EXISTS [' + name + ']'
    FROM sys.views 
    WHERE is_ms_shipped = 0

OPEN viewCursor
FETCH NEXT FROM viewCursor INTO @dropView
WHILE @@FETCH_STATUS = 0
BEGIN
    EXEC sp_executesql @dropView
    FETCH NEXT FROM viewCursor INTO @dropView
END
CLOSE viewCursor
DEALLOCATE viewCursor
GO

-- Drop Triggers
PRINT 'Dropping Triggers...'
DECLARE @dropTrigger NVARCHAR(MAX)
DECLARE triggerCursor CURSOR FOR 
    SELECT 'DROP TRIGGER IF EXISTS [' + name + ']'
    FROM sys.triggers 
    WHERE parent_class = 1

OPEN triggerCursor
FETCH NEXT FROM triggerCursor INTO @dropTrigger
WHILE @@FETCH_STATUS = 0
BEGIN
    EXEC sp_executesql @dropTrigger
    FETCH NEXT FROM triggerCursor INTO @dropTrigger
END
CLOSE triggerCursor
DEALLOCATE triggerCursor
GO

-- Drop Procedures
PRINT 'Dropping Procedures...'
DECLARE @dropProc NVARCHAR(MAX)
DECLARE procCursor CURSOR FOR 
    SELECT 'DROP PROCEDURE IF EXISTS [' + name + ']'
    FROM sys.procedures 
    WHERE is_ms_shipped = 0

OPEN procCursor
FETCH NEXT FROM procCursor INTO @dropProc
WHILE @@FETCH_STATUS = 0
BEGIN
    EXEC sp_executesql @dropProc
    FETCH NEXT FROM procCursor INTO @dropProc
END
CLOSE procCursor
DEALLOCATE procCursor
GO

-- Verify all objects are dropped
PRINT '=== Verification ==='
GO

-- Check remaining objects
IF EXISTS (SELECT 1 FROM sys.views WHERE is_ms_shipped = 0)
    PRINT 'Warning: Some views remain!'
ELSE
    PRINT 'All views dropped successfully.'

IF EXISTS (SELECT 1 FROM sys.triggers WHERE parent_class = 1)
    PRINT 'Warning: Some triggers remain!'
ELSE
    PRINT 'All triggers dropped successfully.'

IF EXISTS (SELECT 1 FROM sys.procedures WHERE is_ms_shipped = 0)
    PRINT 'Warning: Some procedures remain!'
ELSE
    PRINT 'All procedures dropped successfully.'
GO

-- drop DeleteFromCartByProduct
DROP PROCEDURE IF EXISTS DeleteFromCartByProduct



-- backup the database
BACKUP DATABASE ecom
TO DISK = 'E:\ecom.bak'

-- restore the database
RESTORE DATABASE ecom
FROM DISK = 'E:\ecom.bak'










SELECT comment FROM ProductReview WHERE productId = 5