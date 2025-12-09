// Logout - clear the session cookie
export default defineEventHandler(async event => {
  deleteCookie(event, 'steam_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  return { success: true };
});
