/**
 * Premium motion for the blueprint graphics (case-study bento tiles + project cards).
 *
 * Generators tag SVG elements with tiny hooks; this runtime choreographs them:
 *   intro (plays once when the graphic scrolls into view, ordered by data-o="0…n" beats)
 *     .a-d  stroke draws on          .a-f  fades + rises        .a-p  pops in (spring)
 *     .a-x  grows left → right       .a-y  grows bottom → top   .a-yd grows top → bottom
 *     .a-t  code/text decodes (scramble)                        .a-layer  iso plate drops into the stack
 *   idle loops (CSS + GSAP, paused off-screen)
 *     .a-flow  data packets travel the path   .a-ride[data-ride="#id"]  element rides a path
 *     .a-loopx[data-dx][data-dur]  seamless horizontal loop     .a-pulse .a-blink .a-spin .a-march .a-scan
 *   hover (on the tile/card)
 *     .a-layer  exploded view: plates spread apart along their guides
 * Card graphics ship as cacheable <img data-inline-art>; they are swapped for inline SVG just before
 * entering the viewport so they can animate. Everything is skipped for prefers-reduced-motion.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, ScrambleTextPlugin, MotionPathPlugin);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const HOOKS = '.a-d,.a-f,.a-p,.a-x,.a-y,.a-yd,.a-t,.a-layer';
const BEAT = 0.26; // seconds between choreography beats (data-o)
const SERVICE_ARTS = new Set(['intake', 'evidence', 'file', 'access']);
const SERVICE_SLOW = 2.4; // the services tiles are read, not glanced at: their intro plays this many times slower

function comets(svg: SVGSVGElement) {
  svg.querySelectorAll<SVGGeometryElement>('.a-flow').forEach((p, i) => {
    const c = p.cloneNode(false) as SVGGeometryElement;
    c.removeAttribute('class');
    c.removeAttribute('stroke-dasharray');
    c.classList.add('a-comet');
    c.setAttribute('pathLength', '100');
    c.setAttribute('stroke-opacity', '1');
    c.setAttribute('stroke-width', String((parseFloat(p.getAttribute('stroke-width') ?? '1') || 1) * 1.9));
    c.setAttribute('stroke-linecap', 'round');
    c.style.animationDelay = `${-((i * 0.83) % 3.2).toFixed(2)}s`;
    p.after(c);
  });
}

function intro(svg: SVGSVGElement) {
  const els = Array.from(svg.querySelectorAll<SVGElement>(HOOKS));
  if (!els.length) return;
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
  tl.timeScale(1 / (SERVICE_ARTS.has(svg.dataset.art ?? '') ? SERVICE_SLOW : 1));
  const groups = new Map<number, SVGElement[]>();
  els.forEach((e) => { const o = +(e.getAttribute('data-o') ?? 0); (groups.get(o) ?? groups.set(o, []).get(o)!).push(e); });
  [...groups.keys()].sort((a, b) => a - b).forEach((o) => {
    const list = groups.get(o)!;
    const st = Math.min(0.06, 0.7 / list.length);
    list.forEach((e, i) => {
      const t = o * BEAT + i * st;
      const c = e.classList;
      if (e.tagName.toLowerCase() === 'text' && !c.contains('a-f') && !c.contains('a-p')) { c.add('a-t'); c.remove('a-d', 'a-x', 'a-y', 'a-yd'); }
      if (c.contains('a-layer')) {
        tl.fromTo(e, { y: -34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1 }, o * BEAT + +(e.dataset.i ?? i) * 0.12);
      } else if (c.contains('a-d')) {
        if (e.hasAttribute('stroke-dasharray')) tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: 'power2.out' }, t);
        else tl.fromTo(e, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.15, ease: 'power3.inOut', clearProps: 'strokeDasharray,strokeDashoffset' }, t);
      } else if (c.contains('a-p')) {
        tl.fromTo(e, { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%' }, { scale: 1, autoAlpha: 1, duration: 0.7, ease: 'back.out(2.2)' }, t);
      } else if (c.contains('a-x')) {
        tl.fromTo(e, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.9 }, t);
      } else if (c.contains('a-y') || c.contains('a-yd')) {
        tl.fromTo(e, { scaleY: 0, transformOrigin: c.contains('a-yd') ? '50% 0%' : '50% 100%' }, { scaleY: 1, duration: 0.9 }, t);
      } else if (c.contains('a-t')) {
        const text = e.textContent ?? '';
        tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, t);
        if (text.trim()) tl.to(e, { duration: Math.min(1.1, 0.35 + text.length * 0.018), scrambleText: { text, chars: '01<>/\\_{}[]#=+', speed: 0.9, revealDelay: 0.1 }, ease: 'none' }, t);
      } else {
        tl.fromTo(e, { autoAlpha: 0, y: 7 }, { autoAlpha: 1, y: 0, duration: 0.8 }, t);
      }
    });
  });
  ScrollTrigger.create({ trigger: svg, start: 'top 90%', once: true, onEnter: () => tl.play() });
}

function loops(svg: SVGSVGElement) {
  const tweens: gsap.core.Tween[] = [];
  svg.querySelectorAll<SVGElement>('.a-loopx').forEach((e) => tweens.push(gsap.fromTo(e, { x: 0 }, { x: +(e.dataset.dx ?? 0), duration: +(e.dataset.dur ?? 8), ease: 'none', repeat: -1, paused: true })));
  svg.querySelectorAll<SVGElement>('.a-ride').forEach((e, i) => {
    const path = svg.querySelector<SVGPathElement>(e.dataset.ride ?? '');
    if (!path) return;
    tweens.push(gsap.to(e, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: +(e.dataset.dur ?? 2.6), ease: e.dataset.ease ?? 'power2.inOut', repeat: -1, repeatDelay: +(e.dataset.rest ?? 0.8), delay: i * 0.35, paused: true }));
  });
  new IntersectionObserver(([en]) => {
    svg.classList.toggle('is-off', !en.isIntersecting);
    tweens.forEach((t) => (en.isIntersecting ? t.play() : t.pause()));
  }, { rootMargin: '80px' }).observe(svg);
}

function hover(svg: SVGSVGElement) {
  const layers = Array.from(svg.querySelectorAll<SVGElement>('.a-layer'));
  if (!layers.length) return;
  const host = (svg.closest('.tile, .product, .proj, .np, .hv') as HTMLElement | null) ?? (svg as unknown as HTMLElement);
  const spread = +(svg.dataset.explode ?? 5);
  // Guides stretch from their base in lock-step: layer i rises i·spread, so every gap grows by `spread`
  // and a guide spanning n gaps must scale by 1 + spread / gap to stay on every plate corner.
  const guides = Array.from(svg.querySelectorAll<SVGGElement>('.a-guide'));
  gsap.set(guides, { transformOrigin: '50% 100%' });
  const open = { duration: 1, ease: 'expo.out', overwrite: 'auto' as const };
  const close = { duration: 1.1, ease: 'expo.out', overwrite: 'auto' as const };
  host.addEventListener('pointerenter', () => {
    gsap.to(layers, { y: (_i: number, el: SVGElement) => -(+(el.dataset.i ?? 0)) * spread, ...open });
    gsap.to(guides, { scaleY: (_i: number, el: SVGGElement) => 1 + spread / +(el.dataset.gap ?? 1), ...open });
  });
  host.addEventListener('pointerleave', () => { gsap.to(layers, { y: 0, ...close }); gsap.to(guides, { scaleY: 1, ...close }); });
}

function setup(svg: SVGSVGElement) {
  if (svg.dataset.artReady) return;
  svg.dataset.artReady = '1';
  comets(svg);
  if (reduce) return;
  intro(svg);
  loops(svg);
  hover(svg);
}

/** Replace <img data-inline-art> with its inline SVG (same cached file) so it can animate. */
async function inlineArt(img: HTMLImageElement) {
  try {
    const res = await fetch(img.currentSrc || img.src);
    const doc = new DOMParser().parseFromString(await res.text(), 'image/svg+xml');
    const svg = document.importNode(doc.documentElement, true) as unknown as SVGSVGElement;
    svg.setAttribute('class', img.className);
    // keep the component's scoped-style hook, so its CSS still applies to the swapped-in SVG
    for (const a of Array.from(img.attributes)) if (a.name.startsWith('data-astro-cid')) svg.setAttribute(a.name, a.value);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.removeAttribute('width'); svg.removeAttribute('height');
    svg.querySelector('title')?.remove();
    svg.dataset.art = img.dataset.inlineArt || 'card';
    if (img.dataset.explode) svg.dataset.explode = img.dataset.explode;
    img.replaceWith(svg);
    setup(svg);
    ScrollTrigger.refresh();
  } catch { /* keep the static image */ }
}

document.querySelectorAll<SVGSVGElement>('svg[data-art]').forEach(setup);
if (!reduce && matchMedia('(hover: hover)').matches) {
  document.querySelectorAll<HTMLElement>('[data-spot]').forEach((el) => el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`); el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true }));
}
const imgs = document.querySelectorAll<HTMLImageElement>('img[data-inline-art]');
if (imgs.length) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); inlineArt(e.target as HTMLImageElement); } }), { rootMargin: '400px 200px' });
  imgs.forEach((i) => io.observe(i));
}
