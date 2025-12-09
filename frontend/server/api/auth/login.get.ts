// Server-to-server: Get Steam login URL from backend and redirect user
export default defineEventHandler(async event => {
  const config = useRuntimeConfig();
  const backendUrl = config.backendUrl;

  try {
    // Get the Steam login URL from backend
    // The backend will construct the OpenID URL with the correct return_to
    const response = await $fetch<{ url: string }>(`${backendUrl}/auth/steam/url`, {
      method: 'GET',
      query: {
        // Tell backend to redirect back to our Nuxt callback
        returnTo: getRequestURL(event).origin + '/api/auth/callback'
      }
    });

    // Redirect user to Steam
    return sendRedirect(event, response.url);
  } catch (error) {
    console.error('Failed to get Steam login URL:', error);
    return sendRedirect(event, '/?error=login_failed');
  }
});
