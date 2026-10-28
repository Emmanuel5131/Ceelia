# DESIGN.md — Celia design system

Single reference for how Celia looks and behaves, so the landing page and the app read as one product.

- **Source of truth for the landing page:** [apps/landing/src/styles/global.css](../apps/landing/src/styles/global.css) (tokens) and [apps/landing/src/components/](../apps/landing/src/components/) (components).
- **Where this file applies:** the app in `src/` (Next.js, Tailwind v4). The landing page is built in Astro with its own CSS, so it is the reference, not a dependency.
- **Legend:** items marked **(landing)** are taken from the landing page as built. Items marked **(proposed)** are new decisions for the app, made to match the landing's logic. Change them by editing this file first.

---

## 1. Principles

1. **Evidence, not hype.** The look is paper and ink: documents, hairlines and data. No glows, starfields, gradients, glassmorphism or stock "crypto" imagery.
2. **One accent, with a job.** Seal red appears only on a verdict, a finding, or the thing a finding points at. Everywhere else the UI is ink on paper.
3. **State by shape, with one exception.** Filled square = confirmed, dashed = pending or not checkable, hollow = not yet run. This is how every illustration on the landing page works. The one exception is a claim's four states in the app, which are tinted (§6): shape and label proved insufficient when two badges looked alike. Do not add green or amber anywhere else.
4. **We establish, the court decides.** Celia does not declare fraud. It establishes falsity and loss from the chain, evidences knowledge, and collects reliance from the victims themselves. Intent is left to the court. Any finding in the UI also states what is proven and what is not. Language rules are in §10.
5. **Fast first.** The app is dense, data-heavy and should feel instant. Motion is a short, subtle transition, never a performance (§8).

---

## 2. Colour

### Tokens (landing)

| Token | Hex | Role |
|---|---|---|
| `ink` (`--brand`) | `#0F1B2D` | Text, borders, icons, solid panels, primary buttons |
| `ink-muted` (`--brand-ink`) | `#46566E` | Secondary text on light surfaces |
| `ink-soft` (`--brand-soft`) | `#7F8DA3` | Decorative strokes only, never text |
| `ink-tint` (`--brand-tint`) | `#B9C2D0` | Decorative fills only |
| `surface` (`--white`) | `#FFFFFF` | Page background, inputs, outline buttons |
| `paper` (`--cream`) | `#F5F2EA` | Cards and panels sitting on white |
| `paper-sunken` (`--cream-2`) | `#ECE7DB` | Hover and sunken areas on paper |
| `on-ink-muted` (`--on-brand-muted`) | `#D5DBE5` | Secondary text on ink |
| `terminal` (`--ink-dark`) | `#08111F` | Log and terminal windows |
| `seal` (`--seal`) | `#991F38` | Verdicts and findings only. Same red as the logo |
| `seal-on-dark` (`--seal-on-dark`) | `#E0687C` | Seal red for text and marks on ink surfaces |
| `line` | `rgb(15 27 45 / .22)` | Standard hairline border |
| `line-soft` | `rgb(15 27 45 / .14)` | Subtle dividers, header underline |

Primary-button hover fill is `#1B2A44` (one step lighter than ink).

### Contrast (computed, WCAG)

| Pair | Ratio | Use for |
|---|---|---|
| ink on white | 17.3 | Everything |
| ink on paper | 15.5 | Everything |
| ink-muted on white | 7.5 | Secondary text |
| ink-muted on paper | 6.7 | Secondary text |
| on-ink-muted on ink | 12.4 | Secondary text on dark |
| seal on white | 8.1 | Text and marks on light |
| seal on paper | 7.2 | Text and marks on light |
| seal on ink | **2.1** | **Do not use.** Use `seal-on-dark` |
| seal-on-dark on ink | 5.3 | Text and marks on dark |
| ink-soft on white | 3.4 | **Not for text** |

### Rules

- Page is white, cards are paper. Never paper on paper, never grey on grey **(landing)**.
- Large solid blocks are ink with white text. This is the landing's signature (process, footer, dark tiles) **(landing)**.
- Seal red never fills a large area. Allowed: a verdict chip, a threshold marker, a delta band, a stamp.
- Overlays on ink use white at low opacity (`white/10` to `white/32`), not grey.
- Dark mode is **app only** (the landing stays light). It is the same roles with the lightness flipped, set in the `.dark` block of `apps/web/src/styles/global.css`: `ink` becomes the light colour, `surface` and `paper` become deep navy, `seal` becomes `seal-on-dark`. Components keep their class names. Text on an ink fill uses `text-on-ink` (never `text-white`), and a surface that must stay dark in both modes uses `bg-night`.

---

## 3. Typography

### Families

| Role | Family | Source | Licence |
|---|---|---|---|
| Display (headings) | **Aeonik** | `apps/landing/public/font/` | **Trial files only. Replace with licensed files before launch** (the trial also lacks `?`, apostrophes, `:` and other glyphs, which fall back to Mulish) |
| Body and UI | **Mulish** 400, 500, 700 | Google Fonts / `@fontsource/mulish` | SIL OFL |
| Evidence data | **IBM Plex Mono** 400, 500 | Google Fonts / `@fontsource/ibm-plex-mono` | SIL OFL |

**Mono means "this is data".** Use it only for hashes, addresses, transaction ids, block numbers, claim ids, timestamps and log lines. Never for headings, buttons or prose **(landing)**.

### Scale (landing, marketing)

| Token | Size | Use |
|---|---|---|
| `--fs-h1` | `clamp(2.25rem, 5.6vw, 4rem)` | Page hero |
| `--fs-h2` | `clamp(2rem, 4.8vw, 3.5rem)` | Section titles |
| `--fs-h3` | `clamp(1.5rem, 2.5vw, 2.125rem)` | Card titles |
| `--fs-h4` | `clamp(1.25rem, 1.9vw, 1.5625rem)` | Tile titles |
| `--fs-lead` | `clamp(0.975rem, 1.25vw, 1.0625rem)` | Lead paragraphs |
| `--fs-body` | `1rem` | Body |
| `--fs-small` | `0.84375rem` (13.5px) | Secondary text, table cells |
| `--fs-xs` | `0.78125rem` (12.5px) | Tags, captions |

Headings: Aeonik weight 400, line-height 1.1, tracking `-0.03em` (h1, h2), `-0.02em` (h3), `-0.012em` (h4). Body line-height 1.6. Headings are sentence case, always.

### Scale for the app (proposed)

Fixed sizes, no fluid `clamp`, because the app is dense:

| Use | Size / line-height | Family, weight |
|---|---|---|
| Page title | 32 / 36 | Aeonik 400 |
| Section title | 24 / 28 | Aeonik 400 |
| Card title | 20 / 24 | Aeonik 400 |
| Body | 15 / 22 | Mulish 400 |
| Table cell, label | 13.5 / 20 | Mulish 400 or 500 |
| Caption, tag | 12.5 / 16 | Mulish 500 |
| Evidence data | 12.5 / 18 | IBM Plex Mono 400 |
| Button | 15 / 20 | Mulish 700 |

Use `tabular-nums` on any number that changes or aligns in a column.

---

## 4. Spacing and layout

- **8pt grid (landing).** Every margin, padding and gap is a multiple of 8px (4px half-steps only below 16px). Tokens: 8, 16, 24, 32, 40, 48, 64, 80, 96, 128.
- **Page max width:** 1600px, content centred. Side gutter `clamp(16px, 1.55vw, 24px)`, snapped to 8px. Card gap equals the gutter, so outer margins match inner gaps **(landing)**.
- **Mobile card inset:** 24px side padding on cards at 600px and below **(landing)**.
- **Header:** white bar, hairline underline (`0 1px 0 line-soft`), logo left, links centred, one primary button right. 76px on the landing page **(landing)**; **64px in the app (proposed)**.
- **App shell (proposed):** the header above, an optional 240px left navigation for workspaces, and a content area padded 24px on mobile and 32px from 900px up. Page title row = title left, primary action right.
- **Breakpoints:** mobile layout below 900px, desktop from 900px; the navigation collapses to a burger below 900px **(landing)**.

---

## 5. Shape, borders and elevation

- **Surfaces are square (landing).** Cards, panels, tiles, accordions, tables and tags have **no border radius**.
- **Actions are pills (landing).** Buttons use a fully rounded `999px` radius.
- **Inputs, selects and textareas (proposed):** square, 1.5px ink-at-30% border, ink border on focus. Open decision: pill inputs would match the buttons more closely, square inputs match the surfaces. Square is the default until decided.
- **Borders:** hairlines only. Standard is 1px `line`. Disclosure and table frames use 1.5px at `ink / .28`.
- **Elevation:** almost none. Menus and popovers use `0 18px 40px -24px rgb(8 17 31 / .35)`. No glow, no gradient border, no coloured shadow.
- **Focus (landing):** `2px solid ink`, offset 3px. On ink surfaces the outline is white.
- **Selection:** ink background, white text.

---

## 6. Components

All of these exist on the landing page. App versions keep the look and drop the animation.

### Button (landing)

| | Primary | Secondary |
|---|---|---|
| Fill | ink | white |
| Text | white, Mulish 700 | ink, Mulish 700 |
| Border | 1.5px ink | 1.5px ink |
| Hover (landing) | fill blooms from the pointer to `#1B2A44` | fill blooms to ink, text turns white |
| Hover (app, proposed) | background to `#1B2A44`, 150ms | background to ink, text to white, 150ms |

- Shape: pill. Default height 52px, side padding 32px. `lg`: 60px, 40px. **`sm` for dense tables (proposed): 36px, 16px, 14px text.**
- Two buttons side by side share one width and height.
- One primary button per view.
- A button that is a link is an `<a>`. Disabled: 40% opacity, no hover.

### Tag / chip (landing)

Rectangular, 24px tall, 8px side padding, 1px `line` border, white background, 12.5px Mulish 500, ink text. On ink: `white/10` fill and `white/35` border, white text.

### Card and panel (landing)

- **Card:** paper background, no border, 24 to 32px padding. Hover on interactive cards: paper to `paper-sunken`.
- **Panel:** ink background, white text, secondary text `on-ink-muted`. Used for the process, footer and dark tiles.

### Disclosure / accordion (landing)

1.5px frame, 24px padding, title in Aeonik. Open state turns the row ink with white text and a `+` that rotates to `×`.

### Status marks (landing, from the illustrations)

| State | Mark |
|---|---|
| Confirmed, passed, material | Filled ink square with a white tick |
| Pending, built to the rules, not checkable | Dashed square outline |
| Not yet run | Hollow square |
| Finding, verdict, exceeded threshold | Seal-red outline or fill |

### Log / terminal (landing)

Window on `terminal`, IBM Plex Mono 12.5px, white text at `.9`, secondary lines at `.55`, 16px bar with three outlined squares, caret blinking. Used for the verification log and diffs.

### Tables (proposed, from the ledger illustration)

Hairline row dividers (`line-soft`), every second row `ink / .05`, 13.5px text, ids and amounts in mono, right-aligned numbers with `tabular-nums`, a status mark in the last column. No heavy header fill: a 1px `line` under a 12.5px ink-muted header row.

### Forms (proposed)

Label 13.5px Mulish 500 above the field, 44px field height, helper text 12.5px ink-muted, error text 12.5px seal with a dashed-square mark, never a red fill. Error copy is short with no "try again".

### Empty, loading and error (proposed)

Skeletons use `paper` blocks with no shimmer. Empty states: one Aeonik line, one sentence, one primary action. Toasts: white card, hairline border, popover shadow, ink text, 4s.

---

## 7. Data visualisation (proposed, from the case-study and Method tiles)

Charts are the product, so they get their own rules. They match the illustrations on the landing page.

- **Ink only, plus one accent.** Series are ink at 100%, 55%, 30% opacity. Seal red marks the finding: a threshold, a delta band or an overstated bar. No rainbow palette, no gradients.
- **Threshold pattern:** observed value as a bar, the pre-registered threshold as a dashed seal-red line with a diamond head. Bars that exceed it are solid ink, bars within it are faded.
- **Grid:** hairline, `ink / .05 to .12`, dashed for vertical guides. Axis labels in mono 12px at `ink / .55`.
- **Always label the number.** Put the key figure in the bar or beside it. Tooltips repeat it, they do not replace it.
- **Proven / not proven** is shown next to any chart that backs a finding.
- **Library:** none is chosen in the boilerplate yet. Whichever is picked must render with these tokens, avoid layout animation, and be loaded only on the route that uses it.

---

## 8. Motion and performance

### Landing (reference only)

GSAP and Lenis, scroll choreography, text scramble, sweeping fills. **None of this goes in the app.**

### App rules (proposed)

- **Transitions only.** 120 to 200ms for hover and focus, 200 to 250ms for menus, popovers and dialogs. Properties: `color`, `background-color`, `border-color`, `opacity`, `transform`. Never animate layout (width, height, top, left).
- **Easing:** `cubic-bezier(.16, 1, .3, 1)` (the landing's ease-out) for entering, `ease-in` for leaving. Same curve everywhere.
- **No scroll hijacking, no parallax, no loaders with copy, no count-up numbers.**
- **Reduced motion:** every transition collapses to none under `prefers-reduced-motion`.
- **Perceived speed:**
  - Skeleton or optimistic UI in place of spinners.
  - Navigation uses `<Link>` prefetch.
  - Mutations update the UI first and reconcile after.

### Performance budget (proposed)

- Server Components by default. Client components only for interaction.
- Fonts through `next/font` with `display: swap`. Preload only Mulish 400 and 500 and Aeonik 400. IBM Plex Mono does not preload.
- No GSAP, Lenis or animation library in the app bundle.
- Charts and heavy widgets load dynamically on their own route.
- Images use `next/image`; illustrations are inline SVG, not raster.
- The Tailwind theme below keeps CSS small: no custom utility classes beyond what is listed.

---

## 9. Implementing it in the app (Tailwind v4)

### 1. Theme tokens

Add to [src/styles/global.css](src/styles/global.css) after `@import 'tailwindcss';`:

```css
@theme {
  /* colour */
  --color-ink: #0F1B2D;
  --color-ink-hover: #1B2A44;
  --color-ink-muted: #46566E;
  --color-ink-soft: #7F8DA3;
  --color-ink-tint: #B9C2D0;
  --color-surface: #FFFFFF;
  --color-paper: #F5F2EA;
  --color-paper-sunken: #ECE7DB;
  --color-on-ink-muted: #D5DBE5;
  --color-terminal: #08111F;
  --color-seal: #991F38;
  --color-seal-on-dark: #E0687C;
  --color-line: rgb(15 27 45 / 0.22);
  --color-line-soft: rgb(15 27 45 / 0.14);

  /* type */
  --font-display: var(--font-aeonik), var(--font-mulish), system-ui, sans-serif;
  --font-sans: var(--font-mulish), system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono: var(--font-plex-mono), ui-monospace, 'SFMono-Regular', Menlo, monospace;
  --text-xs: 0.78125rem;
  --text-xs--line-height: 1rem;
  --text-sm: 0.84375rem;
  --text-sm--line-height: 1.25rem;
  --text-base: 0.9375rem;
  --text-base--line-height: 1.375rem;

  /* shape and motion */
  --radius-pill: 999px;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --shadow-popover: 0 18px 40px -24px rgb(8 17 31 / 0.35);
}
```

Squares are the default, so there is no radius token for surfaces: use `rounded-none` or nothing. Use `rounded-pill` only on buttons.

### 2. Fonts

In the root layout (`src/app/[locale]/layout.tsx`):

```tsx
import { IBM_Plex_Mono, Mulish } from 'next/font/google';
import localFont from 'next/font/local';

const mulish = Mulish({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-mulish', display: 'swap' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono', display: 'swap', preload: false });
// Trial files: replace with the licensed Aeonik before launch.
const aeonik = localFont({
  src: [{ path: '../../../apps/landing/public/font/AeonikTRIAL-Regular.otf', weight: '400' }],
  variable: '--font-aeonik',
  display: 'swap',
});
```

Add `${mulish.variable} ${plexMono.variable} ${aeonik.variable}` to the `<html>` class, and `font-sans text-ink bg-surface antialiased` to `<body>`. Move the Aeonik files into the app (for example `src/assets/fonts/`) so the app does not read from `landing/`.

### 3. Recipes

```tsx
// Button
const base = 'inline-flex min-h-13 items-center justify-center rounded-pill border-[1.5px] border-ink px-8 text-[0.9375rem] font-bold transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink disabled:opacity-40';
const primary = `${base} bg-ink text-white hover:bg-ink-hover`;
const secondary = `${base} bg-surface text-ink hover:bg-ink hover:text-white`;
// sm (dense): replace min-h-13 px-8 with min-h-9 px-4 text-sm

// Tag
const tag = 'inline-flex min-h-6 items-center border border-line bg-surface px-2 text-xs font-medium text-ink';

// Card and panel
const card = 'bg-paper p-6 md:p-8';
const panel = 'bg-ink p-6 text-white md:p-8';

// Field (proposed)
const field = 'h-11 w-full border-[1.5px] border-ink/30 bg-surface px-3 text-base text-ink outline-none transition-colors duration-150 focus:border-ink';
```

Clerk components (the boilerplate uses Clerk) take their theme through `appearance` variables. Map `colorPrimary` to ink, `colorBackground` to surface, `borderRadius` to `0`, and `fontFamily` to Mulish, so sign-in screens match.

---

## 10. Content and voice

- **Sentence case** everywhere: headings, buttons, labels, menu items.
- **Position:** *"We don't declare fraud. We establish falsity and loss from the chain, evidence knowledge, and collect reliance from the victims themselves. The court decides intent."* Copy never asserts intent.
- **The four things Celia establishes or collects:** **falsity** (the claim was untrue, as the chain shows), **loss** (what was lost and by whom), **knowledge** (what the other side knew, evidenced from the data) and **reliance** (collected from the victims themselves, never inferred). **Intent** belongs to the court.
- **House language:** write *establish*, *evidence*, *indicates*, *is consistent with*, *not proven*. **Never** write "fraud detected", "scam", "exposes" or anything that states intent. Findings stay defensible and non-defamatory.
- **Every finding states what is proven and what is not proven.** The same applies to exports and certificates.
- **Reports correct themselves.** When a later test overturns an earlier reading, the UI shows both and says so (struck-through earlier reading, revision marked). That is a feature.
- **Error messages:** short, no "try again" variants.
- **Names:** the product is **Celia**. The data layer is credited only as "Data infrastructure by Sandworm Labs" in a footer or a small trust line.
- **Numbers:** show the real figure, with units, and the date or block it applies to.

---

## 11. Accessibility

- All text meets AA: use the pairs in §2. Do not use `ink-soft` or `ink-tint` for text.
- Colour never carries meaning alone: every state has a shape (§6 status marks) and a text label.
- Visible focus on every interactive element (§5). Targets are at least 36px, 44px on touch.
- Respect `prefers-reduced-motion` (§8). Tables and charts have text alternatives (a data table or a summary sentence).

---

## 12. App UI standards (implemented in apps/web)

The app uses **shadcn/ui on Radix** with the Celia tokens, so one change to a token or a component changes every screen. The setup lives in `apps/web/src/styles/global.css` (tokens), `apps/web/components.json` (shadcn config) and `apps/web/src/components/ui/` (the components, which we own and edit).

**Rules that keep every screen consistent**

1. **Use the components.** No raw `button`, `input`, `select`, `table` or hand-built card in a page. If a component is missing, add it with `pnpm dlx shadcn@latest add <name>` and restyle it to this file.
2. **Pages use `PageContainer` and `PageHeader`** (`src/components/layout/`). They set the 24px (mobile) and 32px (from 900px) outer padding, the 1600px maximum width and the title row. A page never sets its own outer padding.
3. **One spacing scale.** Use Tailwind steps that land on the 8pt grid: `p-2 / p-4 / p-6 / p-8 / p-12` (8, 16, 24, 32, 48px) and the same for `gap-*`. Half-steps (`p-1`, `p-3`, 4 and 12px) only inside a component, never between components.
4. **Spacing between things:** 8px between a label and its field, 16px between fields and between buttons, 24px between a card's header and body and between cards, 32px between page sections, 48px between major regions.
5. **Control heights are tokens.** `--control-sm` 36px (dense tables, toolbars), `--control-md` 44px (default, minimum touch target), `--control-lg` 52px (one page-level primary action). Button, input, select and tab trigger all use them, so a row of controls always lines up. Never set `h-*` on a control.
6. **Buttons:** one primary per view; variants are `default` (primary), `outline` (secondary), `ghost`, `destructive` and `link`. Sizes are `sm`, `default`, `lg` and the matching `icon` sizes. Two buttons side by side share a size.
7. **Fields:** one look (`field-styles.ts`): 44px, square, 1.5px border, ink border on focus, seal-red border plus a message when invalid. Label above, helper text below. Error copy is short with no "try again".
8. **Surfaces:** white page, `paper` cards with no border and no shadow, hairline `line` borders, square corners. Only menus, popovers and dialogs have a shadow. Do not nest cards.
9. **Tags and status:** `Badge` is rectangular, 24px. State is a shape plus a text label: `solid` = confirmed, `dashed` = not confirmed, `seal` = a finding or verdict only; a claim's `sent`, `review`, `accepted` and `rejected` are tinted.
10. **Focus** is the `focus-ring` utility (2px ink outline, 3px away). Do not add `ring-*` or remove outlines.
11. **Type:** only the sizes in §3 (`text-xs`, `text-sm`, `text-base`, `text-xl`, `text-2xl`, `text-3xl`). Headings use Aeonik through the `font-heading` and `font-display` classes; mono is only for evidence data.
12. **Text is translated.** No user-visible string is hard-coded in a component (`next-intl`).

**Where each pattern lives.** Style a pattern once, in its component, and reuse it. A page composes these and adds no look of its own.

| Pattern | Component | Notes |
|---|---|---|
| App frame | `shell/AppShell` on shadcn `Sidebar` | Collapsible to icons (cookie `sidebar_state`, shortcut Ctrl or Cmd + B), a sheet on mobile. An ink surface (`--sidebar` tokens in `global.css`) with white text and the on-dark logo, beside a white page. Items come from `shell/nav.ts` per role. |
| Page section | `layout/PageSection` | Title, optional description and action, then the content. 48px between sections. |
| Stat or panel | `ui/Card` (+ `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardValue`) | `variant="default"` is paper; `variant="outline"` is white with a hairline, for content that must stand out. |
| Activity or steps | `ui/Timeline`, `TimelineItem` | The marker carries the state by shape: `filled` done or sealed, `dashed` current, `hollow` event, `muted` not yet. |
| A few big answers | `ui/ChoiceCards` | One question with 2 to 7 answers, each a card with an icon, a title and a line of explanation. Used for "how will you use Celia" and "what happened". |
| Searchable select | `ui/Combobox` | A select with a search box for long lists (popover plus the command list). Items can carry an icon and a group heading. Used for the chain picker. |
| Settings | `layout/SettingsList`, `SettingsRow` | One card, a row per setting: name and one sentence on the left, the control (button, select, switch) on the right; the control drops under the text on a phone. Account management opens Clerk's modal. Add a setting by adding a row. |
| Any table | `data-table/DataTable` on TanStack Table | Sorting, global search, faceted filters, column visibility, row selection and pagination, all from one set of features in `data-table/table.ts`. |

**Adding a table.** Define the columns once at module scope with `createAppColumnHelper<Row>()` (see `overview/case-columns.tsx`), then render `<DataTable columns data getRowId filters />`. Use `DataTableColumnHeader` for sortable headers and `createSelectColumn` for a checkbox column. Set `filterFn: 'inSet'` on a column to make it filterable by the faceted menu. To page on the server later, change `table.ts`, not the columns.

**Light and dark mode.** `next-themes` puts a `dark` class on `<html>`; it follows the system setting until someone picks a theme with the toggle in the sidebar footer (the choice is remembered). The footer also holds the red sign-out button. Never hard-code a hex colour or `text-white` on an ink fill: use the tokens, and both modes work. Check any new screen in both.

**Vendored shadcn code.** `ui/sidebar.tsx` stays close to the registry source so it is easy to update; `oxlint.config.ts` relaxes a few rules for that one file.

**Icons: Phosphor, regular weight** (`@phosphor-icons/react`). One weight and one family across the app, set once in `IconProvider`, so icons never take a `weight` prop. Size follows the control: 16px inside `sm` controls, 20px by default, 24px in `lg` and empty states. Name icons with the `Icon` suffix (`WalletIcon`). Add `aria-label` to an icon-only button. Use `fill` or `bold` only for a selected state, never to decorate. Do not mix in another icon set. **One exception:** chain logos (`claims/ChainIcon`, from `@web3icons/react`) are brand marks, not interface icons, so they keep their own colours. Add a chain to `@celia/core` and the type check asks for its logo.

**Why Phosphor:** one consistent drawing grid in six weights (so a selected or emphasised state is the same icon in a heavier weight), a large set that already covers wallet, file, seal and gavel concepts, and a regular weight that sits well beside hairline borders. Font Awesome's free tier has fewer outline icons and a very recognisable default look. Lucide and Tabler are good alternatives with a thinner stroke.

**The showcase** is the Storybook story `Foundations/Overview` (`pnpm storybook`). Look there before building a screen, and update it when a component changes.

---

## 13. Open decisions

1. **Aeonik licence.** Buy the licensed files, or pick an OFL lookalike (Outfit, Figtree, Plus Jakarta Sans) and change one token.
2. ~~**Input shape.**~~ **Decided: square**, with pill buttons (§12).
3. **App header height and sidebar.** 64px with an optional 240px sidebar is the starting point.
4. **Chart library.** Not chosen. Must follow §7.
5. **Dark mode.** Built for the app (see §2 Rules). Decide whether the landing gets it too.
6. **Status colours beyond seal red.** Added for a claim's four states only (decided 2026-10): sent is blue, in review amber, accepted green, rejected the seal red. Every one keeps its text label, and the tints are tokens (`status-*`) with dark-mode values. Do not extend them to other states without the same reason.

---

## 14. Checklist for any new screen

- [ ] White page, paper cards, ink text. Seal red only for a verdict or finding.
- [ ] Surfaces square, buttons pill, one primary button, built from `components/ui` (§12).
- [ ] Page uses `PageContainer` and `PageHeader`; spacing from the 8pt scale; icons are Phosphor regular.
- [ ] Headings Aeonik in sentence case, body Mulish, mono only for data.
- [ ] Everything on the 8pt grid; hairline borders; no shadow except menus.
- [ ] State shown with shape and text, not colour alone.
- [ ] Transitions 120 to 250ms, no layout animation, reduced motion respected.
- [ ] Server component unless it needs interaction; no animation library added.
- [ ] Copy follows §10.
