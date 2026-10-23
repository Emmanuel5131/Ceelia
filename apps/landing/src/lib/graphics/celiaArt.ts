/**
 * Celia case-study illustrations, drawn in the shared blueprint style (see blueprint.ts): hairline strokes, mono labels,
 * isometric planes. One function per finding of the anonymized Protocol P / App A investigation:
 *   users          evidence stack: five plates, from the funding trail up to the verdict (hover explodes the stack)
 *   volume         order ledger wired into two blocks: headline volume vs settled volume (the 23% gap in red)
 *   wash           three plates: circularity, timing and funding trail, with nothing found
 *   concentration  counterparty columns: one takes 88% of the fills
 * Motion hooks (a-d, a-t, a-p, a-f, a-layer, a-flow, a-scan) are driven by src/scripts/artMotion.ts.
 */
import { f } from './svg';
import { T, BG, grid, corners, dimV, onC, iso, planeTop, planeLeft, planeRight, NS, hook, grp, every, type Art, type Pt } from './blueprint';

/** Seal red: used only for verdicts and the gap a finding points at. */
const SEAL = '#991F38';

/* ---------------------------------------------------------------- shared */
type Plate = { name: string; sub: string; body: string };
/** Local-coordinate drawing of one plate: outline first, content on top. */
const plateBox = (w: number, h: number, c: string, body: string) => `<rect width="${w}" height="${h}" ${BG} stroke="${c}" stroke-width="1.3"${NS}/>${body}`;
/** Small filled / dashed / hollow marker square used inside plates. */
const sq = (x: number, y: number, n: number, c: string, kind: 'fill' | 'hollow' | 'dash' = 'fill') =>
  `<rect x="${f(x)}" y="${f(y)}" width="${n}" height="${n}" ${kind === 'fill' ? `fill="${c}"` : `${BG} stroke="${c}"${kind === 'dash' ? ' stroke-dasharray="2 1.5"' : ''}${NS}`}/>`;

/**
 * Exploded isometric stack shared by the plate-based cards: `plates` run bottom → top, each with its own leader and
 * label. A plate, its leader and its label move together (drop-in intro, spread on hover); dashed guides run through
 * the plate corners and carry data packets upward.
 */
const stack = (W: number, c: string, plates: Plate[], size: [number, number], o: { s: number; cx: number; top: number; gap: number; lx: number }) => {
  const k = W / 524, [pw, ph] = size, { s, cx, top, gap, lx } = o, n = plates.length;
  const O = (i: number): Pt => [cx, top + (n - 1 - i) * gap];
  let out = '';
  const [tb, bb] = [O(n - 1), O(0)];
  for (const [u, v] of [[0, 0], [pw, 0], [0, ph], [pw, ph]]) {
    const [x1, y1] = iso(tb, s, u, v), [, y2] = iso(bb, s, u, v);
    out += `<g class="a-guide" data-gap="${f(gap)}"><path class="a-d a-flow" d="M${f(x1)} ${f(y2)}V${f(y1)}" stroke="${c}" stroke-opacity=".3" stroke-dasharray="${f(2 * k)} ${f(3 * k)}"/></g>`;
  }
  plates.forEach((p, i) => {
    const [rx, ry] = iso(O(i), s, pw, 0);
    const leader = `<path d="M${f(rx + 4 * k)} ${f(ry)}H${f(lx - 8 * k)}" stroke="${c}" stroke-opacity=".5"/><circle cx="${f(rx + 4 * k)}" cy="${f(ry)}" r="${f(2 * k)}" fill="${c}"/>`;
    const label = T(lx, ry - 1 * k, p.name, c, 8.2 * k, 1, 'start', 500) + T(lx, ry + 9.5 * k, p.sub, c, 6.8 * k, 0.65);
    out += `<g class="a-layer" data-i="${i}"><g transform="${planeTop(O(i), s)}">${plateBox(pw, ph, c, p.body)}</g>${leader}${label}</g>`;
  });
  return out;
};
const frame = (W: number, H: number, c: string) => {
  const k = W / 524;
  return grid(W, H, c, 16 * k, 0.05) + corners(W, H, c, 14 * k, 5 * k);
};

/* ---------------------------------------------------------------- 1 · users */
/** Evidence stack for the user-growth claim: funding trail → signatures → cohort → claim → verdict. */
export const usersSignature: Art = (W, H, c) => {
  const k = W / 524, P = 150;
  let out = frame(W, H, c);
  // funding trail: one funder at the centre, wallets on the ring, almost all of them seeded by it
  let funding = `<circle cx="75" cy="75" r="52" stroke="${c}" stroke-opacity=".25" stroke-dasharray="2 3"${NS}/>`;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2, x = 75 + Math.cos(a) * 52, y = 75 + Math.sin(a) * 52;
    funding += `<path d="M75 75L${f(x)} ${f(y)}" stroke="${c}" stroke-opacity="${i === 7 ? 0.35 : 0.8}"${i === 7 ? ' stroke-dasharray="2 2"' : ''}${NS}/>${sq(x - 4, y - 4, 8, c, i === 7 ? 'hollow' : 'fill')}`;
  }
  funding += `<circle cx="75" cy="75" r="9" fill="${c}"/><circle cx="75" cy="75" r="14" stroke="${c}"${NS}/>`;
  // the plates above hide everything but a 48-unit strip along the front edges, so the middle plates keep their content there
  // signatures: one row per half, a single wallet has ever signed a transaction itself
  let sig = '';
  for (let r = 0; r < 2; r++) for (let q = 0; q < 10; q++) sig += sq(14 + q * 12.6, 108 + r * 18, 9, c, r === 1 && q === 3 ? 'fill' : 'hollow');
  // cohort: spike wallets against the baseline
  const cohort = `<rect x="14" y="106" width="122" height="14" ${BG} stroke="${c}"${NS}/><rect x="14" y="106" width="${f(122 * 0.79)}" height="14" fill="${c}"/>` + T(20, 116, '79% spike', onC(c), 6.8, 1, 'start', 500) +
    `<rect x="14" y="126" width="122" height="14" ${BG} stroke="${c}"${NS}/><rect x="14" y="126" width="${f(122 * 0.11)}" height="14" fill="${c}" fill-opacity=".35"/>` + T(32, 136, '11% baseline', c, 6.8, 1, 'start', 500);
  // claim: the headline number
  const claim = T(14, 128, '~2,700', c, 17, 1, 'start', 500) + T(92, 120, 'new users', c, 7.2, 0.85) + T(92, 131, 'in two months', c, 7.2, 0.85) + `<path d="M14 140H136" stroke="${c}" stroke-opacity=".4"${NS}/>`;
  // verdict: what is proven and what is not (the top plate is fully visible)
  const verdict = sq(14, 16, 10, c, 'fill') + `<path d="M17 21l2.4 2.6 4.6-5.4" stroke="${onC(c)}" stroke-width="1.4"${NS}/>` + T(32, 25, 'proven', c, 8.2, 1, 'start', 500) + T(32, 38, 'not independent wallets', c, 6.8, 0.85) +
    sq(14, 56, 10, c, 'dash') + T(19, 64, '?', c, 8, 1, 'middle', 600) + T(32, 64, 'not proven', c, 8.2, 1, 'start', 500) + T(32, 77, 'customers behind them', c, 6.8, 0.85) +
    `<rect x="14" y="98" width="122" height="26" fill="${SEAL}" fill-opacity=".12" stroke="${SEAL}"${NS}/>` + T(75, 109, 'consistent with', SEAL, 6.6, 1, 'middle', 500) + T(75, 119, 'operator-managed wallets', SEAL, 6.6, 1, 'middle', 500);
  const plates: Plate[] = [
    { name: 'funding trail', sub: 'one funder · 90% of users', body: funding },
    { name: 'signatures', sub: '99% never self-signed', body: sig },
    { name: 'cohort', sub: '79% single-purpose vs 11%', body: cohort },
    { name: 'claim', sub: '~2,700 new users', body: claim },
    { name: 'verdict', sub: 'proven / not proven', body: verdict },
  ];
  out += stack(W, c, plates, [P, P], { s: 0.6 * k, cx: W * 0.34, top: 42 * k, gap: 29 * k, lx: W * 0.66 });
  out += hook(T(W - 22 * k, 30 * k, '// 5 tests · thresholds fixed first', c, 7.6 * k, 0.75, 'end'), 'a-t', 3) + hook(T(W - 22 * k, H - 22 * k, 'indicates · not proven off-chain', c, 7.2 * k, 0.65, 'end'), 'a-t', 4);
  return out;
};

/* ---------------------------------------------------------------- 2 · volume */
type Block = { O: Pt; w: number; d: number; h: number; name: string };
/** Isometric block with a stripe every 10 volume units on its two visible faces. */
const block = (b: Block, s: number, c: string) => {
  const stripes = (span: number) => { let d = ''; for (let z = 10; z < b.h; z += 10) d += `M0 ${z}H${span}`; return d; };
  const face = (span: number, op: number) => `<rect width="${span}" height="${b.h}" fill="${c}" fill-opacity="${op}"${NS} stroke="${c}" stroke-width="1.2"/><path d="${stripes(span)}" stroke="${c}" stroke-opacity=".35"${NS}/>`;
  const [tx, ty] = iso(b.O, s, b.w / 2, b.d / 2, b.h);
  return `<g transform="${planeLeft(b.O, s, b.d, b.h)}">${face(b.w, 0.05)}</g><g transform="${planeRight(b.O, s, b.w, b.h)}">${face(b.d, 0.12)}</g>` +
    `<g transform="${planeTop(b.O, s, b.h)}"><rect width="${b.w}" height="${b.d}" ${BG} stroke="${c}" stroke-width="1.2"${NS}/></g>` +
    (b.name ? T(tx, ty - (b.w + b.d) * 0.25 * s - 8 * s, b.name, c, 7.5 * s, 0.9, 'middle', 500) : '');
};
/** Order ledger on the left; settled orders feed the settled block, refunded and re-sent ones inflate the headline block. */
export const volumeSignature: Art = (W, H, c) => {
  const k = W / 524, s = 1 * k;
  let out = frame(W, H, c);
  const px = 26 * k, py = 36 * k, pw = 214 * k, rowH = 24 * k;
  const rows: [string, string, string, 'ok' | 'refund' | 'dup'][] = [
    ['#4401', 'order · settled', '2,500.00', 'ok'], ['#4402', 'order · settled', '1,800.00', 'ok'], ['#4403', 'order · refunded', '2,500.00', 'refund'],
    ['#4403', 'refund · re-sent', '2,500.00', 'dup'], ['#4404', 'order · settled', '1,200.00', 'ok'], ['#4405', 'order · settled', '2,500.00', 'ok'],
  ];
  out += every(`<rect x="${f(px)}" y="${f(py)}" width="${f(pw)}" height="${f(30 * k + rows.length * rowH)}" ${BG} stroke="${c}"/><path d="M${f(px)} ${f(py + 20 * k)}H${f(px + pw)}" stroke="${c}" stroke-opacity=".5"/>`, 'a-d', 0);
  out += every(T(px + 8 * k, py + 13.5 * k, 'order_ledger', c, 7.6 * k, 1, 'start', 500) + T(px + pw - 8 * k, py + 13.5 * k, 'on-chain', c, 7 * k, 0.7, 'end'), 'a-t', 0);
  // blocks: headline is 23% taller than settled
  const HB: Block = { O: [420 * k, 126 * k], w: 46, d: 40, h: 100, name: 'headline' };
  const SB: Block = { O: [322 * k, 176 * k], w: 40, d: 36, h: 77, name: 'settled' };
  out += grp(`<g transform="${planeTop([330 * k, 140 * k], s)}"><rect x="-30" y="-6" width="190" height="110" stroke="${c}" stroke-opacity=".2" stroke-dasharray="2 3"${NS}/></g>`, 'a-f', 1);
  out += grp(block(HB, s, c), 'a-f', 1) + grp(block(SB, s, c), 'a-f', 1.4);
  // the part of the headline block above the settled line: that is the double count
  const [a, b, d2, e] = [iso(HB.O, s, 0, HB.d, 77), iso(HB.O, s, HB.w, HB.d, 77), iso(HB.O, s, HB.w, HB.d, 100), iso(HB.O, s, 0, HB.d, 100)];
  const [g, h2] = [iso(HB.O, s, HB.w, 0, 77), iso(HB.O, s, HB.w, 0, 100)];
  const pt = (p: Pt) => `${f(p[0])} ${f(p[1])}`;
  out += `<g class="a-f" data-o="2.4"><path d="M${pt(a)}L${pt(b)}L${pt(d2)}L${pt(e)}Z" fill="${SEAL}" fill-opacity=".28" stroke="${SEAL}"/><path d="M${pt(b)}L${pt(g)}L${pt(h2)}L${pt(d2)}Z" fill="${SEAL}" fill-opacity=".4" stroke="${SEAL}"/></g>`;
  out += hook(T(e[0] - 8 * k, e[1] + 14 * k, '+23%', SEAL, 9 * k, 1, 'end', 600), 'a-t', 3);
  // scan band while the ledger is reconciled
  out += `<g class="a-scan" style="--scan-y:${f(rowH * (rows.length - 1))}px;--scan-dur:4.2s"><rect x="${f(px + 1)}" y="${f(py + 30 * k)}" width="${f(pw - 2)}" height="${f(rowH)}" fill="${c}" fill-opacity=".07"/></g>`;
  // each row is read in turn: row → verdict mark → connector → block
  const toSettled = iso(SB.O, s, SB.w / 2, SB.d, SB.h * 0.5), toExcess = iso(HB.O, s, HB.w / 2, HB.d, 88);
  rows.forEach(([id, kind, amt, st], i) => {
    const y = py + 30 * k + i * rowH + rowH / 2, o = 2 + i * 0.7, mx = px + pw - 13 * k;
    if (i % 2) out += `<rect x="${f(px + 1)}" y="${f(y - rowH / 2)}" width="${f(pw - 2)}" height="${f(rowH)}" fill="${c}" fill-opacity=".05"/>`;
    out += every(T(px + 8 * k, y + 3 * k, id, c, 7 * k, 0.7) + T(px + 40 * k, y + 3 * k, kind, c, 6.8 * k, 0.95) + T(px + pw - 26 * k, y + 3 * k, amt, c, 7 * k, 0.95, 'end'), 'a-t', o);
    const mark = st === 'ok'
      ? `<rect x="${f(mx - 5 * k)}" y="${f(y - 5 * k)}" width="${f(10 * k)}" height="${f(10 * k)}" fill="${c}"/><path d="M${f(mx - 2.5 * k)} ${f(y)}l${f(1.8 * k)} ${f(2 * k)} ${f(3.4 * k)} ${f(-4 * k)}" stroke="${onC(c)}" stroke-width="1.3"/>`
      : `<rect x="${f(mx - 5 * k)}" y="${f(y - 5 * k)}" width="${f(10 * k)}" height="${f(10 * k)}" stroke="${SEAL}"${st === 'dup' ? ` stroke-dasharray="${f(2 * k)} ${f(1.5 * k)}"` : ''}/>` + T(mx, y + 3 * k, st === 'dup' ? '×' : 'r', SEAL, 7.5 * k, 1, 'middle', 600);
    out += grp(mark, 'a-p', o + 0.5);
    const [tx, ty] = st === 'ok' ? toSettled : toExcess, col = st === 'ok' ? c : SEAL;
    out += `<path class="a-d a-flow" data-o="${o + 0.8}" d="M${f(px + pw)} ${f(y)}C${f(px + pw + 50 * k)} ${f(y)} ${f(tx - 50 * k)} ${f(ty)} ${f(tx)} ${f(ty)}" stroke="${col}" stroke-opacity=".65" stroke-width="${f(0.9 * k)}"${st === 'ok' ? '' : ` stroke-dasharray="${f(3 * k)} ${f(2 * k)}"`}/>`;
  });
  out += hook(T(px, py + 30 * k + rows.length * rowH + 16 * k, '4 settled · 1 refunded · 1 re-sent', c, 7 * k, 0.75), 'a-t', 7);
  out += hook(T(W - 22 * k, H - 22 * k, '// settled volume is the honest number', c, 7.5 * k, 0.7, 'end'), 'a-t', 7.5);
  return out;
};

/* ---------------------------------------------------------------- 3 · wash */
/** Three tests that found nothing: circularity (nothing loops back), timing (human-like) and the funding trail (hubs excluded). */
export const washSignature: Art = (W, H, c) => {
  const k = W / 524, pw = 180, ph = 120;
  let out = frame(W, H, c);
  // circularity: placers → counterparties, and the dashed return paths that were checked and are empty
  let circ = '';
  const L: [number, number][] = [[28, 26], [28, 60], [28, 94]], R: [number, number][] = [[152, 26], [152, 60], [152, 94]];
  L.forEach(([x, y], i) => R.forEach(([x2, y2], j) => { if (i === j || (i + j) % 2 === 0) circ += `<path d="M${x + 5} ${y}L${x2 - 5} ${y2}" stroke="${c}" stroke-opacity=".7"${NS}/>`; }));
  R.forEach(([x, y], i) => { circ += `<path d="M${x - 8} ${y + 7}C${x - 40} ${y + 24} ${L[i][0] + 40} ${L[i][1] + 24} ${L[i][0] + 8} ${L[i][1] + 7}" stroke="${c}" stroke-opacity=".3" stroke-dasharray="2 3"${NS}/>`; });
  circ += L.map(([x, y]) => sq(x - 5, y - 5, 10, c, 'fill')).join('') + R.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" ${BG} stroke="${c}"${NS}/>`).join('');
  circ += `<rect x="62" y="102" width="56" height="12" fill="${SEAL}" fill-opacity=".12" stroke="${SEAL}"${NS}/>` + T(90, 111, '0 loops back', SEAL, 6.6, 1, 'middle', 500);
  // timing: gaps between orders, placers against baseline, both organic
  let timing = '';
  const rowDots = (y: number, seed: number) => { let x = 14, d = ''; let v = seed; while (x < pw - 12) { v = (v * 16807) % 2147483647; x += 5 + (v % 11); d += `<rect x="${x}" y="${y}" width="2.4" height="9" fill="${c}"/>`; } return d; };
  timing += T(14, 24, 'placers', c, 7.2, 0.9) + rowDots(30, 7) + T(14, 62, 'baseline', c, 7.2, 0.9) + rowDots(68, 31) + `<path d="M14 92H${pw - 14}" stroke="${c}" stroke-opacity=".4"${NS}/>` + T(14, 106, 'no machine timing', c, 7.4, 0.9) + sq(pw - 26, 98, 10, c, 'fill') + `<path d="M${pw - 23.5} 103l1.8 2 3.4-4" stroke="${onC(c)}" stroke-width="1.3"${NS}/>`;
  // funding trail: first funder, up to four hops back, hubs and exchanges excluded
  let trail = '';
  const hops: [number, number][] = [[24, 96], [58, 76], [92, 58], [126, 40], [158, 24]];
  hops.forEach(([x, y], i) => { if (i) trail += `<path d="M${hops[i - 1][0]} ${hops[i - 1][1]}L${x} ${y}" stroke="${c}"${NS}/>`; });
  trail += hops.map(([x, y], i) => (i === 0 ? sq(x - 5, y - 5, 10, c, 'fill') : `<circle cx="${x}" cy="${y}" r="5" ${BG} stroke="${c}"${NS}/>`)).join('');
  trail += `<path d="M92 58L92 96" stroke="${c}" stroke-opacity=".4" stroke-dasharray="2 3"${NS}/>${sq(87, 96, 10, c, 'dash')}` + T(99, 104, 'hub · excluded', c, 6.6, 0.7) + T(14, 20, '4 hops back', c, 7.2, 0.9);
  const plates: Plate[] = [
    { name: 'funding trail', sub: '4 hops · hubs excluded', body: trail },
    { name: 'timing', sub: 'human-like intervals', body: timing },
    { name: 'circularity', sub: 'no money loops back', body: circ },
  ];
  out += stack(W, c, plates, [pw, ph], { s: 0.66 * k, cx: W * 0.36, top: 30 * k, gap: 62 * k, lx: W * 0.7 });
  out += hook(T(22 * k, H - 22 * k, '// 3 tests · nothing found', c, 7.5 * k, 0.75), 'a-t', 5) + hook(T(W - 22 * k, H - 22 * k, 'a clean result is a result', c, 7.5 * k, 0.65, 'end'), 'a-t', 5.5);
  return out;
};

/* ---------------------------------------------------------------- 4 · concentration */
/** Counterparty columns for one asset: a single column takes 88% of the fills, the rest barely register. */
export const concentrationSignature: Art = (W, H, c) => {
  const k = W / 524, s = 1.05 * k, O: Pt = [96 * k, 150 * k], step = 26, wd = 16;
  let out = frame(W, H, c);
  const shares = [88, 5, 3, 2, 1, 1];
  out += grp(`<g transform="${planeTop(O, s)}"><rect x="-14" y="-14" width="${step * shares.length + 22}" height="${wd + 28}" stroke="${c}" stroke-opacity=".25" stroke-dasharray="2 3"${NS}/></g>`, 'a-f', 0);
  const lx = W * 0.64;
  shares.forEach((pct, i) => {
    const h = Math.max(pct * 1.25, 3), bo = iso(O, s, i * step, 0, 0);
    const body = block({ O: bo, w: wd, d: wd, h, name: '' }, s, c);
    const [rx, ry] = iso(O, s, i * step + wd, 0, h);
    const accent = i === 0 ? `<g transform="${planeTop(bo, s, h)}"><rect width="${wd}" height="${wd}" fill="${SEAL}" fill-opacity=".85"${NS} stroke="${SEAL}" stroke-width="1.2"/></g>` : '';
    const leader = i === 5 ? '' : `<path d="M${f(rx + 6 * k)} ${f(ry)}H${f(lx - 8 * k)}" stroke="${c}" stroke-opacity=".4"/><circle cx="${f(rx + 6 * k)}" cy="${f(ry)}" r="${f(1.8 * k)}" fill="${c}"/>`;
    const name = i === 0 ? T(lx, ry + 3 * k, 'counterparty_01', SEAL, 8.2 * k, 1, 'start', 600) + T(lx, ry + 13 * k, '88% of one asset’s fills', SEAL, 6.8 * k, 0.9)
      : i < 4 ? T(lx, ry + 3 * k, `counterparty_0${i + 1}`, c, 7.4 * k, 0.8) + T(lx + 96 * k, ry + 3 * k, `${pct}%`, c, 7.4 * k, 0.8, 'end')
      : i === 4 ? T(lx, ry + 3 * k, 'counterparty_05+', c, 7.4 * k, 0.8) + T(lx + 96 * k, ry + 3 * k, '2%', c, 7.4 * k, 0.8, 'end') : '';
    out += `<g class="a-layer" data-i="${i}">${body}${accent}${leader}${name}</g>`;
  });
  // dimension on the first column
  const [d1x, d1y] = iso(O, s, 0, 0, 0), [, d2y] = iso(O, s, 0, 0, 110);
  out += `<g class="a-f" data-o="3">${dimV(d2y, d1y, d1x - 20 * k, '88%', SEAL, k)}</g>`;
  out += hook(T(W - 22 * k, 30 * k, '// concentration risk', c, 7.6 * k, 0.75, 'end'), 'a-t', 3) + hook(T(W - 22 * k, H - 22 * k, 'one counterparty · 6 shown', c, 7.2 * k, 0.65, 'end'), 'a-t', 4);
  return out;
};

export type CaseArt = 'users' | 'volume' | 'wash' | 'concentration';
export const caseArts: Record<CaseArt, Art> = { users: usersSignature, volume: volumeSignature, wash: washSignature, concentration: concentrationSignature };
