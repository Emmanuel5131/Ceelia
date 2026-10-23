import type { APIRoute, GetStaticPaths } from 'astro';
import { graphics, svgOf } from '../../lib/graphics/registry';

/** Static, cacheable SVG artwork. URLs are content-hashed via graphicSrc(), so long caching is safe. */
export const getStaticPaths: GetStaticPaths = () => Object.keys(graphics).map((name) => ({ params: { name } }));

export const GET: APIRoute = ({ params }) =>
  new Response(svgOf(params.name as string), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
