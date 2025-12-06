const STEAM_API_BASE = 'https://api.steampowered.com'

function getApiKey(): string {
  const key = process.env.STEAM_API_KEY
  if (!key) {
    throw new Error('STEAM_API_KEY environment variable is not set')
  }
  return key
}

export interface SteamPlayer {
  steamid: string
  personaname: string
  profileurl: string
  avatar: string
  avatarmedium: string
  avatarfull: string
  personastate: number
  timecreated?: number
}

export interface SteamGame {
  appid: number
  name: string
  playtime_forever: number // in minutes
  playtime_2weeks?: number
  img_icon_url: string
  has_community_visible_stats?: boolean
  playtime_windows_forever?: number
  playtime_mac_forever?: number
  playtime_linux_forever?: number
  rtime_last_played?: number
}

/**
 * Get player summary (profile info)
 */
export async function getPlayerSummary(steamId: string): Promise<SteamPlayer | null> {
  const url = `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v2/?key=${getApiKey()}&steamids=${steamId}`
  
  const response = await fetch(url)
  const data = await response.json() as { response: { players: SteamPlayer[] } }
  
  return data.response.players[0] || null
}

/**
 * Get all owned games for a user
 */
export async function getOwnedGames(steamId: string): Promise<SteamGame[]> {
  const params = new URLSearchParams({
    key: getApiKey(),
    steamid: steamId,
    include_appinfo: '1',
    include_played_free_games: '1',
  })
  
  const url = `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/?${params.toString()}`
  
  const response = await fetch(url)
  const data = await response.json() as { response: { games?: SteamGame[], game_count?: number } }
  
  return data.response.games || []
}

/**
 * Get recently played games (last 2 weeks)
 */
export async function getRecentlyPlayedGames(steamId: string): Promise<SteamGame[]> {
  const params = new URLSearchParams({
    key: getApiKey(),
    steamid: steamId,
  })
  
  const url = `${STEAM_API_BASE}/IPlayerService/GetRecentlyPlayedGames/v1/?${params.toString()}`
  
  const response = await fetch(url)
  const data = await response.json() as { response: { games?: SteamGame[], total_count?: number } }
  
  return data.response.games || []
}
