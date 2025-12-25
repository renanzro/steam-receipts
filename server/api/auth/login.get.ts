// Build Steam login URL and redirect user to Steam for authentication
export default defineEventHandler(async event => {
  try {
    // Build the callback URL for Steam to redirect back to
    const callbackUrl = getRequestURL(event).origin + '/api/auth/callback';

    // Build the Steam OpenID login URL directly
    const steamLoginUrl = buildSteamLoginUrl(callbackUrl);

    // Redirect user to Steam
    return sendRedirect(event, steamLoginUrl);
  } catch (error) {
    console.error('Failed to build Steam login URL:', error);
    return sendRedirect(event, '/?error=login_failed');
  }
});
