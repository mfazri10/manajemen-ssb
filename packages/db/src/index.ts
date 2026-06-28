import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as publicSchema from './schema/public';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// Singleton connection to prevent hot-reloading issues in development
const globalForDrizzle = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

export const conn = globalForDrizzle.conn ?? postgres(connectionString);

if (process.env.NODE_ENV !== 'production') {
  globalForDrizzle.conn = conn;
}

export const db = drizzle(conn, { schema: publicSchema });

export * from './schema/public';
export * from './schema/tenant';
