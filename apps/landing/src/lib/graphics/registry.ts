/**
 * Registry of build-time SVG graphics served from /graphics/<name>.svg.
 * graphicSrc() appends a content hash (?v=…) so any change to a generator busts browser caches.
 */
import { createHash } from 'node:crypto';
import { svgDoc } from './svg';
import { caseArts } from './celiaArt';
import { serviceArts } from './celiaTiles';
import type { ServiceArt } from '../../data/home';

export const graphics: Record<string, () => string> = {
};
// Case-study cards (524x264): one illustration per finding, see celiaArt.ts
for (const [id, art] of Object.entries(caseArts)) graphics[`case-${id}`] = () => svgDoc(524, 264, art(524, 264, '#0F1B2D'), { bg: '#F5F2EA', title: `${id} finding illustration` });

/** Services-section art: one wide tile per service, on cream. The blueprint grid is left out (the tile draws its own masked
 *  grid) and the surface colour is baked in, so the cached file looks right even before it is inlined. */
export const serviceArtSize = () => ({ W: 640, H: 340 });
for (const art of Object.keys(serviceArts) as ServiceArt[]) {
  const { W, H } = serviceArtSize();
  graphics[`service-${art}`] = () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W + 16}" height="${H + 12}" viewBox="-8 -6 ${W + 16} ${H + 12}" fill="none">` +
    serviceArts[art](W, H, '#0F1B2D').replace(/<path class="bp-grid"[^>]*\/>/, '').replaceAll('var(--art-bg,#F5F2EA)', '#F5F2EA') + '</svg>';
}

const memo = new Map<string, string>();
export const svgOf = (name: string) => { if (!memo.has(name)) memo.set(name, graphics[name]()); return memo.get(name)!; };
export const graphicSrc = (name: string) => `/graphics/${name}.svg?v=${createHash('sha1').update(svgOf(name)).digest('hex').slice(0, 10)}`;
