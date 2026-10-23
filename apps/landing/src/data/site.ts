import { appLogin } from './app';
/**
 * Single source of truth for brand facts.
 * Used by the UI, JSON-LD structured data, llms.txt and robots.txt so every
 * surface (search engines, AI assistants, humans) sees the same entity facts.
 *
 * The product name lives in `name` only. Change it here and the header, footer wordmark, loader and SEO follow.
 */
export const site = {
  name: 'Celia',
  alternateNames: [] as string[],
  url: 'https://example.com',
  locale: 'en_NG',
  language: 'en',
  tagline: 'Celia is a case bank for crypto fraud.',
  description:
    'Celia is an onchain case bank for lawyers and law firms. Victims of the same scheme add their wallet and a short video, Celia is the case bank: it holds the wallets of those defrauded and the sealed evidence from the chain, so nobody has to build the list of those affected. The lawyer or firm runs the case. Celia holds no funds and does not declare fraud: the court decides intent.',
  shortDescription: 'Onchain case bank for lawyers and law firms: the wallets of those defrauded and sealed evidence, ready for counsel.',
  email: 'hello@example.com',
  areaServed: 'Worldwide',
  /** Small trust line shown in the footer. */
  infrastructure: { label: 'Data infrastructure by', name: 'Sandworm Labs' },
  socials: [] as { name: keyof typeof import('../lib/graphics/icons').socialIcons; href: string }[],
  knowsAbout: [
    'Onchain analytics', 'Falsity and loss', 'Reliance evidence', 'Digital asset disclosure', 'Evidence certificates', 'Computer-generated evidence',
    'Wash trading analysis', 'Funding-trail analysis', 'Legal technology', 'Regulatory technology',
  ],
} as const;

export type NavItem = { label: string; href: string };

export const nav: { links: NavItem[]; cta: NavItem } = {
  links: [
    { label: 'How it works', href: '/#process' },
    { label: 'For lawyers', href: '/#lawyers' },
    { label: 'For victims', href: '/#victims' },
    { label: 'Who can join', href: '/#join' },
    { label: 'Jurisdictions', href: '/jurisdictions/' },
    { label: 'FAQ', href: '/#faq' },
  ],
  cta: { label: 'Report fraud', href: appLogin },
};

export const footerNav = {
  menu: [
    { label: 'Home', href: '/' },
    { label: 'Method', href: '/#method' },
    { label: 'Who can join', href: '/#join' },
    { label: 'FAQ', href: '/#faq' },
  ],
  jurisdictions: [
    { label: 'Nigeria · Evidence Act s.84', href: '/jurisdictions/' },
    { label: 'United States · FRE 902(13)/(14)', href: '/jurisdictions/' },
    { label: 'Next jurisdiction', href: '/#report' },
  ],
  contact: [
    { label: 'Report fraud', href: appLogin },
    { label: 'Join as a lawyer or firm', href: appLogin },
    { label: 'Email us', href: `mailto:${site.email}` },
  ],
};
