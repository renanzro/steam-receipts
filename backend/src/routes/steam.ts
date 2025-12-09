import { Hono } from 'hono'
import { getOwnedGames, getPlayerSummary, getRecentlyPlayedGames } from '../lib/steam-api.js'
import { getCachedUser, getCachedUserGames, cacheUser, cacheUserGames } from '../db/queries.js'

type Variables = {
  steamId: string
}

const steam = new Hono<{ Variables: Variables }>()

// Middleware to check authentication via X-Steam-Id header (from Nuxt BFF)
steam.use('*', async (c, next) => {
  const steamId = c.req.header('X-Steam-Id')
  
  if (!steamId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  c.set('steamId', steamId)
  await next()
})

// Get user's owned games (sorted by playtime)
steam.get('/games', async (c) => {
  const steamId = c.get('steamId')
  const limit = Number(c.req.query('limit')) || 0
  
  try {
    // Try to get from cache first
    let games = await getCachedUserGames(steamId)
    
    if (!games) {
      // Cache miss - fetch from Steam API
      console.log(`Cache miss for games of user ${steamId}, fetching from Steam API`)
      games = await getOwnedGames(steamId)
      
      // Cache the results
      await cacheUserGames(steamId, games)
    } else {
      console.log(`Cache hit for games of user ${steamId}`)
    }
    
    // Sort by all-time playtime
    games = games.sort((a, b) => b.playtime_forever - a.playtime_forever)
    
    if (limit > 0) {
      games = games.slice(0, limit)
    }
    
    return c.json(games)
  } catch (error) {
    console.error('Error fetching games:', error)
    return c.json({ error: 'Failed to fetch games' }, 500)
  }
})

// Get recently played games
steam.get('/games/recent', async (c) => {
  const steamId = c.get('steamId')
  const limit = Number(c.req.query('limit')) || 0
  
  try {
    // For recent games, we still fetch from API since playtime_2weeks changes frequently
    // But we could cache with a shorter TTL if needed
    let games = await getRecentlyPlayedGames(steamId)
    
    // Sort by recent playtime
    games = games.sort((a, b) => (b.playtime_2weeks || 0) - (a.playtime_2weeks || 0))
    
    if (limit > 0) {
      games = games.slice(0, limit)
    }
    
    return c.json(games)
  } catch (error) {
    console.error('Error fetching recent games:', error)
    return c.json({ error: 'Failed to fetch recent games' }, 500)
  }
})

// Get player profile
steam.get('/profile', async (c) => {
  const steamId = c.get('steamId')
  
  try {
    // Try cache first
    let player = await getCachedUser(steamId)
    
    if (!player) {
      console.log(`Cache miss for profile of user ${steamId}, fetching from Steam API`)
      player = await getPlayerSummary(steamId)
      
      if (player) {
        await cacheUser(player)
      }
    } else {
      console.log(`Cache hit for profile of user ${steamId}`)
    }
    
    return c.json(player)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return c.json({ error: 'Failed to fetch profile' }, 500)
  }
})

export default steam
