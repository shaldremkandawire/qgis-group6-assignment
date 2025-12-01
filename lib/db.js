import mysql from 'mysql2/promise';

// Create a connection pool for better performance
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Your MySQL password here
  database: 'spatial_risk_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export { pool };