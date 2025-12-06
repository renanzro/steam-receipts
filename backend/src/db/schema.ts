import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Users table - stores Steam profile info
export const users = sqliteTable('users', {
  steamId: text('steam_id').primaryKey(),
  personaName: text('persona_name').notNull(),
  avatarHash: text('avatar_hash').notNull(),
  cachedAt: integer('cached_at', { mode: 'timestamp' }).notNull(),
});

// Games table - stores game info (shared across users)
export const games = sqliteTable('games', {
  appId: integer('app_id').primaryKey(),
  name: text('name').notNull(),
  cachedAt: integer('cached_at', { mode: 'timestamp' }).notNull(),
});

// User games table - stores playtime per user per game
export const userGames = sqliteTable('user_games', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  steamId: text('steam_id').notNull().references(() => users.steamId),
  appId: integer('app_id').notNull().references(() => games.appId),
  playtimeForever: integer('playtime_forever').notNull(), // in minutes
  playtime2Weeks: integer('playtime_2_weeks'), // in minutes, nullable
  cachedAt: integer('cached_at', { mode: 'timestamp' }).notNull(),
});

// Type exports for use in queries
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type UserGame = typeof userGames.$inferSelect;
export type NewUserGame = typeof userGames.$inferInsert;
