-- Drop All Tables Script
-- Purpose: Drops all 13 tables in the e-commerce database in the correct order to avoid foreign key constraint errors.
-- Tables: user, role, user_role, buyer, vendor, address, category, category_sub, product, cart, shop_order, order_items, product_review
-- Order: Child tables first (e.g., product, cart) to parent tables (e.g., user, category) to respect foreign key dependencies.
-- Created by: Grok 3 for xAI
-- Date: April 25, 2025

USE E_Commerce;
GO

-- Drop tables in reverse dependency order to avoid foreign key constraint errors
DROP TABLE IF EXISTS product_review;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS shop_order;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS category_sub;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS address;
DROP TABLE IF EXISTS vendor;
DROP TABLE IF EXISTS buyer;
DROP TABLE IF EXISTS user_role;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS [user];
GO

-- Complete E-Commerce Database Script (Fixed All Foreign Key Errors)
-- Purpose: Creates the entire database schema, triggers, views, and stored procedures for an e-commerce system, fixing foreign key constraint errors in cart, shop_order, order_items, and product_review tables due to multiple cascade paths.
-- Flow Covered:
-- 1. /login: User registration (buyer/vendor), buyer preferences (single: male, female, children), vendor name, address with default trigger.
-- 2. /buyer_dashboard: Recommended products (based on preference), category/subcategory filter.
-- 3. /buyer_dashboard/profile: View profile, order history, reviews (no edit).
-- 4. /buyer_dashboard/cart: View cart, add/delete items (only if stock_quantity > 0), checkout with receipt (OrderID, details, shipping address, expected date +2 days).
-- 5. /vendor_dashboard: Add/update/delete products, view products, reviews, basic analytics (orders, units sold, revenue, ratings, status-wise orders).
-- Fixes:
-- 1. Changed category_sub.category_id to ON DELETE NO ACTION to avoid multiple cascade paths from category to product.
-- 2. Changed cart.product_id to ON DELETE NO ACTION to avoid multiple cascade paths from user to cart.
-- 3. Changed shop_order.shipping_address_id to ON DELETE NO ACTION to avoid multiple cascade paths from user to shop_order.
-- 4. Changed order_items.product_id to ON DELETE NO ACTION to avoid multiple cascade paths from user to order_items.
-- 5. Changed product_review.product_id to ON DELETE NO ACTION to avoid multiple cascade paths from user to product_review.
-- 6. Updated sp_delete_product to handle cleanup of cart, order_items, and product_review records before deleting product.
-- Created by: Grok 3 for xAI
-- Date: April 25, 2025

-- Create Database
CREATE DATABASE db_E_Commerce;
GO
USE E_Commerce;
GO

-- SCHEMA: Tables
-- Purpose: Define the core structure of the e-commerce system with 13 tables to store users, roles, products, orders, etc.

-- 1. [user]
-- Purpose: Stores basic user information for all users (buyers, vendors, managers).
-- Why: Centralized user management for login and authentication.
CREATE TABLE [user] (
    id INT PRIMARY KEY IDENTITY,
    full_name NVARCHAR(100) NOT NULL,
    email_address NVARCHAR(100) UNIQUE NOT NULL,
    password_hash NVARCHAR(256) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    is_active BIT DEFAULT 1
);

-- 2. role
-- Purpose: Defines user roles (buyer, vendor, manager).
-- Why: To manage permissions; manager is placeholder for future admin functionality.
CREATE TABLE role (
    id INT PRIMARY KEY IDENTITY,
    name NVARCHAR(50) UNIQUE NOT NULL CHECK (name IN ('buyer', 'vendor', 'manager'))
);

-- 3. user_role
-- Purpose: Assigns roles to users (many-to-many).
-- Why: Allows flexibility for users to have multiple roles in the future.
CREATE TABLE user_role (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES [user](id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
);

-- 4. buyer
-- Purpose: Stores buyer-specific data, including single preference.
-- Why: To personalize recommendations and track buyer profiles.
CREATE TABLE buyer (
    id INT PRIMARY KEY IDENTITY,
    user_id INT UNIQUE NOT NULL,
    preferences NVARCHAR(20) CHECK (preferences IN ('male', 'female', 'children')),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES [user](id) ON DELETE CASCADE
);

-- 5. vendor
-- Purpose: Stores vendor-specific data, like store name.
-- Why: To manage vendor profiles and link to their products.
CREATE TABLE vendor (
    id INT PRIMARY KEY IDENTITY,
    user_id INT UNIQUE NOT NULL,
    vendor_name NVARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES [user](id) ON DELETE CASCADE
);

-- 6. address
-- Purpose: Stores addresses for users (buyers and vendors).
-- Why: For shipping (buyers) and store location (vendors); single table for simplicity.
CREATE TABLE address (
    id INT PRIMARY KEY IDENTITY,
    user_id INT NOT NULL,
    address_line1 NVARCHAR(255) NOT NULL,
    city NVARCHAR(100) NOT NULL,
    postal_code NVARCHAR(20) NOT NULL,
    country NVARCHAR(100) NOT NULL,
    is_default BIT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES [user](id) ON DELETE CASCADE
);

-- 7. category
-- Purpose: Defines main product categories (male, female, children).
-- Why: To organize products and align with buyer preferences.
CREATE TABLE category (
    id INT PRIMARY KEY IDENTITY,
    name NVARCHAR(20) NOT NULL CHECK (name IN ('male', 'female', 'children')),
    is_active BIT DEFAULT 1,
    CONSTRAINT uq_category_name UNIQUE (name)
);

-- 8. category_sub
-- Purpose: Defines subcategories (clothes, shoes, accessories) under main categories.
-- Why: For granular product filtering and organization.
-- Fix: FOREIGN KEY to ON DELETE NO ACTION to avoid multiple cascade paths from category to product.
CREATE TABLE category_sub (
    id INT PRIMARY KEY IDENTITY,
    category_id INT NOT NULL,
    name NVARCHAR(20) NOT NULL CHECK (name IN ('clothes', 'shoes', 'accessories')),
    is_active BIT DEFAULT 1,
    CONSTRAINT uq_category_sub_name UNIQUE (category_id, name),
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE NO ACTION
);

-- 9. product
-- Purpose: Stores product details, including image URL.
-- Why: Core of e-commerce; holds all product info for display and ordering.
CREATE TABLE product (
    id INT PRIMARY KEY IDENTITY,
    vendor_id INT NOT NULL,
    category_id INT NOT NULL,
    category_sub_id INT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INT NOT NULL CHECK (stock_quantity >= 0),
    image_url NVARCHAR(255),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (vendor_id) REFERENCES vendor(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE,
    FOREIGN KEY (category_sub_id) REFERENCES category_sub(id) ON DELETE CASCADE
);

-- 10. cart
-- Purpose: Stores buyer’s cart items.
-- Why: Tracks products selected for purchase before checkout.
-- Fix: FOREIGN KEY product_id to ON DELETE NO ACTION to avoid multiple cascade paths from user to cart.
CREATE TABLE cart (
    id INT PRIMARY KEY IDENTITY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    added_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES [user](id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE NO ACTION
);

-- 11. shop_order
-- Purpose: Stores order summary, including expected delivery date.
-- Why: Tracks order history and status for buyers.
-- Fix: FOREIGN KEY shipping_address_id to ON DELETE NO ACTION to avoid multiple cascade paths from user to shop_order.
CREATE TABLE shop_order (
    id INT PRIMARY KEY IDENTITY,
    user_id INT NOT NULL,
    order_date DATETIME DEFAULT GETDATE(),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    status NVARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Delivered', 'Rejected')),
    payment_method NVARCHAR(50) NOT NULL CHECK (payment_method = 'CashOnDelivery'),
    shipping_address_id INT NOT NULL,
    expected_delivery_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES [user](id) ON DELETE CASCADE,
    FOREIGN KEY (shipping_address_id) REFERENCES address(id) ON DELETE NO ACTION
);

-- 12. order_items
-- Purpose: Stores individual items in an order.
-- Why: Provides detailed breakdown of products in each order.
-- Fix: FOREIGN KEY product_id to ON DELETE NO ACTION to avoid multiple cascade paths from user to order_items.
CREATE TABLE order_items (
    id INT PRIMARY KEY IDENTITY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    FOREIGN KEY (order_id) REFERENCES shop_order(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE NO ACTION
);

-- 13. product_review
-- Purpose: Stores buyer reviews for products.
-- Why: Builds trust and allows feedback; one review per buyer per product.
-- Fix: FOREIGN KEY product_id to ON DELETE NO ACTION to avoid multiple cascade paths from user to product_review.
CREATE TABLE product_review (
    id INT PRIMARY KEY IDENTITY,
    buyer_id INT NOT NULL,
    product_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(500),
    review_date DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (buyer_id) REFERENCES buyer(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE NO ACTION,
    CONSTRAINT uq_buyer_product_review UNIQUE (buyer_id, product_id)
);

-- Indexes
-- Purpose: Improve query performance for common operations.
CREATE NONCLUSTERED INDEX IX_user_email ON [user](email_address);
CREATE NONCLUSTERED INDEX IX_cart_user_id ON cart(user_id);
CREATE NONCLUSTERED INDEX IX_shop_order_user_id ON shop_order(user_id);
CREATE NONCLUSTERED INDEX IX_product_vendor_id ON product(vendor_id);
CREATE NONCLUSTERED INDEX IX_product_category_id ON product(category_id);
CREATE NONCLUSTERED INDEX IX_product_category_sub_id ON product(category_sub_id);
CREATE NONCLUSTERED INDEX IX_address_user_id ON address(user_id);
CREATE NONCLUSTERED INDEX IX_order_items_order_id ON order_items(order_id);
CREATE NONCLUSTERED INDEX IX_product_review_buyer_product ON product_review(buyer_id, product_id);
CREATE NONCLUSTERED INDEX IX_category_sub_category_id ON category_sub(category_id);