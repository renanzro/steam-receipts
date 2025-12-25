// Get user's recently played games (filtered from all games cache)
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

      // Filter to only recent games and apply limit
      return filterRecentGames(games, limit);
    }

    // Cache miss - fetch from Steam API
    const steamGames = await fetchUserGames(steamId);

    // Cache ALL games (single source of truth)
    const gamesToCache = steamGames.map(g => ({
      appId: g.appid,
      name: g.name,
      playtimeForever: g.playtime_forever,
      playtime2Weeks: g.playtime_2weeks
    }));
    await cacheUserGames(steamId, gamesToCache);

    // Return only recent games
    return filterRecentGames(steamGames, limit);
  } catch (error) {
    console.error('Failed to fetch recent games:', error);
    throw createError({ statusCode: 500, message: 'Failed to fetch recent games' });
  }
});
