import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createHttpServer } from './server.ts';

const publicUrl = 'https://mcp.example.org/mcp';
const server = createHttpServer({
  authenticate: async () => null,
  publicUrl,
  authServerUrl: 'https://auth.example.org',
  webUrl: 'https://app.example.org',
});
let base = '';

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server.listen(0, resolve);
  });
  const address = server.address();

  base = typeof address === 'object' && address ? `http://localhost:${address.port}` : '';
});

afterAll(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

describe('MCP server', () => {
  it('answers a health check', async () => {
    const response = await fetch(`${base}/health`);

    expect(await response.json()).toStrictEqual({ ok: true });
  });

  it('names the sign-in server for assistants', async () => {
    const response = await fetch(`${base}/.well-known/oauth-protected-resource`);

    expect(await response.json()).toMatchObject({
      resource: publicUrl,
      authorization_servers: ['https://auth.example.org'],
    });
  });

  it('turns away a caller who is not signed in and says where to sign in', async () => {
    const response = await fetch(`${base}/mcp`, { method: 'POST', body: '{}' });

    expect(response.status).toBe(401);
    expect(response.headers.get('www-authenticate')).toContain('oauth-protected-resource');
  });

  it('only takes POST on the MCP path', async () => {
    const response = await fetch(`${base}/mcp`);

    expect(response.status).toBe(405);
  });
});
