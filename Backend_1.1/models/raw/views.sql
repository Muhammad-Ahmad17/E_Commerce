/*
* E-Commerce View Definitions
* Version: 1.0
* Last Updated: 2025-05-01
* Database: ECommerce
* 
* This file contains all view definitions for the E-Commerce system,
* organized by user type (Buyer and Vendor) and functionality.
*/

USE ecom
GO
/*
* View: buyerCategoryProducts
* Purpose: Displays products based on buyer's category preferences
* Used By: Product recommendation engine, Homepage personalization
* Dependencies: User, Role, Buyer, Category, Product, ProductImage, Vendor
*/

CREATE OR ALTER VIEW BuyerCategoryProducts--view
AS
SELECT 
    b.buyerId,                -- Add this line
    u.fullName,
    b.preferences AS preferredCategory,
    c.categoryId,
    c.categoryName,
    p.productId,
    p.productName,
    p.price,
    p.description,
    pi.imageUrl,
    v.vendorName,
    CASE 
        WHEN p.stockQuantity = 0 THEN 'Out of Stock'
        WHEN p.stockQuantity < 5 THEN 'Low Stock'
        ELSE 'In Stock'
    END AS stockStatus,
    CASE 
        WHEN p.stockQuantity = 0 THEN 'danger'
        WHEN p.stockQuantity < 5 THEN 'warning'
        ELSE 'success'
    END AS availabilityIndicator
FROM [User] u
INNER JOIN UserRole ur ON u.userId = ur.userId
INNER JOIN Role r ON ur.roleId = r.roleId
INNER JOIN Buyer b ON u.userId = b.userId
INNER JOIN Category c ON b.preferences = c.categoryName
INNER JOIN Product p ON c.categoryId = p.categoryId
INNER JOIN ProductImage pi ON p.productId = pi.productId
INNER JOIN Vendor v ON p.vendorId = v.vendorId
WHERE r.roleName = 'buyer' AND u.isActive = 1;
GO

/*
* View: ProductDetails
* Purpose: Comprehensive product information display with ratings and review count
* Used By: Product detail pages, Search results
* Dependencies: Product, Category, Vendor, ProductImage, ProductReview
*/
CREATE OR ALTER VIEW ProductDetails
AS
SELECT 
    p.productId,
    p.productName,
    p.price,
    p.description,
    c.categoryName,
    pi.imageUrl,
    v.vendorName,
    -- Average rating and review count
    ISNULL(AVG(CAST(pr.rating AS FLOAT)), 0) AS averageRating,
    COUNT(pr.reviewId) AS reviewCount,
    -- Inventory status
    CASE 
        WHEN p.stockQuantity = 0 THEN 'Out of Stock'
        WHEN p.stockQuantity < 5 THEN 'Low Stock'
        WHEN p.stockQuantity < 20 THEN 'Moderate Stock'
        ELSE 'Well Stocked'
    END AS inventoryStatus,
    CASE 
        WHEN p.stockQuantity = 0 THEN 'danger'
        WHEN p.stockQuantity < 5 THEN 'warning'
        WHEN p.stockQuantity < 20 THEN 'info'
        ELSE 'success'
    END AS inventoryIndicator
FROM Product p
INNER JOIN Category c ON p.categoryId = c.categoryId
INNER JOIN Vendor v ON p.vendorId = v.vendorId
INNER JOIN ProductImage pi ON p.productId = pi.productId
LEFT JOIN ProductReview pr ON p.productId = pr.productId
WHERE p.isActive = 1
GROUP BY 
    p.productId, p.productName, p.price, p.description, c.categoryName, pi.imageUrl, v.vendorName, p.stockQuantity
GO
/*
* View: BuyerDashboardView
* Purpose: Buyer's personalized dashboard information
* Used By: Buyer dashboard, Account management
* Dependencies: User, Buyer, Address, Product, ProductImage
*/
CREATE OR ALTER VIEW BuyerDashboardView
AS
SELECT 
    u.userId,
    b.buyerId,                -- Add this line
    u.fullName,
    u.emailAddress,
    b.preferences,
    a.addressLine1,
    a.city,
    a.postalCode,
    a.country,
    p.productId,
    p.productName,
    p.price,
    pi.imageUrl,
    CASE
        WHEN p.stockQuantity = 0 THEN 'Out of Stock'
        WHEN p.stockQuantity > 0 THEN 'Available'
    END AS availabilityStatus
FROM [User] u
JOIN Buyer b ON u.userId = b.userId
LEFT JOIN Address a ON u.userId = a.userId AND a.isDefault = 1
LEFT JOIN Product p ON p.categoryId = (SELECT categoryId FROM Category WHERE categoryName = b.preferences)
LEFT JOIN ProductImage pi ON p.productId = pi.productId
WHERE u.isActive = 1 AND (p.isActive = 1 OR p.isActive IS NULL);
GO

/*
* View: buyerCartView
* Purpose: Shopping cart information with availability checks
* Used By: Cart page, Checkout process
* Dependencies: Cart, Product, ProductImage, Vendor, Category
*/

CREATE OR ALTER VIEW BuyerCartView
AS
SELECT 
    b.buyerId,               
    c.cartId,
    c.userId,
    p.productId,
    p.productName,
    p.description,
    p.price AS unitPrice,
    c.quantity,
    (p.price * c.quantity) AS totalPrice,
    pi.imageUrl,
    v.vendorName,
    cat.categoryName,
    CASE
        WHEN p.stockQuantity < c.quantity THEN 'Insufficient Stock'
        WHEN p.stockQuantity >= c.quantity THEN 'Available'
    END AS availabilityStatus,
    CASE
        WHEN p.stockQuantity < c.quantity THEN 'danger'
        ELSE 'success'
    END AS availabilityIndicator
FROM Cart c
INNER JOIN Buyer b ON c.userId = b.userId   -- Join Buyer to get buyerId
INNER JOIN Product p ON c.productId = p.productId
INNER JOIN ProductImage pi ON p.productId = pi.productId
INNER JOIN Vendor v ON p.vendorId = v.vendorId
INNER JOIN Category cat ON p.categoryId = cat.categoryId
WHERE p.isActive = 1;
GO
/*
* View: BuyerOrderHistoryView
* Purpose: Order history with delivery status tracking
* Used By: Order history page, Order tracking
* Dependencies: ShopOrder, OrderItem, Product, Address
*/
CREATE OR ALTER VIEW BuyerOrderHistoryView
AS
SELECT 
    o.orderId,
    o.userId,
    o.orderDate,
    o.totalAmount,
    o.status AS orderStatus,
    o.expectedDeliveryDate,
    p.productName,
    oi.quantity,
    oi.unitPrice,
    (oi.quantity * oi.unitPrice) AS itemTotal,
    CONCAT(a.addressLine1, ', ', a.city, ', ', a.postalCode, ', ', a.country) AS shippingAddress,
    a.postalCode,
    CASE
        WHEN o.status = 'Delivered' THEN 'Order Completed'
        WHEN o.status = 'Rejected' THEN 'Order Cancelled'
        WHEN GETDATE() > o.expectedDeliveryDate THEN 'Delivery Delayed'
        ELSE 'In Progress'
    END AS deliveryStatus,
    CASE
        WHEN o.status = 'Delivered' THEN 'success'
        WHEN o.status = 'Rejected' THEN 'danger'
        WHEN GETDATE() > o.expectedDeliveryDate THEN 'warning'
        ELSE 'info'
    END AS statusIndicator
FROM ShopOrder o
JOIN OrderItem oi ON o.orderId = oi.orderId
JOIN Product p ON oi.productId = p.productId
JOIN Address a ON o.shippingAddressId = a.addressId;
GO

/*
* View: VendorDashboardView
* Purpose: Vendor's main dashboard with inventory management
* Used By: Vendor dashboard, Inventory management
* Dependencies: User, Vendor, Product, Category, CategorySub, ProductImage, ProductReview
*/
CREATE OR ALTER VIEW VendorDashboardView
AS
SELECT 
    u.userId,
    v.vendorId,
    v.vendorName,
    p.productId,
    p.productName,
    p.description,
    p.price,
    p.stockQuantity,
    pi.imageUrl,
    c.categoryName,
    cs.subCategoryName,
    ISNULL(pr.rating, 0) AS productRating,
    pr.comment AS productComment,
    CASE 
        WHEN p.stockQuantity = 0 THEN 'Out of Stock'
        WHEN p.stockQuantity < 5 THEN 'Critical Stock'
        WHEN p.stockQuantity < 20 THEN 'Low Stock'
        WHEN p.stockQuantity < 50 THEN 'Moderate Stock'
        ELSE 'Well Stocked'
    END AS stockStatus,
    CASE 
        WHEN p.stockQuantity = 0 THEN 'danger'
        WHEN p.stockQuantity < 5 THEN 'warning'
        WHEN p.stockQuantity < 20 THEN 'info'
        ELSE 'success'
    END AS stockIndicator
FROM Vendor v
JOIN [User] u ON v.userId = u.userId
JOIN Product p ON v.vendorId = p.vendorId
JOIN Category c ON p.categoryId = c.categoryId
JOIN CategorySub cs ON p.subCategoryId = cs.subCategoryId
JOIN ProductImage pi ON p.productId = pi.productId
LEFT JOIN ProductReview pr ON p.productId = pr.productId
WHERE u.isActive = 1 AND p.isActive = 1;
GO

/*
* View: VendorPendingOrdersView
* Purpose: Shows pending orders for vendor's products
* Used By: Order management, Delivery tracking
* Dependencies: ShopOrder, OrderItem, Product, Vendor, User, Address
*/
CREATE OR ALTER VIEW VendorPendingOrdersView
AS
SELECT 
    v.vendorId,
    v.vendorName,
    o.orderId,
    u.fullName AS buyerName,
    p.productName,
    oi.quantity,
    oi.unitPrice,
    (oi.quantity * oi.unitPrice) AS totalPrice,
    o.orderDate,
    o.expectedDeliveryDate,
    CONCAT(a.addressLine1, ', ', a.city, ', ', a.postalCode, ', ', a.country) AS shippingAddress,
    CASE
        WHEN GETDATE() > o.expectedDeliveryDate THEN 'Delayed'
        ELSE 'On Time'
    END AS deliveryStatus,
    CASE
        WHEN GETDATE() > o.expectedDeliveryDate THEN 'warning'
        ELSE 'success'
    END AS deliveryIndicator
FROM ShopOrder o
JOIN OrderItem oi ON o.orderId = oi.orderId
JOIN Product p ON oi.productId = p.productId
JOIN Vendor v ON p.vendorId = v.vendorId
JOIN [User] u ON o.userId = u.userId
JOIN Address a ON o.shippingAddressId = a.addressId
WHERE o.status = 'Pending' AND p.isActive = 1;
GO

/*
* View: VendorAnalyticsView
* Purpose: Provides analytical data for vendor performance
* Used By: Vendor analytics, Sales reports
* Dependencies: User, Vendor, Product, OrderItem, ShopOrder, ProductReview
*/
CREATE OR ALTER VIEW VendorAnalyticsView
AS
SELECT 
    u.userId,
    v.vendorName AS storeName,
    p.productId,
    p.productName,
    COUNT(oi.orderItemId) AS totalOrders,
    SUM(oi.quantity) AS totalUnitsSold,
    SUM(oi.quantity * oi.unitPrice) AS totalRevenue,
    ISNULL(AVG(CAST(pr.rating AS FLOAT)), 0) AS averageRating,
    SUM(CASE WHEN o.status = 'Pending' THEN 1 ELSE 0 END) AS pendingOrders,
    SUM(CASE WHEN o.status = 'Delivered' THEN 1 ELSE 0 END) AS deliveredOrders,
    SUM(CASE WHEN o.status = 'Rejected' THEN 1 ELSE 0 END) AS rejectedOrders,
    CASE 
        WHEN AVG(CAST(pr.rating AS FLOAT)) >= 4 THEN 'Excellent'
        WHEN AVG(CAST(pr.rating AS FLOAT)) >= 3 THEN 'Good'
        WHEN AVG(CAST(pr.rating AS FLOAT)) > 0 THEN 'Poor'
        ELSE 'No Ratings'
    END AS ratingStatus
FROM [User] u
JOIN Vendor v ON u.userId = v.userId
JOIN Product p ON v.vendorId = p.vendorId
LEFT JOIN OrderItem oi ON p.productId = oi.productId
LEFT JOIN ShopOrder o ON oi.orderId = o.orderId
LEFT JOIN ProductReview pr ON p.productId = pr.productId
WHERE u.isActive = 1
GROUP BY u.userId, v.vendorName, p.productId, p.productName;
GO