const STEAM_API_BASE = 'https://api.steampowered.com';
const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';

function getApiKey(): string {
  const config = useRuntimeConfig();
  const key = config.steamApiKey;
  if (!key) {
    throw new Error('STEAM_API_KEY environment variable is not set');
  }
  return key;
}

// ============ Steam API Types ============

export interface SteamPlayer {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate?: number;
  timecreated?: number;
}

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number; // in minutes
  playtime_2weeks?: number;
  img_icon_url: string;
  has_community_visible_stats?: boolean;
  playtime_windows_forever?: number;
  playtime_mac_forever?: number;
  playtime_linux_forever?: number;
  rtime_last_played?: number;
}

// ============ Avatar Helpers ============

/**
 * Extract avatar hash from Steam avatar URL
 */
export function extractAvatarHash(avatarUrl: string): string {
  const match = avatarUrl.match(/avatars\.steamstatic\.com\/([a-fA-F0-9]+)/);
  return match ? match[1] : '';
}

/**
 * Build avatar URLs from hash
 */
export function buildAvatarUrls(hash: string) {
  const base = 'https://avatars.steamstatic.com';
  return {
    avatar: `${base}/${hash}.jpg`,
    avatarmedium: `${base}/${hash}_medium.jpg`,
    avatarfull: `${base}/${hash}_full.jpg`
  };
}

/**
 * Build profile URL from steamId
 */
export function buildProfileUrl(steamId: string): string {
  return `https://steamcommunity.com/profiles/${steamId}/`;
}

// ============ Steam API Calls ============

/**
 * Get player summary (profile info) directly from Steam API
 */
export async function fetchPlayerSummary(steamId: string): Promise<SteamPlayer | null> {
  const url = `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v2/?key=${getApiKey()}&steamids=${steamId}`;

  const response = await fetch(url);
  const data = (await response.json()) as { response: { players: SteamPlayer[] } };

  return data.response.players[0] || null;
}

/**
 * Get all owned games for a user directly from Steam API.
 * This is the single source of truth - includes playtime_2weeks for recent games.
 */
export async function fetchUserGames(steamId: string): Promise<SteamGame[]> {
  const params = new URLSearchParams({
    key: getApiKey(),
    steamid: steamId,
    include_appinfo: '1',
    include_played_free_games: '1'
  });

  const url = `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/?${params.toString()}`;

  const response = await fetch(url);
  const data = (await response.json()) as {
    response: { games?: SteamGame[]; game_count?: number };
  };

  const games = data.response.games || [];

  // Sort by total playtime (most played first)
  games.sort((a, b) => b.playtime_forever - a.playtime_forever);

  return games;
}

/**
 * Filter games to only those played in the last 2 weeks
 */
export function filterRecentGames(games: SteamGame[], limit?: number): SteamGame[] {
  const recentGames = games
    .filter(game => game.playtime_2weeks && game.playtime_2weeks > 0)
    .sort((a, b) => (b.playtime_2weeks || 0) - (a.playtime_2weeks || 0));

  return limit && limit > 0 ? recentGames.slice(0, limit) : recentGames;
}

// ============ Steam OpenID Authentication ============

/**
 * Build the Steam OpenID login URL
 */
export function buildSteamLoginUrl(returnUrl: string): string {
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnUrl,
    'openid.realm': new URL(returnUrl).origin,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
  });

  return `${STEAM_OPENID_URL}?${params.toString()}`;
}

/**
 * Verify the Steam OpenID response by making a check_authentication request
 */
export async function verifySteamResponse(query: Record<string, string>): Promise<boolean> {
  const params = new URLSearchParams();

  // Add all openid parameters
  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith('openid.')) {
      params.append(key, value);
    }
  }

  // Change mode to check_authentication
  params.set('openid.mode', 'check_authentication');

  try {
    const response = await fetch(STEAM_OPENID_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Language': 'en'
      },
      body: params.toString()
    });

    const text = await response.text();
    return text.includes('is_valid:true');
  } catch (error) {
    console.error('Steam verification error:', error);
    return false;
  }
}

/**
 * Extract Steam ID from the OpenID claimed_id
 * Format: https://steamcommunity.com/openid/id/76561198012345678
 */
export function extractSteamId(claimedId: string | undefined): string | null {
  if (!claimedId) return null;

  const match = claimedId.match(/\/id\/(\d+)$/);
  return match ? match[1] : null;
}
