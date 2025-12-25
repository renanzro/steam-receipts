// Get user's Steam profile
export default defineEventHandler(async event => {
  const steamId = getCookie(event, 'steam_session');

  if (!steamId) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  try {
    // Try to get cached user first
    const cachedUser = await getCachedUser(steamId);

    if (cachedUser) {
      // Build player object from cache
      const avatars = buildAvatarUrls(cachedUser.avatarHash);
      return {
        steamid: cachedUser.steamId,
        personaname: cachedUser.personaName,
        profileurl: buildProfileUrl(cachedUser.steamId),
        ...avatars
      };
    }

    // Cache miss - fetch from Steam API
    const player = await fetchPlayerSummary(steamId);

    if (!player) {
      throw createError({ statusCode: 404, message: 'Player not found' });
    }

    // Cache the user
    const avatarHash = extractAvatarHash(player.avatar);
    await cacheUser(steamId, player.personaname, avatarHash);

    return player;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    throw createError({ statusCode: 500, message: 'Failed to fetch profile' });
  }
});
