CREATE DATABASE ecom;
GO
USE ecom;
GO

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

CREATE TABLE [User] (
    userId INT PRIMARY KEY IDENTITY,
    fullName NVARCHAR(100) NOT NULL,
    emailAddress NVARCHAR(100) UNIQUE NOT NULL,
    passwordHash NVARCHAR(256) NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    isActive BIT DEFAULT 1
);

CREATE TABLE [Role] (
    roleId INT PRIMARY KEY IDENTITY,
    roleName NVARCHAR(50) UNIQUE NOT NULL CHECK (roleName IN ('buyer', 'vendor', 'manager'))
);

CREATE TABLE UserRole (
    userId INT NOT NULL,
    roleId INT NOT NULL,
    assignedAt DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (userId, roleId),
    FOREIGN KEY (userId) REFERENCES [User](userId) ON DELETE CASCADE,
    FOREIGN KEY (roleId) REFERENCES Role(roleId) ON DELETE CASCADE
);

CREATE TABLE Buyer (
    buyerId INT PRIMARY KEY IDENTITY,
    userId INT UNIQUE NOT NULL,
    preferences NVARCHAR(20) CHECK (preferences IN ('male', 'female', 'children')),
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES [User](userId) ON DELETE CASCADE
);

CREATE TABLE Vendor (
    vendorId INT PRIMARY KEY IDENTITY,
    userId INT UNIQUE NOT NULL,
    vendorName NVARCHAR(100) NOT NULL UNIQUE,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES [User](userId) ON DELETE CASCADE
);

CREATE TABLE [Address] (
    addressId INT PRIMARY KEY IDENTITY,
    userId INT NOT NULL,
    addressLine1 NVARCHAR(255) NOT NULL,
    city NVARCHAR(100) NOT NULL,
    postalCode NVARCHAR(20) NOT NULL,
    country NVARCHAR(100) NOT NULL,
    isDefault BIT DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES [User](userId) ON DELETE CASCADE
);

CREATE TABLE Category (
    categoryId INT PRIMARY KEY IDENTITY,
    categoryName NVARCHAR(20) NOT NULL CHECK (categoryName IN ('male', 'female', 'children')),
    isActive BIT DEFAULT 1,
    CONSTRAINT UQ_Category_Name UNIQUE (categoryName)
);

CREATE TABLE CategorySub (
    subCategoryId INT PRIMARY KEY IDENTITY,
    categoryId INT NOT NULL,
    subCategoryName NVARCHAR(20) NOT NULL CHECK (subCategoryName IN ('clothes', 'shoes', 'accessories')),
    isActive BIT DEFAULT 1,
    CONSTRAINT UQ_CategorySub_Name UNIQUE (categoryId, subCategoryName),
    FOREIGN KEY (categoryId) REFERENCES Category(categoryId) ON DELETE NO ACTION
);

CREATE TABLE Product (
    productId INT PRIMARY KEY IDENTITY,
    vendorId INT NOT NULL,
    categoryId INT NOT NULL,
    subCategoryId INT NOT NULL,
    productName NVARCHAR(100) NOT NULL,
    description NVARCHAR(500),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stockQuantity INT NOT NULL CHECK (stockQuantity >= 0),
    isActive BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (vendorId) REFERENCES Vendor(vendorId) ON DELETE CASCADE,
    FOREIGN KEY (categoryId) REFERENCES Category(categoryId) ON DELETE CASCADE,
    FOREIGN KEY (subCategoryId) REFERENCES CategorySub(subCategoryId) ON DELETE CASCADE
);

CREATE TABLE ProductImage (
    imageId INT PRIMARY KEY IDENTITY,
    productId INT NOT NULL,
    imageUrl NVARCHAR(255) NOT NULL,
    FOREIGN KEY (productId) REFERENCES Product(productId) ON DELETE CASCADE
);

CREATE TABLE Cart (
    cartId INT PRIMARY KEY IDENTITY,
    userId INT NOT NULL,
    productId INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    addedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES [User](userId) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES Product(productId) ON DELETE NO ACTION
);

CREATE TABLE ShopOrder (
    orderId INT PRIMARY KEY IDENTITY,
    userId INT NOT NULL,
    orderDate DATETIME DEFAULT GETDATE(),
    totalAmount DECIMAL(10,2) NOT NULL CHECK (totalAmount >= 0),
    status NVARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Delivered', 'Rejected')),
    paymentMethod NVARCHAR(50) NOT NULL CHECK (paymentMethod = 'CashOnDelivery'),
    shippingAddressId INT NOT NULL,
    expectedDeliveryDate DATETIME,
    FOREIGN KEY (userId) REFERENCES [User](userId) ON DELETE CASCADE,
    FOREIGN KEY (shippingAddressId) REFERENCES Address(addressId) ON DELETE NO ACTION
);
--
ALTER TABLE ShopOrder
ADD deliveredDate DATETIME NULL;
--

CREATE TABLE OrderItem (
    orderItemId INT PRIMARY KEY IDENTITY,
    orderId INT NOT NULL,
    productId INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unitPrice DECIMAL(10,2) NOT NULL CHECK (unitPrice >= 0),
    FOREIGN KEY (orderId) REFERENCES ShopOrder(orderId) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES Product(productId) ON DELETE NO ACTION
);

CREATE TABLE ProductReview (
    reviewId INT PRIMARY KEY IDENTITY,
    buyerId INT NOT NULL,
    productId INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(500),
    reviewDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (buyerId) REFERENCES Buyer(buyerId) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES Product(productId) ON DELETE NO ACTION,
    CONSTRAINT UQ_Buyer_ProductReview UNIQUE (buyerId, productId)
);

-- Indexes with consistent naming
CREATE NONCLUSTERED INDEX IX_User_Email ON [User](emailAddress);
CREATE NONCLUSTERED INDEX IX_Cart_User ON Cart(userId);
CREATE NONCLUSTERED INDEX IX_ShopOrder_User ON ShopOrder(userId);
CREATE NONCLUSTERED INDEX IX_Product_Vendor ON Product(vendorId);
CREATE NONCLUSTERED INDEX IX_Product_Category ON Product(categoryId);
CREATE NONCLUSTERED INDEX IX_Product_SubCategory ON Product(subCategoryId);
CREATE NONCLUSTERED INDEX IX_Address_User ON Address(userId);
CREATE NONCLUSTERED INDEX IX_OrderItem_Order ON OrderItem(orderId);
CREATE NONCLUSTERED INDEX IX_ProductReview_Buyer ON ProductReview(buyerId, productId);
CREATE NONCLUSTERED INDEX IX_CategorySub_Category ON CategorySub(categoryId);
CREATE NONCLUSTERED INDEX IX_ProductImage_Product ON ProductImage(productId);



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