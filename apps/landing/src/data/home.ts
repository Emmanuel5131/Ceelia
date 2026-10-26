import { appLogin } from './app';
/**
 * Homepage content. Celia is a case bank: victims of the same scheme add their wallet and tell what happened in their own words, the evidence is
 * sealed from the chain, and the case is open to lawyers and law firms with the list of affected victims already built. Celia is only
 * the case bank: it holds the wallet addresses of those defrauded and the evidence, never funds, and it does not run cases or pay anyone.
 * Position: we do not declare fraud. We establish falsity and loss from the chain, evidence knowledge and collect reliance
 * from the victims themselves.
 * House language: "establish", "evidence", "alleged", "not proven". Never "fraud detected", "scam", "scammer", "exposes",
 * or any promise of an outcome or a fee.
 */
export const hero = {
  eyebrow: 'Legal tech · onchain case bank for lawyers and law firms',
  title: 'An open case bank\nfor crypto fraud.',
  lead: 'It brings victims, researchers and lawyers together to turn onchain evidence into cases that can stand up to scrutiny.',
  note: 'We don’t declare fraud.\nWe build every file to hold up in court.',
  primary: { label: 'Join as a lawyer or firm', href: appLogin },
  secondary: { label: 'Report fraud', href: appLogin },
};

/**
 * The animated evidence file beside the hero copy: one sample case, pooled from five victims' submissions and played as
 * one flow, then split into what the chain confirms and what it does not. Captions name actions, never people or intent; the
 * picture is an illustration and says so. A beat is one caption: its nodes appear, its links draw, then the next beat starts.
 */
export type TrailKind = 'box' | 'seal' | 'ring' | 'open' | 'wallets';
export type TrailLinkKind = 'in' | 'out' | 'thin' | 'rely';
export type TrailNode = { id: string; label: string; x: number; kind: TrailKind };
export type TrailBeat = {
  caption: string;
  nodes?: string[];
  links?: { from: string; to: string; kind: TrailLinkKind; strands?: number }[];
  gate?: boolean;
  bubble?: { node: string; text: string };
};
export type HeroFile = {
  id: string; title: string;
  nodes: TrailNode[]; beats: TrailBeat[];
  confirmed: { text: string; beat: number }[]; notConfirmed: string[];
};
export const heroReport = {
  status: 'Sealed',
  sample: 'Sample case',
  pooled: '5 cases · 1 file',
  note: 'Sample case · illustration',
  victims: '5 victims',
  submit: '5 victims submit their cases',
  confirmedLabel: 'Confirmed on chain',
  notConfirmedLabel: 'Not confirmed',
};
export const heroFile: HeroFile = {
  id: 'funds-taken', title: 'Funds taken',
  nodes: [
    { id: 'app', label: 'App', x: 190, kind: 'box' },
    { id: 'mixer', label: 'Mixer', x: 320, kind: 'ring' },
    { id: 'exchange', label: 'Exchange', x: 440, kind: 'open' },
  ],
  beats: [
    { caption: 'A new app promises 10% a week', nodes: ['app'], bubble: { node: 'app', text: '10% a week' } },
    { caption: 'Victims pay in', links: [{ from: 'victims', to: 'app', kind: 'in' }] },
    { caption: 'Withdrawals blocked', gate: true },
    { caption: 'The money moves out through a mixer', nodes: ['mixer'], links: [{ from: 'app', to: 'mixer', kind: 'out' }] },
    { caption: 'It is cashed out at an exchange', nodes: ['exchange'], links: [{ from: 'mixer', to: 'exchange', kind: 'thin', strands: 3 }] },
  ],
  confirmed: [
    { text: 'Victims paid into one app wallet', beat: 2 },
    { text: 'The funds left it through a mixer', beat: 4 },
    { text: 'They reached an exchange deposit address', beat: 5 },
  ],
  notConfirmed: ['That withdrawals were blocked: victim reports, not on chain', 'Who controls the app and exchange wallets'],
};

export type ServiceArt = 'intake' | 'evidence' | 'file' | 'access';
/** Section intro. The pattern is the most common one in the FBI's 2025 Internet Crime Report: investment fraud, $7.2B of US losses. */
export const servicesIntro = {
  title: 'One platform,\nmany victims,\none case.',
  lead: 'The most common crypto loss is an investment platform that promises returns, takes deposits, then blocks withdrawals and asks for a fee. Each victim holds a small claim and a wallet address. Celia pools them, builds the evidence from the chain, and hands a lawyer one evidence file.',
  source: { label: 'FBI Internet Crime Report 2025, investment fraud: $7.2B of reported US losses, the costliest category', href: 'https://www.hstoday.us/subject-matter-areas/cybersecurity/cryptocurrency-and-ai-scams-cost-u-s-almost-21-billion-in-2025-according-to-new-fbi-internet-crime-report/' },
};
export const services: {
  title: string; slug: string; kicker: string; description: string; tags: string[]; art: ServiceArt;
}[] = [
  {
    title: 'Claimant intake', slug: 'claimant-intake', art: 'intake',
    kicker: 'Verified claimants',
    description: 'Most victims lost a small amount and kept only a wallet address and a few screenshots. Each adds the wallet and says what they were promised and what they lost, in text or any format that feels easy. Ownership is proven by signing from the wallet.',
    tags: ['Wallet', 'Your account', 'Signed ownership'],
  },
  {
    title: 'Chain evidence', slug: 'chain-evidence', art: 'evidence',
    kicker: 'Sealed evidence',
    description: 'The pattern repeats: deposits, a blocked withdrawal, then the funds move out and are cashed out. We trace it and run a fixed set of tests, committed before any data is touched. Each finding says what is proven and what is not.',
    tags: ['Funding trail', 'Circularity', 'Concentration', 'Cohort vs baseline'],
  },
  {
    title: 'Court-ready file', slug: 'court-ready-file', art: 'file',
    kicker: 'Evidence file and certificate',
    description: 'One claim is rarely worth a lawyer’s time. Pooled by platform and jurisdiction, the claims become one sealed evidence file, with an evidence certificate for the court.',
    tags: ['Section 84 · NG', 'FRE 902 · US, in counsel review'],
  },
  {
    title: 'Lawyer access', slug: 'lawyer-access', art: 'access',
    kicker: 'Victims already listed',
    description: 'Lawyers and law firms open the case bank: the wallets of those defrauded and the evidence, ready to use. They never start by hunting for victims. Celia holds no funds, runs no cases and pays no one: counsel takes it from there.',
    tags: ['Defrauded wallets', 'Sealed evidence', 'Ready for counsel'],
  },
];

export const process = {
  title: 'From one victim\nto a public case',
  lead: 'You are not the only one. Celia pools the victims of the same platform into one case that lawyers and researchers can find and build on. The method is committed first, so the case stands on what the chain shows.',
  cta: {
    victim: { label: 'Report fraud', href: appLogin },
    lawyer: { label: 'Join as a lawyer or firm', href: appLogin },
  },
  steps: [
    { title: 'Don’t be a lone victim', text: 'Join the others hurt by the same platform. One claim is easy to ignore. Many together show a pattern.' },
    { title: 'Report the fraud', text: 'Add your wallet and tell us what you were promised and what you lost. Ownership is proven by signing from the wallet.' },
    { title: 'We create the case', text: 'Claims for the same platform are pooled into one case file: the wallets of those defrauded and the evidence, sealed from the chain before any data is touched.' },
    { title: 'We advertise the case', text: 'The case is listed in the case bank, so lawyers, law firms and researchers can find it and see what is proven and what is not.' },
    { title: 'The public case grows', text: 'Anyone can inspect the method and the chain evidence. Researchers review it, a lawyer or firm takes it to court. What you share stays private, shared only with the lawyer or firm.' },
  ],
};

/** The first thing after the hero: one line for a victim, so nobody reads on thinking they have to build a case alone. */
export const together = {
  eyebrow: 'For victims',
  title: 'Don’t be a\nsolo victim.',
  lead: 'Your claim joins others hurt by the same scheme, so it is worth a lawyer’s time. Tell it once, add your wallet and a few lines of text, and your evidence is sealed.',
  cta: { label: 'Report fraud', href: appLogin },
};

/** Who the page is for: two cards, one per side of the case bank. */
export const audience = [
  {
    id: 'lawyers',
    label: 'For lawyers and law firms',
    title: 'The file is built. What you do with it is yours to decide.',
    text: 'Celia holds the wallets of those defrauded and the evidence, so you start with the list already built. Whether you are a solo lawyer or a firm, you decide whether to take the case and how to run it. Celia does not tell you what to do, and does not promise a result.',
    points: ['Pooled claimants by jurisdiction, with ownership proven', 'Sealed evidence and a certificate for your court', 'Evidence you can verify yourself'],
    cta: { label: 'Join as a lawyer or firm', href: appLogin },
  },
  {
    id: 'victims',
    label: 'For victims',
    title: 'You don’t have to document it alone.',
    text: 'Your wallet and your account sit alongside those of others hurt by the same platform, so a lawyer can see the whole picture. You tell it once, in your own words, and your evidence is sealed. Celia can’t promise that a lawyer takes your case or that you recover anything.',
    points: ['Add your wallet and a few lines of text', 'Prove ownership by signing from your wallet', 'See where your file stands'],
    cta: { label: 'Report fraud', href: appLogin },
  },
];

/** Who is welcome on the platform: everyone who can help turn a fraud into a case. */
export const welcome = {
  title: 'Everyone who can help\nis welcome.',
  lead: 'Celia is open to the people a case needs. Pick the part that fits you. Each one adds to the same file.',
  people: [
    { who: 'Victims', text: 'Add your wallet and a few lines of text. Your claim sits alongside others hurt by the same platform, and what you share stays private.', cta: { label: 'Report fraud', href: appLogin } },
    { who: 'Lawyers and law firms', text: 'Open a case from the case bank, with the wallets of those defrauded and the evidence already listed, and take it forward in your own court.', cta: { label: 'Join as a lawyer or firm', href: appLogin } },
    { who: 'Researchers', text: 'Review the evidence, challenge the method, and add what the chain cannot show: the promises, the ads, the entities.', cta: { label: 'Join as a researcher', href: appLogin } },
    { who: 'Analysts', text: 'Trace the funds and run the fixed tests on the chain, with the thresholds set before the run.', cta: { label: 'Join as an analyst', href: appLogin } },
  ],
};

/** The verification log (rendered as a terminal). Newest first, like `git log`. Case study: anonymized Protocol P / App A. */
export const log = {
  title: 'Every step\nis on the record.',
  lead: 'A verification log shows the commitment, each test, what it establishes and the seal, in order. The case below is anonymized.',
  badges: ['Evidence Act 2011, s.84 (NG)', 'FRE 902(13)/(14) (US), pending counsel review'],
  command: 'verify --claim "App A gained ~2,700 new users"',
  tab: '~/protocol-p',
  entries: [
    { time: 'T+6', type: 'seal', text: 'Report hash published against the commitment' },
    { time: 'T+5', type: 'falsity', text: 'Wallets are operator-managed, so the claim overstates the user base' },
    { time: 'T+4', type: 'revised', text: 'Earlier outside-platform reading overturned by a later pre-registered test' },
    { time: 'T+3', type: 'test', text: 'Concentration: 88% of one asset’s fills depend on a single counterparty' },
    { time: 'T+2', type: 'test', text: 'Funding trail: one funder seeded 90% of App A’s users' },
    { time: 'T+1', type: 'test', text: 'Cohort: 79% single-purpose wallets against an 11% baseline (7×)' },
    { time: 'T+0', type: 'commit', text: 'Claim, tests and thresholds hashed and committed onchain' },
  ],
};

export const jurisdictionsIntro = {
  title: 'Where is your\ncase filed?',
  lead: 'Type a country, state or province. We tell you which of four kinds of rule decides whether electronic evidence is accepted there.',
  placeholder: 'Try Nigeria, New York or United Kingdom',
  tryLabel: 'Try',
  tries: ['Nigeria', 'New York', 'United Kingdom', 'India'],
  note: 'These are research notes, not legal advice. Rules named by section come from public sources; the rest are national electronic transactions laws based on the UN Model Law on Electronic Commerce (UNCITRAL). We confirm each with counsel before we say it is met.',
};
export const faqs = [
  { q: 'What does Celia do, and what does the lawyer do?', a: 'Celia is the case bank: it holds the wallets of those defrauded and the sealed evidence, and pools the claims into one case. The lawyer or law firm takes it from there: they run the case in their own court and settle with the victims. Celia holds no funds, runs no cases and pays no one.' },
  { q: 'Does Celia hold my money?', a: 'No. Celia is a case bank. It holds the wallet addresses of those defrauded and the evidence, not funds. Any recovery is handled by the lawyer or firm running the case.' },
  { q: 'Do you declare fraud?', a: 'No. We establish falsity and loss from the chain, evidence knowledge, and collect reliance from the victims themselves. Each finding states what is proven and what is not proven.' },
  { q: 'Is it free to report fraud?', a: 'Reporting is the first step. Celia does not pay lawyers. Any fee is agreed between you and the lawyer or firm that takes your case, for example a retainer or a written agreement with counsel, under the rules of your jurisdiction.' },
  { q: 'Will I get my money back?', a: 'We can’t promise an outcome. We build the strongest evidence we can and put it in front of a lawyer. If a case settles or succeeds, the lawyer or firm handles the recovery, as the settlement terms allow.' },
  { q: 'Who sees what I submit?', a: 'What you submit is shared with the lawyer or firm handling your case. It is not published.' },
  { q: 'How are lawyers matched?', a: 'By jurisdiction and practice area. Any lawyer or firm that can take the case can run it, wherever they practise.' },
  { q: 'Why commit the method onchain first?', a: 'The claim, the tests and the thresholds are hashed and committed to a smart contract before any data is touched. That shows the method was not tuned after seeing the results, so nobody can say we went looking for a finding.' },
  { q: 'Which jurisdictions are covered?', a: 'You can search every country and territory, and the states, provinces and regions inside them, on our Jurisdictions page. Victims and clients alike can confirm the statutory regulation that governs their province there. Where a rule is mapped we say which of the four kinds it is. Where it is not mapped yet we say that, and never guess.' },
];
