import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { verifySteamResponse, extractSteamId, buildSteamLoginUrl } from '../lib/steam-auth.js'
import { getPlayerSummary } from '../lib/steam-api.js'
import { getCachedUser, cacheUser } from '../db/queries.js'

const useHttps = process.env.USE_HTTPS === 'true'

const auth = new Hono()

// Redirect user to Steam login
auth.get('/steam', (c) => {
  const returnUrl = `${!useHttps ? 'http' : 'https'}://${c.req.header('host')}/auth/steam/callback`
  const steamLoginUrl = buildSteamLoginUrl(returnUrl)
  return c.redirect(steamLoginUrl)
})

// Handle Steam callback
auth.get('/steam/callback', async (c) => {
  const query = c.req.query()
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080'

  console.log('Steam callback received, query params:', Object.keys(query))

  try {
    // Verify the Steam response
    const isValid = await verifySteamResponse(query)
    console.log('Steam verification result:', isValid)
    
    if (!isValid) {
      return c.redirect(`${frontendUrl}?error=invalid_response`)
    }

    // Extract Steam ID from the claimed_id
    const steamId = extractSteamId(query['openid.claimed_id'])
    console.log('Extracted Steam ID:', steamId)
    
    if (!steamId) {
      return c.redirect(`${frontendUrl}?error=no_steam_id`)
    }

    // Fetch user profile
    const player = await getPlayerSummary(steamId)
    console.log('Player data:', player?.personaname || 'not found')
    
    if (!player) {
      return c.redirect(`${frontendUrl}?error=player_not_found`)
    }

    // Cache user profile in database
    await cacheUser(player)

    // Set session cookie (simple approach - you could use JWT instead)
    setCookie(c, 'steam_id', steamId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    // Redirect back to frontend with success
    return c.redirect(`${frontendUrl}?login=success`)
  } catch (error) {
    console.error('Steam auth error:', error)
    return c.redirect(`${frontendUrl}?error=auth_failed`)
  }
})

// Check current session
auth.get('/me', async (c) => {
  const steamId = getCookie(c, 'steam_id')
  
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

// Logout
auth.post('/logout', (c) => {
  setCookie(c, 'steam_id', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 0,
    path: '/',
  })
  return c.json({ success: true })
})

export default auth
