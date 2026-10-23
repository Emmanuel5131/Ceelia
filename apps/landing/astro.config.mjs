// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',
  trailingSlash: 'ignore',
  // CSS is small (~20 KB); inlining it removes the render-blocking round trips before first paint.
  build: { format: 'directory', inlineStylesheets: 'always' },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'monthly',
      lastmod: new Date(),
      priority: 0.7,
      serialize(item) {
        if (item.url === 'https://example.com/') item.priority = 1.0;
        return item;
      },
    }),
  ],
});
