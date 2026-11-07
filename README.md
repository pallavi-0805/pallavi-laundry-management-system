# Pallavi Laundry Service Management

A CRUD web application using HTML, CSS, JavaScript, Express.js and MySQL.

## Requirements
- Node.js (18 or newer recommended)
- MySQL Server and MySQL Workbench

## Setup
1. Extract the ZIP folder.
2. Open MySQL Workbench and run all statements in `database.sql`.
3. Open this project folder in VS Code / terminal.
4. Run `npm install`.
5. Copy `.env.example` to `.env` and enter your MySQL username and password.
6. Run `npm start`.
7. Open `http://localhost:3000` in your browser.

## Features
- Dashboard with customer, service, order and revenue totals.
- Full Create, Read, Update and Delete operations for Customers, Services, Orders and Payments.
- Express REST API connected to MySQL using mysql2 prepared queries.
- Foreign keys connect orders to customers/services and payments to orders.

## Database notes
The supplied order columns did not include customer_id and service_id. These two foreign keys are added so each order can be associated with a customer and a laundry service. The `address` column is used as the corrected spelling of `adress`.
