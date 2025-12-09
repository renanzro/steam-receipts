// Get user's recently played games
export default defineEventHandler(async event => {
  const config = useRuntimeConfig();
  const backendUrl = config.backendUrl;
  const steamId = getCookie(event, 'steam_session');

  if (!steamId) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const query = getQuery(event);
  const limit = query.limit ? Number(query.limit) : 0;

  try {
    const games = await $fetch(`${backendUrl}/steam/games/recent`, {
      headers: {
        'X-Steam-Id': steamId
      },
      query: { limit }
    });

    return games;
  } catch (error) {
    console.error('Failed to fetch recent games:', error);
    throw createError({ statusCode: 500, message: 'Failed to fetch recent games' });
  }
});
