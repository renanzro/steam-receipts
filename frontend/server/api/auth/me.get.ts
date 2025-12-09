// Check current session and get user data
export default defineEventHandler(async event => {
  const config = useRuntimeConfig();
  const backendUrl = config.backendUrl;
  const steamId = getCookie(event, 'steam_session');

  if (!steamId) {
    return { authenticated: false };
  }

  try {
    // Get user profile from backend
    const player = await $fetch(`${backendUrl}/steam/profile`, {
      headers: {
        'X-Steam-Id': steamId
      }
    });

    return { authenticated: true, player };
  } catch (error) {
    console.error('Failed to get user profile:', error);
    // Clear invalid session
    deleteCookie(event, 'steam_session');
    return { authenticated: false };
  }
});
