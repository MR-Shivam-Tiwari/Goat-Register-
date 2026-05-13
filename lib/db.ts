import { Pool } from 'pg';

// Singleton pattern for the database pool to prevent 
// creating multiple pools during Next.js HMR in development.
const globalForPool = global as unknown as { pool: Pool };

export const pool =
  globalForPool.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 100, // Increased to handle bursts from 404s
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000, // 30 seconds timeout
  });

if (process.env.NODE_ENV !== 'production') globalForPool.pool = pool;

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.log('Slow query:', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (err) {
    console.error('Database query error:', { text, err });
    throw err;
  }
};
export default pool;
