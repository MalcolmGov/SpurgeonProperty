import pg from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const connectionString = process.env.DATABASE_URL;

// Standard Postgres connection. Enable SSL only when the target requires it
// (e.g. Neon or any host with sslmode=require); Railway's internal Postgres
// network does not use SSL.
const needsSsl = /neon\.tech|sslmode=require/i.test(connectionString);

export const pool = new pg.Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  max: 10,
});

export async function testDatabaseConnection(): Promise<void> {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('Database connection established successfully at:', result.rows[0].current_time);
  } catch (err) {
    console.error('Database connection failed:', err);
    // Don't throw error - let the app start without database for now
    console.warn('Continuing without database connection...');
  }
}

// For compatibility with existing code that expects a pool
export default pool;
