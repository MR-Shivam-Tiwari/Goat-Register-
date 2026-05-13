import { Pool } from 'pg';

// Singleton pattern for the database pool to prevent 
// creating multiple pools during Next.js HMR in development.
const globalForPool = global as unknown as { pool: Pool };

export const pool =
  globalForPool.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // Limit max connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

if (process.env.NODE_ENV !== 'production') globalForPool.pool = pool;

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;
