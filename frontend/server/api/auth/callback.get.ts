// Handle Steam OpenID callback - forward to backend for validation
export default defineEventHandler(async event => {
  const config = useRuntimeConfig();
  const backendUrl = config.backendUrl;
  const query = getQuery(event);

  // Convert query to plain object (getQuery returns a proxy)
  const queryParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') {
      queryParams[key] = value;
    }
  }

  try {
    // Forward the OpenID params to backend for validation
    const response = await $fetch<{ steamId: string; player: any }>(
      `${backendUrl}/auth/steam/validate`,
      {
        method: 'POST',
        body: queryParams
      }
    );

    if (!response.steamId) {
      return sendRedirect(event, '/?error=invalid_response');
    }

    // Set HttpOnly cookie on Nuxt domain with the steamId
    // In production, you might want to use a signed session token instead
    setCookie(event, 'steam_session', response.steamId, {
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
