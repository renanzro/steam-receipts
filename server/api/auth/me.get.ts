// Check current session and get user data
export default defineEventHandler(async event => {
  const steamId = getCookie(event, 'steam_session');

  if (!steamId) {
    return { authenticated: false };
  }

  try {
    // Try to get cached user first
    const cachedUser = await getCachedUser(steamId);

    if (cachedUser) {
      // Build player object from cache
      const avatars = buildAvatarUrls(cachedUser.avatarHash);
      const player = {
        steamid: cachedUser.steamId,
        personaname: cachedUser.personaName,
        profileurl: buildProfileUrl(cachedUser.steamId),
        ...avatars
      };
      return { authenticated: true, player };
    }

    // Cache miss - fetch from Steam API
    const player = await fetchPlayerSummary(steamId);

    if (!player) {
      // Player not found, clear session
      deleteCookie(event, 'steam_session');
      return { authenticated: false };
    }

    // Cache the user
    const avatarHash = extractAvatarHash(player.avatar);
    await cacheUser(steamId, player.personaname, avatarHash);

    return { authenticated: true, player };
  } catch (error) {
    console.error('Failed to get user profile:', error);
    // Clear invalid session
    deleteCookie(event, 'steam_session');
    return { authenticated: false };
  }
});
