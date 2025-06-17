import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Use HTTP-based connection instead of WebSocket to avoid connection issues
const sql = neon(process.env.DATABASE_URL);

export async function testDatabaseConnection(): Promise<void> {
  try {
    console.log('Testing database connection...');
    const result = await sql('SELECT NOW() as current_time');
    console.log('Database connection established successfully at:', result[0].current_time);
  } catch (err) {
    console.error('Database connection failed:', err);
    // Don't throw error - let the app start without database for now
    console.warn('Continuing without database connection...');
  }
}

// For compatibility with existing code that expects a pool
export const pool = {
  connect: async () => {
    return {
      query: sql,
      release: () => {}
    };
  }
};

export default pool;