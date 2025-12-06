const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login'

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
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  })

  return `${STEAM_OPENID_URL}?${params.toString()}`
}

/**
 * Verify the Steam OpenID response by making a check_authentication request
 */
export async function verifySteamResponse(query: Record<string, string>): Promise<boolean> {
  // Build verification request
  const params = new URLSearchParams()
  
  for (const [key, value] of Object.entries(query)) {
    params.append(key, value)
  }
  
  // Change mode to check_authentication
  params.set('openid.mode', 'check_authentication')

  try {
    const response = await fetch(STEAM_OPENID_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const text = await response.text()
    return text.includes('is_valid:true')
  } catch (error) {
    console.error('Steam verification error:', error)
    return false
  }
}

/**
 * Extract Steam ID from the OpenID claimed_id
 * Format: https://steamcommunity.com/openid/id/76561198012345678
 */
export function extractSteamId(claimedId: string | undefined): string | null {
  if (!claimedId) return null
  
  const match = claimedId.match(/\/id\/(\d+)$/)
  return match ? match[1] : null
}
