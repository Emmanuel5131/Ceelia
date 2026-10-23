/**
 * Where the buttons on this site lead: the full-page sign in of the Celia app, which also offers "Create account".
 * Set `PUBLIC_APP_URL` in production; locally it is the app's dev server.
 */
const base = (import.meta.env.PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/u, '');

export const appLogin = `${base}/sign-in`;
