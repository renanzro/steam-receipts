import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore, Timestamp } from 'firebase-admin/firestore';

let app: App | undefined;
let db: Firestore | undefined;

/**
 * Get or initialize Firebase Admin SDK
 */
function getFirebaseApp(): App {
  if (app) return app;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    return app;
  }

  const config = useRuntimeConfig();

  // Check if we have all required credentials
  if (!config.firebase.projectId || !config.firebase.clientEmail || !config.firebase.privateKey) {
    throw new Error(
      'Firebase configuration is incomplete. Check FIREBASE_* environment variables.'
    );
  }

  app = initializeApp({
    credential: cert({
      projectId: config.firebase.projectId,
      clientEmail: config.firebase.clientEmail,
      // Replace escaped newlines in the private key
      privateKey: config.firebase.privateKey.replace(/\\n/g, '\n')
    })
  });

  return app;
}

/**
 * Get Firestore database instance
 */
export function getDb(): Firestore {
  if (db) return db;

  getFirebaseApp();
  db = getFirestore();
  return db;
}

// Cache TTL in milliseconds (1 hour)
const CACHE_TTL = 60 * 60 * 1000;

/**
 * Remove undefined values from an object (Firestore doesn't allow undefined)
 */
function removeUndefined<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item)) as T;
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, removeUndefined(value)])
    ) as T;
  }
  return obj;
}

/**
 * Check if a cached document is still valid
 */
function isCacheValid(cachedAt: Timestamp | Date | undefined): boolean {
  if (!cachedAt) return false;

  const cachedTime = cachedAt instanceof Timestamp ? cachedAt.toMillis() : cachedAt.getTime();
  return Date.now() - cachedTime < CACHE_TTL;
}

// ============ User Cache Operations ============

export interface CachedUser {
  steamId: string;
  personaName: string;
  avatarHash: string;
  cachedAt: Timestamp;
}

/**
 * Get cached user from Firestore
 */
export async function getCachedUser(steamId: string): Promise<CachedUser | null> {
  try {
    const db = getDb();
    const doc = await db.collection('users').doc(steamId).get();

    if (!doc.exists) return null;

    const data = doc.data() as CachedUser;

    if (!isCacheValid(data.cachedAt)) {
      return null; // Cache expired
    }

    return data;
  } catch (error) {
    console.error('Error getting cached user:', error);
    return null;
  }
}

/**
 * Cache user data in Firestore
 */
export async function cacheUser(
  steamId: string,
  personaName: string,
  avatarHash: string
): Promise<void> {
  try {
    const db = getDb();
    await db.collection('users').doc(steamId).set({
      steamId,
      personaName,
      avatarHash,
      cachedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error caching user:', error);
  }
}

// ============ Games Cache Operations ============

export interface CachedGame {
  appId: number;
  name: string;
  playtimeForever: number;
  playtime2Weeks?: number;
}

export interface CachedUserGames {
  steamId: string;
  games: CachedGame[];
  cachedAt: Timestamp;
}

/**
 * Get cached games for a user from Firestore
 */
export async function getCachedUserGames(steamId: string): Promise<CachedGame[] | null> {
  try {
    const db = getDb();
    const doc = await db.collection('userGames').doc(steamId).get();

    if (!doc.exists) return null;

    const data = doc.data() as CachedUserGames;

    if (!isCacheValid(data.cachedAt)) {
      return null; // Cache expired
    }

    return data.games;
  } catch (error) {
    console.error('Error getting cached games:', error);
    return null;
  }
}

/**
 * Cache user's games in Firestore
 */
export async function cacheUserGames(steamId: string, games: CachedGame[]): Promise<void> {
  try {
    const db = getDb();
    // Remove undefined values - Firestore doesn't allow them
    const sanitizedGames = removeUndefined(games);
    await db.collection('userGames').doc(steamId).set({
      steamId,
      games: sanitizedGames,
      cachedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error caching user games:', error);
  }
}
