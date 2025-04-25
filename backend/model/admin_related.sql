
-- SECTION 4: VERIFICATION
-- Purpose: Confirm all triggers, views, and procedures have been dropped.

PRINT '=== Verifying Drop ===';

SELECT 'Triggers' AS ObjectType, COUNT(*) AS ObjectCount 
FROM sys.triggers
WHERE parent_class_desc = 'OBJECT_OR_COLUMN'
UNION ALL
SELECT 'Views', COUNT(*) 
FROM sys.views
UNION ALL
SELECT 'Procedures', COUNT(*) 
FROM sys.procedures;
-- Expected: ObjectCount = 0 for Triggers, Views, Procedures



--'=== Final Verification ===';
SELECT 'Users' AS TableName, COUNT(*) AS [RowCount] FROM [user]
UNION ALL
SELECT 'Roles', COUNT(*) FROM role
UNION ALL
SELECT 'Categories', COUNT(*) FROM category
UNION ALL
SELECT 'Subcategories', COUNT(*) FROM category_sub
UNION ALL
SELECT 'Products', COUNT(*) FROM product
UNION ALL
SELECT 'Cart', COUNT(*) FROM cart
UNION ALL
SELECT 'Orders', COUNT(*) FROM shop_order
UNION ALL
SELECT 'Delivered Orders', COUNT(*) FROM shop_order WHERE status = 'Delivered';


-- === SELECT ALL FROM ALL TABLES ===

use E_Commerce;
SELECT * FROM role;
SELECT * FROM category;
SELECT * FROM category_sub;
SELECT * FROM [user];
SELECT * FROM user_role;
SELECT * FROM vendor;
SELECT * FROM buyer;
SELECT * FROM address;
SELECT * FROM product;
SELECT * FROM cart;
SELECT * FROM shop_order;
SELECT * FROM order_items;
SELECT * FROM product_review;

-- === FULL DATABASE RESET ===

-- Disable all constraints (to prevent FK errors during deletion)
EXEC sp_msforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all";

-- Delete data from all tables (child ? parent order)
DELETE FROM product_review;
DELETE FROM order_items;
DELETE FROM shop_order;
DELETE FROM cart;
DELETE FROM product;
DELETE FROM address;
DELETE FROM buyer;
DELETE FROM vendor;
DELETE FROM user_role;
DELETE FROM [user];
DELETE FROM category_sub;
DELETE FROM category;
DELETE FROM role;

-- Reseed all tables (reset identity to 0)
DBCC CHECKIDENT ('product_review', RESEED, 0);
DBCC CHECKIDENT ('order_items', RESEED, 0);
DBCC CHECKIDENT ('shop_order', RESEED, 0);
DBCC CHECKIDENT ('cart', RESEED, 0);
DBCC CHECKIDENT ('product', RESEED, 0);
DBCC CHECKIDENT ('address', RESEED, 0);
DBCC CHECKIDENT ('buyer', RESEED, 0);
DBCC CHECKIDENT ('vendor', RESEED, 0);
-- DBCC CHECKIDENT ('user_role', RESEED, 0);
DBCC CHECKIDENT ('[user]', RESEED, 0);
DBCC CHECKIDENT ('category_sub', RESEED, 0);
DBCC CHECKIDENT ('category', RESEED, 0);
DBCC CHECKIDENT ('role', RESEED, 0);

-- Re-enable all constraints
EXEC sp_msforeachtable "ALTER TABLE ? CHECK CONSTRAINT all";
