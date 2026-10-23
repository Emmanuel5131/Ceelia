/**
 * Homepage content. Celia is a case bank: victims of the same scheme add their wallet and a short video, the evidence is
 * sealed from the chain, and the case is open to lawyers and law firms with the list of affected victims already built. Celia is only
 * the case bank: it holds the wallet addresses of those defrauded and the evidence, never funds, and it does not run cases or pay anyone.
 * Position: we do not declare fraud. We establish falsity and loss from the chain, evidence knowledge and collect reliance
 * from the victims themselves. The court decides intent.
 * House language: "establish", "evidence", "alleged", "not proven". Never "fraud detected", "scam", "scammer", "exposes",
 * or any promise of an outcome or a fee.
 */
export const hero = {
  eyebrow: 'Legal tech · onchain case bank for lawyers and law firms',
  title: 'Celia is a case bank\nfor crypto fraud.',
  tagline: 'Victim wallets. Preserved evidence. Investigations ready for legal action.',
  lead: 'Celia brings victims, researchers, and lawyers together to turn on-chain evidence into cases that can stand up to scrutiny.',
  note: 'We don’t declare fraud. The court decides intent. We build every file to hold up in court.',
  primary: { label: 'Join as a lawyer or firm', href: '/#lawyers' },
  secondary: { label: 'Report fraud', href: '/#victims' },
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
  intentLabel: 'Intent',
  intent: 'Left to the court',
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
    description: 'Most victims lost a small amount and kept only a wallet address and a few screenshots. Each adds the wallet and a short video: what they were promised and what they lost. Ownership is proven by signing from the wallet.',
    tags: ['Wallet', 'Short video', 'Signed ownership'],
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
    description: 'One claim is rarely worth a lawyer’s time. Pooled by platform and jurisdiction, the claims become one sealed evidence file, with an evidence certificate for the court. The court decides intent.',
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
  title: 'From victims\nto counsel',
  lead: 'Celia is the case bank. The lawyer or law firm runs the case. The evidence method is committed first, so the case stands on what the chain shows, and intent is left to the court.',
  steps: [
    { title: 'Victims come to us', text: 'Each adds a wallet and records a short video: what they were promised and what they lost. Ownership is proven by signing from the wallet.' },
    { title: 'We seal the evidence', text: 'The method is committed onchain before any data is touched. The chain establishes falsity and loss and evidences knowledge. The videos are the reliance.' },
    { title: 'We build the case', text: 'Claims are pooled by scheme and jurisdiction into one evidence file: the wallets of those defrauded, the evidence and a certificate for the court.' },
    { title: 'Counsel takes it', text: 'A lawyer or law firm opens the case from the bank and runs it in its own court. Celia holds no funds and runs no cases.' },
  ],
};

/**
 * The frame: Project Celia is an open, onchain evidence file that four roles build together. The onchain / open / one-case
 * principles say how; the roles say who. Credit and outcomes are never promised: contributions are signed and recorded, and
 * what each case pays is set by its own agreement.
 */
export const collective = {
  title: 'One open case.\nFour roles.\nAll onchain.',
  lead: 'Project Celia is an open-source, onchain evidence file. Anyone can inspect the method and verify the evidence. Each role adds to the same case, and every contribution is signed and recorded onchain.',
  principles: [
    { title: 'Onchain', text: 'The method is committed first. Evidence hashes and the claimant list are recorded onchain.' },
    { title: 'Open source', text: 'The tests and the reports are public, so anyone can run them again and check the result.' },
    { title: 'One case', text: 'One file per platform, with every claimant in it. The court decides intent.' },
  ],
  rolesTitle: 'Who builds the case',
  roles: [
    { role: 'Coordinator', does: 'Pools the victims of one platform into one claim group and checks that each wallet is theirs.', record: 'Signed claimant list' },
    { role: 'Analyst', does: 'Traces the funds and runs the fixed tests on the chain, with the thresholds set before the run.', record: 'Results hashed against the commitment' },
    { role: 'Researcher', does: 'Reviews the analysis, challenges it, and adds what the chain can’t show: the promises, the ads, the entities.', record: 'Reviews and corrections, signed' },
    { role: 'Lawyer', does: 'Opens the case from the bank, files it in court, and runs it. Celia holds no funds and pays no one.', record: 'Filing reference' },
  ],
};

/** Who the page is for: two cards, one per side of the case bank. */
export const audience = [
  {
    id: 'lawyers',
    label: 'For lawyers and law firms',
    title: 'The case is built. Your job is to win it.',
    text: 'Celia holds the wallets of those defrauded and the evidence, so you start with the list already built. Whether you are a solo lawyer or a firm, you take the case and run it.',
    points: ['Pooled claimants by jurisdiction, with ownership proven', 'Sealed evidence and a certificate for your court', 'Evidence you can verify yourself'],
    cta: { label: 'Join as a lawyer or firm', href: '/#report' },
  },
  {
    id: 'victims',
    label: 'For victims',
    title: 'You don’t have to build the case alone.',
    text: 'Your claim joins others hurt by the same scheme, so it is worth a lawyer’s time. You tell it once, in your own words, and your evidence is sealed.',
    points: ['Add your wallet and a short video', 'Prove ownership by signing from your wallet', 'Follow your case from evidence to lawyer'],
    cta: { label: 'Report fraud', href: '/#report' },
  },
];

/** Case bank preview. Sample cases: the figures are illustrative until real cases are in. `stage` = steps completed (of 3). */
export const caseBank = {
  title: 'The case bank',
  lead: 'Pooled, evidenced and ready for counsel to take. These are sample cases, with illustrative figures.',
  stages: ['Evidence sealed', 'Taken by counsel', 'Filed'],
  cases: [
    { name: 'Protocol P · App A', scheme: 'Stablecoin off-ramp', claimants: 214, jurisdictions: ['NG', 'US', 'UK', 'AE'], loss: '$1.8M', stage: 1 },
    { name: 'Case 0412', scheme: 'Yield platform', claimants: 96, jurisdictions: ['NG', 'GH', 'KE'], loss: '$640K', stage: 2 },
    { name: 'Case 0409', scheme: 'Token launch', claimants: 58, jurisdictions: ['US', 'CA'], loss: '$320K', stage: 3 },
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
    { time: 'T+6', type: 'seal', text: 'Report hash published against the commitment. Intent is left to the court' },
    { time: 'T+5', type: 'falsity', text: 'Wallets are operator-managed, so the claim overstates the user base' },
    { time: 'T+4', type: 'revised', text: 'Earlier outside-platform reading overturned by a later pre-registered test' },
    { time: 'T+3', type: 'test', text: 'Concentration: 88% of one asset’s fills depend on a single counterparty' },
    { time: 'T+2', type: 'test', text: 'Funding trail: one funder seeded 90% of App A’s users' },
    { time: 'T+1', type: 'test', text: 'Cohort: 79% single-purpose wallets against an 11% baseline (7×)' },
    { time: 'T+0', type: 'commit', text: 'Claim, tests and thresholds hashed and committed onchain' },
  ],
};

/**
 * The evidence rules each finding is mapped to: 70 jurisdictions, in four modes. Every legal system has a rule for electronic
 * records, and it takes one of four shapes. Celia's certificate answers all four, so the method stays the same and only the
 * citation changes. Only Nigeria is built to its rule; the rest are mapped and in counsel review, and lose that tag only when
 * counsel signs off. Rules named by section were read in public sources. The rest are the electronic transactions laws that
 * the UN Commission on International Trade Law (UNCITRAL) lists as enacted on its Model Law on Electronic Commerce, by year.
 * Confirm each with counsel before relying on it.
 */
export type RuleMode = 'certificate' | 'authentication' | 'presumption' | 'equal';
export const ruleModes: { id: RuleMode; title: string; text: string; answer: string }[] = [
  { id: 'certificate', title: 'Certificate', text: 'The person responsible for the system certifies how the record was made.', answer: 'Our certificate names the system, the time and the method.' },
  { id: 'authentication', title: 'Authentication', text: 'You show the record is what it claims to be and that the system kept it intact.', answer: 'The report is hashed and sealed against the commitment.' },
  { id: 'presumption', title: 'Presumption', text: 'The system is presumed to have worked unless someone challenges it.', answer: 'The method was fixed before any data was touched.' },
  { id: 'equal', title: 'Equal treatment', text: 'A record can’t be refused only because it is electronic.', answer: 'Every finding states what is proven and what is not.' },
];
export const jurisdictionsIntro = {
  title: 'The rule changes.\nThe method doesn’t.',
  lead: 'Courts everywhere have a rule for electronic records, and it takes one of four shapes. Celia maps each finding to the rule of the place where the case is filed, and says where counsel has not yet reviewed it.',
  promise: 'We build every evidence file to the rule of the court where it is filed. The court decides whether it is admitted.',
  note: 'Rules named by section come from public sources. The rest are national electronic transactions laws based on the UN Model Law on Electronic Commerce (UNCITRAL). We confirm each with counsel before we say it is met.',
};
export const jurisdictions: { region: string; items: { code: string; country: string; law: string; mode: RuleMode; built?: true }[] }[] = [
  { region: 'Africa', items: [
    { code: 'NG', country: 'Nigeria', law: 'Evidence Act 2011, s.84', mode: 'certificate', built: true },
    { code: 'KE', country: 'Kenya', law: 'Evidence Act, s.106B', mode: 'certificate' },
    { code: 'ZA', country: 'South Africa', law: 'ECTA 2002, s.15', mode: 'equal' },
    { code: 'GH', country: 'Ghana', law: 'Electronic Transactions Act 2008', mode: 'equal' },
    { code: 'UG', country: 'Uganda', law: 'Electronic transactions law (2011)', mode: 'equal' },
    { code: 'TZ', country: 'Tanzania', law: 'Electronic transactions law (2015)', mode: 'equal' },
    { code: 'RW', country: 'Rwanda', law: 'Electronic transactions law (2010)', mode: 'equal' },
    { code: 'ZM', country: 'Zambia', law: 'Electronic transactions law (2009)', mode: 'equal' },
    { code: 'MU', country: 'Mauritius', law: 'Electronic Transactions Act 2000', mode: 'equal' },
    { code: 'BW', country: 'Botswana', law: 'Electronic transactions law (2014)', mode: 'equal' },
    { code: 'NA', country: 'Namibia', law: 'Electronic transactions law (2019)', mode: 'equal' },
    { code: 'MZ', country: 'Mozambique', law: 'Electronic transactions law (2017)', mode: 'equal' },
    { code: 'MW', country: 'Malawi', law: 'Electronic transactions law (2016)', mode: 'equal' },
    { code: 'ET', country: 'Ethiopia', law: 'Electronic transactions law (2020)', mode: 'equal' },
  ] },
  { region: 'Americas', items: [
    { code: 'US', country: 'United States', law: 'Federal Rules of Evidence, 902(13) and (14)', mode: 'certificate' },
    { code: 'CA', country: 'Canada', law: 'Canada Evidence Act, ss.31.1–31.8', mode: 'authentication' },
    { code: 'BR', country: 'Brazil', law: 'Código de Processo Civil, arts.439–441', mode: 'authentication' },
    { code: 'MX', country: 'Mexico', law: 'Código de Comercio, art.1298-A', mode: 'authentication' },
    { code: 'CO', country: 'Colombia', law: 'Ley 527 de 1999', mode: 'equal' },
    { code: 'EC', country: 'Ecuador', law: 'Electronic transactions law (2002)', mode: 'equal' },
    { code: 'PA', country: 'Panama', law: 'Electronic transactions law (2008)', mode: 'equal' },
    { code: 'VE', country: 'Venezuela', law: 'Electronic transactions law (2001)', mode: 'equal' },
    { code: 'GT', country: 'Guatemala', law: 'Electronic transactions law (2008)', mode: 'equal' },
    { code: 'HN', country: 'Honduras', law: 'Electronic transactions law (2015)', mode: 'equal' },
    { code: 'JM', country: 'Jamaica', law: 'Electronic Transactions Act 2006', mode: 'equal' },
    { code: 'BS', country: 'Bahamas', law: 'Electronic transactions law (2003)', mode: 'equal' },
    { code: 'TT', country: 'Trinidad and Tobago', law: 'Electronic Transactions Act 2011', mode: 'equal' },
    { code: 'BB', country: 'Barbados', law: 'Electronic Transactions Act 2001', mode: 'equal' },
  ] },
  { region: 'Europe', items: [
    { code: 'EU', country: 'European Union', law: 'eIDAS Regulation, art.46', mode: 'equal' },
    { code: 'DE', country: 'Germany', law: 'ZPO, § 371a', mode: 'authentication' },
    { code: 'FR', country: 'France', law: 'Code civil, art.1366', mode: 'authentication' },
    { code: 'UK', country: 'United Kingdom', law: 'Civil Evidence Act 1995', mode: 'presumption' },
    { code: 'IE', country: 'Ireland', law: 'Electronic Commerce Act 2000', mode: 'equal' },
    { code: 'SI', country: 'Slovenia', law: 'Electronic transactions law (2000)', mode: 'equal' },
    { code: 'MT', country: 'Malta', law: 'Electronic Commerce Act 2002', mode: 'equal' },
    { code: 'IT', country: 'Italy', law: 'Codice dell’amministrazione digitale, arts.20–21', mode: 'authentication' },
    { code: 'ES', country: 'Spain', law: 'Ley de Enjuiciamiento Civil, art.299(2)', mode: 'authentication' },
    { code: 'SM', country: 'San Marino', law: 'Electronic transactions law (2013)', mode: 'equal' },
  ] },
  { region: 'Middle East', items: [
    { code: 'AE', country: 'United Arab Emirates', law: 'Federal Decree-Law 46 of 2021', mode: 'equal' },
    { code: 'SA', country: 'Saudi Arabia', law: 'Law of Evidence, 2022', mode: 'equal' },
    { code: 'QA', country: 'Qatar', law: 'Electronic transactions law (2010)', mode: 'equal' },
    { code: 'BH', country: 'Bahrain', law: 'Electronic transactions law (2018)', mode: 'equal' },
    { code: 'KW', country: 'Kuwait', law: 'Electronic transactions law (2014)', mode: 'equal' },
    { code: 'OM', country: 'Oman', law: 'Electronic transactions law (2008)', mode: 'equal' },
    { code: 'JO', country: 'Jordan', law: 'Electronic transactions law (2015)', mode: 'equal' },
    { code: 'IR', country: 'Iran', law: 'Electronic transactions law (2004)', mode: 'equal' },
  ] },
  { region: 'Asia', items: [
    { code: 'IN', country: 'India', law: 'Bharatiya Sakshya Adhiniyam 2023, s.63', mode: 'certificate' },
    { code: 'CN', country: 'China', law: 'Supreme People’s Court Internet Courts Provisions, art.11', mode: 'authentication' },
    { code: 'HK', country: 'Hong Kong', law: 'Electronic Transactions Ordinance 2000', mode: 'equal' },
    { code: 'MO', country: 'Macao', law: 'Electronic transactions law (2004)', mode: 'equal' },
    { code: 'SG', country: 'Singapore', law: 'Evidence Act, s.116A', mode: 'presumption' },
    { code: 'MY', country: 'Malaysia', law: 'Evidence Act 1950, s.90A', mode: 'certificate' },
    { code: 'PH', country: 'Philippines', law: 'Rules on Electronic Evidence, A.M. 01-7-01-SC', mode: 'authentication' },
    { code: 'KR', country: 'South Korea', law: 'Framework Act on Electronic Documents and Transactions', mode: 'equal' },
    { code: 'TH', country: 'Thailand', law: 'Electronic transactions law (2019)', mode: 'equal' },
    { code: 'VN', country: 'Vietnam', law: 'Law on Electronic Transactions 2005', mode: 'equal' },
    { code: 'LK', country: 'Sri Lanka', law: 'Electronic transactions law (2017)', mode: 'equal' },
    { code: 'PK', country: 'Pakistan', law: 'Electronic Transactions Ordinance 2002', mode: 'equal' },
    { code: 'BD', country: 'Bangladesh', law: 'Electronic transactions law (2006)', mode: 'equal' },
    { code: 'BN', country: 'Brunei', law: 'Electronic transactions law (2000)', mode: 'equal' },
    { code: 'KH', country: 'Cambodia', law: 'Electronic transactions law (2019)', mode: 'equal' },
    { code: 'LA', country: 'Laos', law: 'Electronic transactions law (2012)', mode: 'equal' },
  ] },
  { region: 'Oceania', items: [
    { code: 'AU', country: 'Australia', law: 'Evidence Act 1995, ss.146–147', mode: 'presumption' },
    { code: 'NZ', country: 'New Zealand', law: 'Electronic Transactions Act 2002', mode: 'equal' },
    { code: 'FJ', country: 'Fiji', law: 'Electronic transactions law (2017)', mode: 'equal' },
    { code: 'WS', country: 'Samoa', law: 'Electronic transactions law (2008)', mode: 'equal' },
    { code: 'PG', country: 'Papua New Guinea', law: 'Electronic transactions law (2022)', mode: 'equal' },
    { code: 'VU', country: 'Vanuatu', law: 'Electronic transactions law (2000)', mode: 'equal' },
    { code: 'KI', country: 'Kiribati', law: 'Electronic transactions law (2021)', mode: 'equal' },
    { code: 'MH', country: 'Marshall Islands', law: 'Electronic transactions law (2025)', mode: 'equal' },
  ] },
];

export const faqs = [
  { q: 'What does Celia do, and what does the lawyer do?', a: 'Celia is the case bank: it holds the wallets of those defrauded and the sealed evidence, and pools the claims into one case. The lawyer or law firm takes it from there: they run the case in their own court and settle with the victims. Celia holds no funds, runs no cases and pays no one.' },
  { q: 'Does Celia hold my money?', a: 'No. Celia is a case bank. It holds the wallet addresses of those defrauded and the evidence, not funds. Any recovery is handled by the lawyer or firm running the case.' },
  { q: 'How does the lawyer get paid?', a: 'The fee is agreed and set under the rules of the lawyer’s jurisdiction. When a case settles or succeeds, the lawyer or firm takes its share and the victims are paid, as the settlement terms allow.' },
  { q: 'Do you declare fraud?', a: 'No. We establish falsity and loss from the chain, evidence knowledge, and collect reliance from the victims themselves. The court decides intent. Each finding states what is proven and what is not proven.' },
  { q: 'Is it free to report fraud?', a: 'Reporting is the first step. Fees are set by the lawyer or firm that takes your case, under the rules of your jurisdiction.' },
  { q: 'Will I get my money back?', a: 'We can’t promise an outcome. We build the strongest evidence we can and put it in front of a lawyer. If a case settles or succeeds, the lawyer or firm handles the recovery, as the settlement terms allow.' },
  { q: 'How do I spot a fake recovery service?', a: 'Celia never asks you for money, a seed phrase or a wallet connection, and never promises to recover funds. Be wary of anyone who contacts you first, asks for an upfront fee, or claims to be partnered with a government agency. The FBI has warned that fake law firms target people who have already lost money.' },
  { q: 'Who sees my video?', a: 'Your video is shared with the lawyer or firm handling your case. It is not published.' },
  { q: 'How are lawyers matched?', a: 'By jurisdiction and practice area. Any lawyer or firm that can take the case can run it, wherever they practise.' },
  { q: 'Why commit the method onchain first?', a: 'The claim, the tests and the thresholds are hashed and committed to a smart contract before any data is touched. That shows the method was not tuned after seeing the results, so nobody can say we went looking for a finding.' },
  { q: 'Which jurisdictions are covered?', a: 'The product is global and the legal layer is a set of swappable jurisdiction modules. Nigeria is the deepest, built around Evidence Act 2011, Section 84. The United States module follows Federal Rules of Evidence 902(13) and 902(14), pending US counsel review.' },
];
