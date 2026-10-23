/**
 * Compact "ci" mark (the c, the i stem and the red square) lifted from the Celia wordmark (src/lib/logoPaths.mjs)
 * and normalised to a 100x100 box. diag + leg are the white strokes, arm is the accent square.
 * Shared by the favicon and the site loader.
 */
import { markPaths as paths, logoAccent } from './logoPaths.mjs';

export const MARK_ACCENT = logoAccent;
export const markPaths = paths;

/** Standalone SVG string. bg = null for a transparent mark; pad = share of the box left empty on each side. */
export function markSvg({ bg = '#0F1B2D', fg = '#fff', accent = MARK_ACCENT, pad = 0.12, size } = {}) {
  const v = +(100 / (1 - pad * 2)).toFixed(3), o = +(-(v - 100) / 2).toFixed(3);
  const dims = size ? ` width="${size}" height="${size}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${o} ${o} ${v} ${v}"${dims}>` +
    (bg ? `<rect x="${o}" y="${o}" width="${v}" height="${v}" fill="${bg}"/>` : '') +
    `<path fill="${fg}" d="${markPaths.diag} ${markPaths.leg}"/><path fill="${accent}" d="${markPaths.arm}"/></svg>`;
}
