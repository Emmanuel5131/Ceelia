/** Small helpers shared by every build-time SVG generator. */
export const f = (n: number, d = 2) => +n.toFixed(d);
export const circ = (x: number, y: number, r: number, d = 2) =>
  `M${f(x - r, d)} ${f(y, d)}a${f(r, d)} ${f(r, d)} 0 1 0 ${f(2 * r, d)} 0a${f(r, d)} ${f(r, d)} 0 1 0 ${f(-2 * r, d)} 0Z`;
export const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => [
  cx + r * Math.cos((deg * Math.PI) / 180),
  cy + r * Math.sin((deg * Math.PI) / 180),
];
export const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  return `M${f(x0)} ${f(y0)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${f(x1)} ${f(y1)}`;
};
export const norm = (v: number[]) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
/** Deterministic PRNG so builds are reproducible. */
export const prng = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
export const svgDoc = (w: number, h: number, body: string, opts: { bg?: string; title?: string } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">${opts.title ? `<title>${opts.title}</title>` : ''}${opts.bg ? `<rect width="${w}" height="${h}" fill="${opts.bg}"/>` : ''}${body}</svg>`;
