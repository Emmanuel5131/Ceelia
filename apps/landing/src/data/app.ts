/**
 * Where the buttons on this site lead. Reporting a loss goes to the full-page sign in of the Celia app, which also offers "Create
 * account". Professional access goes to the app's join page, which shows the fee and starts the application, so it never lands on
 * the sign in. Set `PUBLIC_APP_URL` in production; locally it is the app's dev server.
 */
const base = (import.meta.env.PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/u, '');

export const appLogin = `${base}/sign-in`;
export const appJoin = `${base}/join`;
