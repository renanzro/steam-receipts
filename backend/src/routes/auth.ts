import { Hono } from 'hono'
import { verifySteamResponse, extractSteamId, buildSteamLoginUrl } from '../lib/steam-auth.js'
import { getPlayerSummary } from '../lib/steam-api.js'
import { getCachedUser, cacheUser } from '../db/queries.js'

const auth = new Hono()

// NEW: Get Steam login URL (for BFF pattern - Nuxt server calls this)
auth.get('/steam/url', (c) => {
  const returnTo = c.req.query('returnTo')
  if (!returnTo) {
    return c.json({ error: 'returnTo parameter is required' }, 400)
  }
  
  const steamLoginUrl = buildSteamLoginUrl(returnTo)
  return c.json({ url: steamLoginUrl })
})

// NEW: Validate Steam OpenID response (for BFF pattern - Nuxt server calls this)
auth.post('/steam/validate', async (c) => {
  const query = await c.req.json()

  try {
    // Verify the Steam response
    const isValid = await verifySteamResponse(query)
    
    if (!isValid) {
      return c.json({ error: 'Invalid Steam response' }, 400)
    }

    // Extract Steam ID from the claimed_id
    const steamId = extractSteamId(query['openid.claimed_id'])
    
    if (!steamId) {
      return c.json({ error: 'No Steam ID found' }, 400)
    }

    // Fetch user profile
    const player = await getPlayerSummary(steamId)
    
    if (!player) {
      return c.json({ error: 'Player not found' }, 404)
    }

    // Cache user profile in database
    await cacheUser(player)

    // Return steamId and player to Nuxt (Nuxt will set its own cookie)
    return c.json({ steamId, player })
  } catch (error) {
    console.error('Steam validation error:', error)
    return c.json({ error: 'Validation failed' }, 500)
  }
})

// Legacy endpoints below - kept for backward compatibility but not used in BFF pattern

// Redirect user to Steam login (legacy - direct access)
auth.get('/steam', (c) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080'
  const returnUrl = `${frontendUrl}/api/auth/steam/callback`
  const steamLoginUrl = buildSteamLoginUrl(returnUrl)
  return c.redirect(steamLoginUrl)
})

// Handle Steam callback (legacy - direct access)
auth.get('/steam/callback', async (c) => {
  const query = c.req.query()
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080'

  try {
    // Verify the Steam response
    const isValid = await verifySteamResponse(query)
    
    if (!isValid) {
      return c.redirect(`${frontendUrl}?error=invalid_response`)
    }

    // Extract Steam ID from the claimed_id
    const steamId = extractSteamId(query['openid.claimed_id'])
    
    if (!steamId) {
      return c.redirect(`${frontendUrl}?error=no_steam_id`)
    }

    // Fetch user profile
    const player = await getPlayerSummary(steamId)
    
    if (!player) {
      return c.redirect(`${frontendUrl}?error=player_not_found`)
    }

    // Cache user profile in database
    await cacheUser(player)

    // Note: No longer setting cookies - handled by Nuxt BFF
    // Redirect back to frontend with steamId in query (insecure, legacy only)
    return c.redirect(`${frontendUrl}?login=success&steamId=${steamId}`)
  } catch (error) {
    console.error('Steam auth error:', error)
    return c.redirect(`${frontendUrl}?error=auth_failed`)
  }
})

// Check current session (legacy - not used in BFF)
auth.get('/me', async (c) => {
  const steamId = c.req.header('X-Steam-Id')
  
  if (!steamId) {
    return c.json({ authenticated: false }, 401)
  }

  // Try cache first, then Steam API
  let player = await getCachedUser(steamId)
  
  if (!player) {
    player = await getPlayerSummary(steamId)
    if (player) {
      await cacheUser(player)
    }
  }
  
  return c.json({ authenticated: true, player })
})

export default auth
