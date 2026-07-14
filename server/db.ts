import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const connectionString = process.env.DATABASE_URL;

// Standard Postgres connection (Railway internal Postgres, or any host).
// Enable SSL only when the target requires it — e.g. Neon or any host with
// sslmode=require. Railway's internal Postgres network does not use SSL.
const needsSsl = /neon\.tech|sslmode=require/i.test(connectionString);

export const pool = new pg.Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  max: 10,
});

export const db = drizzle(pool, { schema });
