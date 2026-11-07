const mysql = require('mysql2/promise');
require('dotenv').config();
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Palla@2006',
  database: process.env.DB_NAME || 'pallavi_laundry',
  waitForConnections: true, connectionLimit: 10
});
module.exports = pool;