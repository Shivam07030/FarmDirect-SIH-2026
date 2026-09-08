CREATE DATABASE IF NOT EXISTS farmdirect_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE farmdirect_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS shipments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS market_rates;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS farmer_profiles;
DROP TABLE IF EXISTS otp_codes;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  role ENUM('FARMER', 'BUYER', 'ADMIN') NOT NULL,
  location VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE farmer_profiles (
  user_id VARCHAR(36) PRIMARY KEY,
  cluster_name VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 6) DEFAULT 27.1767,
  longitude DECIMAL(10, 6) DEFAULT 78.0081,
  rating DECIMAL(2, 1) DEFAULT 4.9,
  verified BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255)
);

CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  farmer_id VARCHAR(36) NOT NULL,
  category_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  variety VARCHAR(100),
  quantity INT NOT NULL,
  initial_quantity INT NOT NULL,
  price_per_kg DECIMAL(10, 2) NOT NULL,
  quality VARCHAR(50) DEFAULT 'Grade A (Premium)',
  harvest_date DATE NOT NULL,
  image_url TEXT,
  status ENUM('ACTIVE', 'PAUSED', 'SOLD_OUT') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY,
  buyer_id VARCHAR(36) NOT NULL,
  status ENUM('Pending', 'Confirmed', 'In Transit', 'Delivered') DEFAULT 'Confirmed',
  total_product_amount DECIMAL(12, 2) NOT NULL,
  logistics_fee DECIMAL(10, 2) NOT NULL,
  final_amount DECIMAL(12, 2) NOT NULL,
  delivery_location VARCHAR(255) NOT NULL,
  order_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  price_per_kg DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE shipments (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) UNIQUE NOT NULL,
  driver_name VARCHAR(100) DEFAULT 'Manpreet Singh',
  driver_phone VARCHAR(20) DEFAULT '+91 98112 34567',
  vehicle_number VARCHAR(30) DEFAULT 'DL-1L-4482',
  temperature_celsius DECIMAL(4, 1) DEFAULT 4.0,
  pickup_time VARCHAR(50) DEFAULT 'Today · 11:30 AM',
  estimated_delivery VARCHAR(50) DEFAULT 'Tomorrow · 10:00 AM',
  status ENUM('Pending', 'In Transit', 'Delivered') DEFAULT 'In Transit',
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE market_rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  crop_name VARCHAR(100) NOT NULL,
  category_id INT NOT NULL,
  mandi_farmer_price DECIMAL(10, 2) NOT NULL,
  mandi_consumer_price DECIMAL(10, 2) NOT NULL,
  farmdirect_farmer_price DECIMAL(10, 2) NOT NULL,
  farmdirect_consumer_price DECIMAL(10, 2) NOT NULL,
  demand_growth VARCHAR(20) NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE otp_codes (
  phone VARCHAR(20) PRIMARY KEY,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL
);

-- Seed Categories
INSERT INTO categories (id, name, description) VALUES
(1, 'Vegetables', 'Freshly harvested regional vegetables'),
(2, 'Fruits', 'Orchard fruits and seasonal harvests'),
(3, 'Grains', 'Wheat, rice, and edible cereals'),
(4, 'Pulses', 'Lentils and high-protein crops'),
(5, 'Spices', 'Farm-dried spices and seeds');

-- Seed Users
INSERT INTO users (id, phone, name, role, location) VALUES
('USER-001', '+919876543210', 'Rajesh Kumar', 'FARMER', 'Agra, UP'),
('USER-002', '+919811200000', 'FreshBasket Supermarket', 'BUYER', 'Delhi NCR'),
('USER-003', '+919999900000', 'FarmDirect Admin Ops', 'ADMIN', 'Regional HQ'),
('USER-004', '+919412355678', 'Balram Singh', 'FARMER', 'Mathura, UP'),
('USER-005', '+919823411223', 'Hardeep Yadav', 'FARMER', 'Aligarh, UP'),
('USER-006', '+919154388990', 'Suresh Verma', 'FARMER', 'Lucknow, UP'),
('USER-007', '+919811299881', 'AgroPure Processing Ltd', 'BUYER', 'Greater Noida'),
('USER-008', '+919811277662', 'Delhi Culinary Cooperative', 'BUYER', 'Okhla, Delhi');

-- Seed Farmer Profiles
INSERT INTO farmer_profiles (user_id, cluster_name, latitude, longitude, rating, verified) VALUES
('USER-001', 'Agra Farm Cluster', 27.1767, 78.0081, 4.9, TRUE),
('USER-004', 'Mathura Farm Belt', 27.4924, 77.6737, 4.8, TRUE),
('USER-005', 'Aligarh Cluster', 27.8974, 78.0880, 4.7, TRUE),
('USER-006', 'Lucknow Plains', 26.8467, 80.9462, 5.0, TRUE);

-- Seed Products
INSERT INTO products (id, farmer_id, category_id, name, variety, quantity, initial_quantity, price_per_kg, quality, harvest_date, image_url, status) VALUES
('PROD-101', 'USER-001', 1, 'Tomato (Hybrid Desi)', 'Desi Hybrid', 450, 500, 24.00, 'Grade A (Premium)', CURDATE(), 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80', 'ACTIVE'),
('PROD-102', 'USER-001', 1, 'Potato (Kufri Jyoti)', 'Kufri Jyoti', 480, 500, 18.00, 'Grade A (Premium)', CURDATE(), 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80', 'ACTIVE'),
('PROD-103', 'USER-005', 1, 'Red Onion (Nashik Quality)', 'Garwa Winter', 800, 1000, 28.00, 'Grade A (Premium)', CURDATE(), 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80', 'ACTIVE'),
('PROD-104', 'USER-006', 3, 'Wheat (Sharbati Gold)', 'Sharbati', 1200, 1500, 31.00, 'Grade A+ (Export Quality)', CURDATE(), 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80', 'ACTIVE'),
('PROD-105', 'USER-004', 3, 'Mustard Seed (Pusa Bold)', 'Pusa Bold', 600, 600, 52.00, 'Organic Certified', CURDATE(), 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=600&auto=format&fit=crop&q=80', 'ACTIVE');

-- Seed Orders
INSERT INTO orders (id, buyer_id, status, total_product_amount, logistics_fee, final_amount, delivery_location, order_date) VALUES
('ORD-8812', 'USER-002', 'Confirmed', 1200.00, 150.00, 1350.00, 'Delhi (Azadpur Terminal Hub)', CURDATE()),
('ORD-8813', 'USER-002', 'In Transit', 1800.00, 220.00, 2020.00, 'Delhi (Azadpur Terminal Hub)', CURDATE());

-- Seed Order Items
INSERT INTO order_items (id, order_id, product_id, quantity, price_per_kg, total_price) VALUES
('ITEM-8812-1', 'ORD-8812', 'PROD-101', 50, 24.00, 1200.00),
('ITEM-8813-1', 'ORD-8813', 'PROD-102', 100, 18.00, 1800.00);

-- Seed Shipments
INSERT INTO shipments (id, order_id, driver_name, driver_phone, vehicle_number, temperature_celsius, pickup_time, estimated_delivery, status) VALUES
('SHIP-01', 'ORD-8812', 'Manpreet Singh', '+91 98112 34567', 'DL-1L-4482', 4.0, 'Today · 11:30 AM', 'Today · 4:30 PM', 'In Transit'),
('SHIP-02', 'ORD-8813', 'Gurvinder Singh', '+91 98112 88776', 'HR-38-9901', 4.5, 'Today · 1:15 PM', 'Tomorrow · 10:00 AM', 'In Transit');

-- Seed Market Rates
INSERT INTO market_rates (id, crop_name, category_id, mandi_farmer_price, mandi_consumer_price, farmdirect_farmer_price, farmdirect_consumer_price, demand_growth) VALUES
(1, 'Tomato', 1, 18.00, 32.00, 24.00, 27.00, '+18%'),
(2, 'Potato', 1, 14.00, 22.00, 18.00, 19.00, '+12%'),
(3, 'Onion', 1, 22.00, 35.00, 27.00, 31.00, '+15%'),
(4, 'Wheat (Sharbati)', 3, 26.00, 40.00, 31.00, 36.00, '+8%');
