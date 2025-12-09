// Get user's Steam profile
export default defineEventHandler(async event => {
  const config = useRuntimeConfig();
  const backendUrl = config.backendUrl;
  const steamId = getCookie(event, 'steam_session');

  if (!steamId) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  try {
    const profile = await $fetch(`${backendUrl}/steam/profile`, {
      headers: {
        'X-Steam-Id': steamId
      }
    });

    return profile;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    throw createError({ statusCode: 500, message: 'Failed to fetch profile' });
  }
});
