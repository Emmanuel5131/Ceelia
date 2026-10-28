import { createAuthenticator } from './auth.ts';
import { loadConfig } from './config.ts';
import { createHttpServer } from './server.ts';

const config = loadConfig();

createHttpServer({
  authenticate: createAuthenticator(config.webUrl),
  publicUrl: config.publicUrl,
  authServerUrl: config.authServerUrl,
  webUrl: config.webUrl,
}).listen(config.port, () => {
  console.log(`Celia MCP listening on http://localhost:${config.port}/mcp (sign-in through ${config.authServerUrl})`);
});
