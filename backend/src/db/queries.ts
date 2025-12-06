import { eq, and } from 'drizzle-orm';
import { db, users, games, userGames } from './index.js';
import type { SteamPlayer, SteamGame } from '../lib/steam-api.js';

// Cache TTL in milliseconds (1 hour)
const CACHE_TTL = 60 * 60 * 1000;

function isCacheValid(cachedAt: Date): boolean {
  return Date.now() - cachedAt.getTime() < CACHE_TTL;
}

// Helper to extract avatar hash from Steam URL
function extractAvatarHash(avatarUrl: string): string {
  // URL format: https://avatars.steamstatic.com/{hash}.jpg
  const match = avatarUrl.match(/avatars\.steamstatic\.com\/([a-fA-F0-9]+)/);
  return match ? match[1] : '';
}

// Helper to build avatar URLs from hash
function buildAvatarUrls(hash: string) {
  const base = 'https://avatars.steamstatic.com';
  return {
    avatar: `${base}/${hash}.jpg`,
    avatarmedium: `${base}/${hash}_medium.jpg`,
    avatarfull: `${base}/${hash}_full.jpg`,
  };
}

// Helper to build profile URL from steamId
function buildProfileUrl(steamId: string): string {
  return `https://steamcommunity.com/profiles/${steamId}/`;
}

// ============ User Queries ============

export async function getCachedUser(steamId: string) {
  const user = db.select().from(users).where(eq(users.steamId, steamId)).get();
  
  if (user && isCacheValid(user.cachedAt)) {
    const avatars = buildAvatarUrls(user.avatarHash);
    return {
      steamid: user.steamId,
      personaname: user.personaName,
      profileurl: buildProfileUrl(user.steamId),
      avatar: avatars.avatar,
      avatarmedium: avatars.avatarmedium,
      avatarfull: avatars.avatarfull,
    } as SteamPlayer;
  }
  
  return null;
}

export async function cacheUser(player: SteamPlayer) {
  const now = new Date();
  const avatarHash = extractAvatarHash(player.avatar);
  
  db.insert(users)
    .values({
      steamId: player.steamid,
      personaName: player.personaname,
      avatarHash: avatarHash,
      cachedAt: now,
    })
    .onConflictDoUpdate({
      target: users.steamId,
      set: {
        personaName: player.personaname,
        avatarHash: avatarHash,
        cachedAt: now,
      },
    })
    .run();
}

// ============ Games Queries ============

export async function getCachedUserGames(steamId: string) {
  // Check if we have cached games for this user
  const cachedGames = db
    .select({
      appId: games.appId,
      name: games.name,
      playtimeForever: userGames.playtimeForever,
      playtime2Weeks: userGames.playtime2Weeks,
      cachedAt: userGames.cachedAt,
    })
    .from(userGames)
    .innerJoin(games, eq(userGames.appId, games.appId))
    .where(eq(userGames.steamId, steamId))
    .all();

  if (cachedGames.length === 0) {
    return null;
  }

  // Check if cache is still valid (use the first game's cache time)
  if (!isCacheValid(cachedGames[0].cachedAt)) {
    return null;
  }

  // Transform to SteamGame format
  return cachedGames.map((g) => ({
    appid: g.appId,
    name: g.name,
    playtime_forever: g.playtimeForever,
    playtime_2weeks: g.playtime2Weeks ?? undefined,
    img_icon_url: '', // Built on frontend from appId
  })) as SteamGame[];
}

export async function cacheUserGames(steamId: string, steamGames: SteamGame[]) {
  const now = new Date();

  // Use a transaction for consistency
  db.transaction((tx) => {
    // First, ensure user exists (they should from login)
    const userExists = tx.select().from(users).where(eq(users.steamId, steamId)).get();
    if (!userExists) {
      console.warn(`User ${steamId} not found in database, skipping game cache`);
      return;
    }

    // Delete old user_games entries for this user
    tx.delete(userGames).where(eq(userGames.steamId, steamId)).run();

    // Insert/update games and user_games
    for (const game of steamGames) {
      // Upsert game info
      tx.insert(games)
        .values({
          appId: game.appid,
          name: game.name,
          cachedAt: now,
        })
        .onConflictDoUpdate({
          target: games.appId,
          set: {
            name: game.name,
            cachedAt: now,
          },
        })
        .run();

      // Insert user_game entry
      tx.insert(userGames)
        .values({
          steamId: steamId,
          appId: game.appid,
          playtimeForever: game.playtime_forever,
          playtime2Weeks: game.playtime_2weeks ?? null,
          cachedAt: now,
        })
        .run();
    }
  });
}

// ============ Cache Invalidation ============

export async function invalidateUserCache(steamId: string) {
  db.transaction((tx) => {
    tx.delete(userGames).where(eq(userGames.steamId, steamId)).run();
    tx.delete(users).where(eq(users.steamId, steamId)).run();
  });
}
