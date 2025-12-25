// Handle Steam OpenID callback - validate directly with Steam
export default defineEventHandler(async event => {
  const query = getQuery(event);

  // Convert query to plain object (getQuery returns a proxy)
  const queryParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') {
      queryParams[key] = value;
    }
  }

  try {
    // Verify the OpenID response directly with Steam
    const isValid = await verifySteamResponse(queryParams);

    if (!isValid) {
      console.error('Steam OpenID verification failed');
      return sendRedirect(event, '/?error=verification_failed');
    }

    // Extract Steam ID from the claimed_id
    const steamId = extractSteamId(queryParams['openid.claimed_id']);

    if (!steamId) {
      console.error('Could not extract Steam ID from response');
      return sendRedirect(event, '/?error=invalid_response');
    }

    // Fetch and cache the user's profile
    const player = await fetchPlayerSummary(steamId);

    if (player) {
      // Cache user in Firebase
      const avatarHash = extractAvatarHash(player.avatar);
      await cacheUser(steamId, player.personaname, avatarHash);
    }

    // Set HttpOnly cookie on Nuxt domain with the steamId
    setCookie(event, 'steam_session', steamId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    // Redirect to app
    return sendRedirect(event, '/?login=success');
  } catch (error) {
    console.error('Steam callback validation error:', error);
    return sendRedirect(event, '/?error=auth_failed');
  }
});
