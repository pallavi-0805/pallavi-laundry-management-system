CREATE DATABASE IF NOT EXISTS pallavi_laundry;
USE pallavi_laundry;

CREATE TABLE IF NOT EXISTS customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  email VARCHAR(100),
  address VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS services (
  service_id INT AUTO_INCREMENT PRIMARY KEY,
  service_name VARCHAR(100) NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  service_id INT NOT NULL,
  clothes_weight DECIMAL(8,2) NOT NULL,
  order_date DATE NOT NULL,
  delivery_date DATE,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(30) DEFAULT 'Pending',
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  FOREIGN KEY (service_id) REFERENCES services(service_id)
);

CREATE TABLE IF NOT EXISTS payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(30) NOT NULL,
  status VARCHAR(30) DEFAULT 'Paid',
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

INSERT INTO services (service_name, price_per_kg, description) VALUES
('Wash & Fold', 60.00, 'Regular washing, drying and folding'),
('Dry Cleaning', 150.00, 'Professional dry cleaning'),
('Ironing', 40.00, 'Steam ironing service');
