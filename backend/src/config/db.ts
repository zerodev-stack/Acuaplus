import mysql from 'mysql2/promise';
import { env } from './env';

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const query = async <T = mysql.RowDataPacket[]>(
  sql: string,
  params?: unknown[]
): Promise<T> => {
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(sql, params as any[]);
  return rows as T;
};

export const getConnection = async () => {
  return pool.getConnection();
};

export const transaction = async <T>(
  callback: (conn: mysql.PoolConnection) => Promise<T>
): Promise<T> => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

export default pool;
