import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema.js';

const dbPath = process.env.DATABASE_PATH || 'steam-receipts.db';
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Export schema for convenience
export * from './schema.js';
