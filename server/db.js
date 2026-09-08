import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'farmdirect_user',
  password: process.env.DB_PASSWORD || 'FarmDirect@2026!',
  database: process.env.DB_NAME || 'farmdirect_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (err) {
    console.error('MySQL connection error:', err.message);
    return false;
  }
}
