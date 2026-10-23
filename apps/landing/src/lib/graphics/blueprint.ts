/** Shared "blueprint / devtools" drawing kit: mono labels, grids, marks, dimensions, isometric planes. */
import { f } from './svg';

export type Art = (W: number, H: number, c: string) => string;
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
/** Monospace label. */
export const T = (x: number, y: number, s: string, c: string, size = 9, op = 0.9, anchor = 'start', weight = 400) =>
  `<text x="${f(x)}" y="${f(y)}" font-family="IBM Plex Mono, monospace" font-size="${f(size * 1.1)}" font-weight="${weight}" fill="${c}" fill-opacity="${op}" text-anchor="${anchor}" xml:space="preserve">${esc(s)}</text>`;
/** Background colour of the surface the art sits on (cream by default, set via --art-bg on dark tiles). */
export const BG = 'style="fill:var(--art-bg,#F5F2EA)"';
export const onC = (c: string) => (c === '#fff' ? '#0F1B2D' : '#fff');
/**
 * Blueprint grid. It deliberately runs far past the art box (aligned to the same step), because an SVG paints
 * outside its viewBox wherever the element is wider or taller than the art (letterboxing). The grid then reaches
 * every edge of any tile it sits in and reads as infinite; the tile's CSS mask fades it out.
 */
export const grid = (W: number, H: number, c: string, step = 16, op = 0.07) => {
  const ext = Math.ceil(Math.max(W, H, 480) / step) * step, x0 = -ext, x1 = W + ext, y0 = -ext, y1 = H + ext;
  let d = ''; for (let x = x0; x <= x1; x += step) d += `M${f(x)} ${f(y0)}V${f(y1)}`; for (let y = y0; y <= y1; y += step) d += `M${f(x0)} ${f(y)}H${f(x1)}`;
  return `<path class="bp-grid" d="${d}" stroke="${c}" stroke-opacity="${op}" stroke-width=".5"/>`;
};
export const cross = (x: number, y: number, c: string, s = 6) => `<path d="M${f(x - s)} ${f(y)}H${f(x + s)}M${f(x)} ${f(y - s)}V${f(y + s)}" stroke="${c}" stroke-opacity=".6"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(s * 0.45)}" stroke="${c}" stroke-opacity=".6"/>`;
export const corners = (W: number, H: number, c: string, m = 14, s = 5) => [[m, m], [W - m, m], [m, H - m], [W - m, H - m]].map(([x, y]) => cross(x, y, c, s)).join('');
export const dimH = (x1: number, x2: number, y: number, label: string, c: string, k = 1) =>
  `<path d="M${f(x1)} ${f(y)}H${f(x2)}M${f(x1)} ${f(y - 3 * k)}V${f(y + 3 * k)}M${f(x2)} ${f(y - 3 * k)}V${f(y + 3 * k)}" stroke="${c}" stroke-opacity=".7"/>` +
  `<rect x="${f((x1 + x2) / 2 - label.length * 3.2 * k - 3 * k)}" y="${f(y - 6 * k)}" width="${f(label.length * 6.4 * k + 6 * k)}" height="${f(12 * k)}" ${BG}/>` + T((x1 + x2) / 2, y + 3.2 * k, label, c, 8 * k, 0.95, 'middle');
export const dimV = (y1: number, y2: number, x: number, label: string, c: string, k = 1) =>
  `<path d="M${f(x)} ${f(y1)}V${f(y2)}M${f(x - 3 * k)} ${f(y1)}H${f(x + 3 * k)}M${f(x - 3 * k)} ${f(y2)}H${f(x + 3 * k)}" stroke="${c}" stroke-opacity=".7"/>` +
  `<g transform="rotate(-90 ${f(x)} ${f((y1 + y2) / 2)})"><rect x="${f(x - label.length * 3.2 * k - 3 * k)}" y="${f((y1 + y2) / 2 - 6 * k)}" width="${f(label.length * 6.4 * k + 6 * k)}" height="${f(12 * k)}" ${BG}/>${T(x, (y1 + y2) / 2 + 3.2 * k, label, c, 8 * k, 0.95, 'middle')}</g>`;
/** CV-style detection box: dashed outline, corner brackets, label tag sitting INSIDE the top edge. */
export const detect = (x: number, y: number, w: number, h: number, label: string, c: string, k = 1) => {
  const t = 6 * k;
  return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" stroke="${c}" stroke-dasharray="${f(3 * k)} ${f(2 * k)}" stroke-opacity=".85"/>` +
    `<path d="M${f(x)} ${f(y + t)}V${f(y)}H${f(x + t)}M${f(x + w - t)} ${f(y)}H${f(x + w)}V${f(y + t)}M${f(x + w)} ${f(y + h - t)}V${f(y + h)}H${f(x + w - t)}M${f(x + t)} ${f(y + h)}H${f(x)}V${f(y + h - t)}" stroke="${c}" stroke-width="${f(1.6 * k)}"/>` +
    `<rect x="${f(x + w - label.length * 5.9 * k - 8 * k)}" y="${f(y)}" width="${f(label.length * 5.9 * k + 8 * k)}" height="${f(12 * k)}" fill="${c}"/>` + T(x + w - 4 * k, y + 8.8 * k, label, onC(c), 7.6 * k, 1, 'end');
};
export const handles = (x: number, y: number, w: number, h: number, c: string, k = 1) =>
  [[x, y], [x + w / 2, y], [x + w, y], [x + w, y + h / 2], [x + w, y + h], [x + w / 2, y + h], [x, y + h], [x, y + h / 2]]
    .map(([a, b]) => `<rect x="${f(a - 2.5 * k)}" y="${f(b - 2.5 * k)}" width="${f(5 * k)}" height="${f(5 * k)}" ${BG} stroke="${c}"/>`).join('');
/** Ad-layout wireframe in local coordinates. */
export const layout = (x: number, y: number, w: number, h: number, c: string, ns = '') =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" stroke="${c}" stroke-width="1.2"${ns}/>` +
  `<path d="M${f(x + w * 0.1)} ${f(y + h * 0.1)}L${f(x + w * 0.9)} ${f(y + h * 0.58)}M${f(x + w * 0.9)} ${f(y + h * 0.1)}L${f(x + w * 0.1)} ${f(y + h * 0.58)}" stroke="${c}" stroke-opacity=".3"${ns}/><rect x="${f(x + w * 0.1)}" y="${f(y + h * 0.1)}" width="${f(w * 0.8)}" height="${f(h * 0.48)}" stroke="${c}" stroke-opacity=".5"${ns}/>` +
  `<rect x="${f(x + w * 0.1)}" y="${f(y + h * 0.66)}" width="${f(w * 0.62)}" height="${f(Math.max(2, h * 0.05))}" fill="${c}"/><rect x="${f(x + w * 0.1)}" y="${f(y + h * 0.75)}" width="${f(w * 0.4)}" height="${f(Math.max(1.5, h * 0.035))}" fill="${c}" fill-opacity=".5"/>` +
  `<rect x="${f(x + w * 0.1)}" y="${f(y + h * 0.84)}" width="${f(w * 0.26)}" height="${f(Math.max(4, h * 0.08))}" stroke="${c}"${ns}/>`;

/* ------------------------------------------------------------ isometric (30°) */
export const C30 = Math.cos(Math.PI / 6), S30 = 0.5;
export type Pt = [number, number];
/** Screen point for iso coordinates (x → right-down, y → left-down, z → up) from origin O at scale s. */
export const iso = (O: Pt, s: number, x: number, y: number, z = 0): Pt => [O[0] + (x - y) * C30 * s, O[1] + (x + y) * S30 * s - z * s];
/** SVG transform that maps a local (u, v) drawing onto an iso plane. */
export const planeTop = (O: Pt, s: number, z = 0) => `matrix(${f(C30 * s, 4)} ${f(S30 * s, 4)} ${f(-C30 * s, 4)} ${f(S30 * s, 4)} ${f(O[0])} ${f(O[1] - z * s)})`;
/** Face on the y = d plane (u along x, v downward along z) — the left-front face of a box. */
export const planeLeft = (O: Pt, s: number, d: number, h: number) => { const [ex, ey] = iso(O, s, 0, d, h); return `matrix(${f(C30 * s, 4)} ${f(S30 * s, 4)} 0 ${f(s, 4)} ${f(ex)} ${f(ey)})`; };
/** Face on the x = w plane (u along y, v downward along z) — the right-front face of a box. */
export const planeRight = (O: Pt, s: number, w: number, h: number) => { const [ex, ey] = iso(O, s, w, 0, h); return `matrix(${f(-C30 * s, 4)} ${f(S30 * s, 4)} 0 ${f(s, 4)} ${f(ex)} ${f(ey)})`; };
export const NS = ' vector-effect="non-scaling-stroke"';

/* ------------------------------------------------------------ motion hooks (see src/scripts/artMotion.ts) */
/** Add a motion class (and optional choreography beat) to the FIRST element of an SVG string. */
export const hook = (svg: string, cls: string, o?: number) =>
  svg.replace(/^<([a-zA-Z]+)([^>]*?)(\/?>)/, (_m, tag: string, attrs: string, end: string) => {
    const oa = o !== undefined ? ` data-o="${o}"` : '';
    return /\sclass="/.test(attrs) ? `<${tag}${attrs.replace(/\sclass="([^"]*)"/, ` class="$1 ${cls}"`)}${oa}${end}` : `<${tag} class="${cls}"${oa}${attrs}${end}`;
  });
/** Wrap SVG in a group carrying a motion class (+ beat). */
export const grp = (svg: string, cls: string, o?: number, extra = '') => `<g class="${cls}"${o !== undefined ? ` data-o="${o}"` : ''}${extra}>${svg}</g>`;
/** Tag EVERY primitive in an SVG string (use only on strings whose elements have no class yet). */
export const every = (svg: string, cls: string, o?: number) =>
  svg.replace(/<(rect|path|circle|ellipse|line|polyline|text)(\s)/g, `<$1 class="${cls}"${o !== undefined ? ` data-o="${o}"` : ''}$2`);
