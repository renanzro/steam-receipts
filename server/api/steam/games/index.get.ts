// Get user's games (all-time, sorted by playtime)
export default defineEventHandler(async event => {
  const steamId = getCookie(event, 'steam_session');

  if (!steamId) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const query = getQuery(event);
  const limit = query.limit ? Number(query.limit) : 0;

  try {
    // Try to get cached games first
    const cachedGames = await getCachedUserGames(steamId);

    if (cachedGames) {
      // Transform cached games to API format
      const games = cachedGames.map(g => ({
        appid: g.appId,
        name: g.name,
        playtime_forever: g.playtimeForever,
        playtime_2weeks: g.playtime2Weeks,
        img_icon_url: ''
      }));

      // Sort by playtime and apply limit
      games.sort((a, b) => b.playtime_forever - a.playtime_forever);
      return limit > 0 ? games.slice(0, limit) : games;
    }

    // Cache miss - fetch from Steam API
    const steamGames = await fetchUserGames(steamId);

    // Cache the games
    const gamesToCache = steamGames.map(g => ({
      appId: g.appid,
      name: g.name,
      playtimeForever: g.playtime_forever,
      playtime2Weeks: g.playtime_2weeks
    }));
    await cacheUserGames(steamId, gamesToCache);

    // Apply limit and return (already sorted by fetchUserGames)
    return limit > 0 ? steamGames.slice(0, limit) : steamGames;
  } catch (error) {
    console.error('Failed to fetch games:', error);
    throw createError({ statusCode: 500, message: 'Failed to fetch games' });
  }
});
