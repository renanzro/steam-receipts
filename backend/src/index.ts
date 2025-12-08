import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { db } from './db/index.js';
import app from './app.js';

// Run migrations on startup
console.log('Running database migrations...');
migrate(db, { migrationsFolder: './drizzle' });
console.log('Migrations completed!');

const port = Number(process.env.PORT) || 3000;

console.log(`🚀 Server running at http://localhost:${port}`);

export default {
  fetch: app.fetch,
  port,
};
