CREATE DATABASE IF NOT EXISTS farmdirect_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE farmdirect_db;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  role ENUM('FARMER', 'BUYER', 'ADMIN') NOT NULL,
  location VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_codes (
  phone VARCHAR(20) PRIMARY KEY,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  initial_quantity INT NOT NULL,
  price_per_kg DECIMAL(10, 2) NOT NULL,
  location VARCHAR(100) NOT NULL,
  harvest_date DATE NOT NULL,
  quality VARCHAR(50) NOT NULL,
  farmer_id VARCHAR(36) NOT NULL,
  farmer_name VARCHAR(100) NOT NULL,
  farmer_phone VARCHAR(20) NOT NULL,
  farmer_rating DECIMAL(2, 1) DEFAULT 4.9,
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  farmer_id VARCHAR(36) NOT NULL,
  farmer_name VARCHAR(100) NOT NULL,
  buyer_id VARCHAR(36) NOT NULL,
  buyer_name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  price_per_kg DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  logistics_fee DECIMAL(10, 2) NOT NULL,
  final_amount DECIMAL(12, 2) NOT NULL,
  delivery_location VARCHAR(255) NOT NULL,
  status VARCHAR(30) DEFAULT 'Confirmed',
  order_date DATE NOT NULL,
  estimated_delivery VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market_rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  crop_name VARCHAR(100) NOT NULL,
  mandi_farmer_price DECIMAL(10, 2) NOT NULL,
  mandi_consumer_price DECIMAL(10, 2) NOT NULL,
  farmdirect_farmer_price DECIMAL(10, 2) NOT NULL,
  farmdirect_consumer_price DECIMAL(10, 2) NOT NULL,
  demand_growth VARCHAR(20) NOT NULL
);

INSERT INTO users (id, phone, name, role, location) VALUES
('USER-001', '+919876543210', 'Rajesh Kumar', 'FARMER', 'Agra, UP'),
('USER-002', '+919811200000', 'FreshBasket Supermarket', 'BUYER', 'Delhi NCR'),
('USER-003', '+919999900000', 'FarmDirect Admin Ops', 'ADMIN', 'Regional HQ')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO products (id, name, category, quantity, initial_quantity, price_per_kg, location, harvest_date, quality, farmer_id, farmer_name, farmer_phone, farmer_rating, image_url) VALUES
('PROD-101', 'Tomato (Hybrid Desi)', 'Vegetables', 450, 500, 24.00, 'Agra Farm Cluster', CURDATE(), 'Grade A (Premium)', 'USER-001', 'Rajesh Kumar', '+91 98765 43210', 4.9, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'),
('PROD-102', 'Potato (Kufri Jyoti)', 'Vegetables', 480, 500, 18.00, 'Mathura Farm Belt', CURDATE(), 'Grade A (Premium)', 'USER-001', 'Rajesh Kumar', '+91 98765 43210', 4.8, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80'),
('PROD-103', 'Red Onion (Nashik Quality)', 'Vegetables', 800, 1000, 28.00, 'Aligarh Cluster', CURDATE(), 'Grade A (Premium)', 'USER-004', 'Hardeep Yadav', '+91 98234 11223', 4.7, 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80'),
('PROD-104', 'Wheat (Sharbati Gold)', 'Grains', 1200, 1500, 31.00, 'Lucknow Plains', CURDATE(), 'Grade A+ (Export Quality)', 'USER-005', 'Suresh Verma', '+91 91543 88990', 5.0, 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80'),
('PROD-105', 'Mustard Seed (Pusa Bold)', 'Grains', 600, 600, 52.00, 'Hathras Belt', CURDATE(), 'Organic Certified', 'USER-006', 'Balram Singh', '+91 94123 55678', 4.8, 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=600&auto=format&fit=crop&q=80')
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);

INSERT INTO orders (id, product_id, product_name, category, farmer_id, farmer_name, buyer_id, buyer_name, quantity, price_per_kg, total_price, logistics_fee, final_amount, delivery_location, status, order_date, estimated_delivery) VALUES
('ORD-8812', 'PROD-101', 'Tomato (Hybrid Desi)', 'Vegetables', 'USER-001', 'Rajesh Kumar', 'USER-002', 'FreshBasket Supermarket', 50, 24.00, 1200.00, 150.00, 1350.00, 'Delhi (Azadpur Hub)', 'Confirmed', CURDATE(), 'Today · 4:30 PM'),
('ORD-8813', 'PROD-102', 'Potato (Kufri Jyoti)', 'Vegetables', 'USER-001', 'Rajesh Kumar', 'USER-002', 'FreshBasket Supermarket', 100, 18.00, 1800.00, 220.00, 2020.00, 'Delhi (Azadpur Hub)', 'In Transit', CURDATE(), 'Tomorrow · 10:00 AM')
ON DUPLICATE KEY UPDATE status=VALUES(status);

INSERT INTO market_rates (id, crop_name, mandi_farmer_price, mandi_consumer_price, farmdirect_farmer_price, farmdirect_consumer_price, demand_growth) VALUES
(1, 'Tomato', 18.00, 32.00, 24.00, 27.00, '+18%'),
(2, 'Potato', 14.00, 22.00, 18.00, 19.00, '+12%'),
(3, 'Onion', 22.00, 35.00, 27.00, 31.00, '+15%'),
(4, 'Wheat (Sharbati)', 26.00, 40.00, 31.00, 36.00, '+8%')
ON DUPLICATE KEY UPDATE demand_growth=VALUES(demand_growth);
