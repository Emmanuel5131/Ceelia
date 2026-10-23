import type { APIRoute } from 'astro';
import { site } from '../data/site';

/** AI answer engines are explicitly allowed so the product can be cited (GEO). */
const aiBots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'DuckAssistBot', 'MistralAI-User'];

export const GET: APIRoute = () =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /404/',
      '',
      '# AI search & answer engines are welcome to crawl and cite this site.',
      ...aiBots.flatMap((b) => [`User-agent: ${b}`, 'Allow: /', '']),
      `Sitemap: ${site.url}/sitemap-index.xml`,
      `# LLM-readable summary: ${site.url}/llms.txt`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
