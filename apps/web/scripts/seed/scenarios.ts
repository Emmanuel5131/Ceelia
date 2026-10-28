import type {
  ChainId,
  ContactChannel,
  FraudType,
  PaymentMethod,
  WalletApp,
  WalletType,
} from '@celia/core';

/**
 * The kinds of case the seed makes, one or more for every fraud type. Each is modelled on how a documented case unfolded, so the
 * app is used on realistic shapes: where victims met the operator, how they paid, what they lost and what they say happened.
 *
 * Operators, victims, wallets and transactions are invented. No real company, person or address appears here, and the statements
 * are written for the seed, not copied from anyone. Only the pattern and the order of size come from the source, so nothing in the
 * seed can be read as a statement about a real party. Loss sizes are approximate: a median in the range of what the source reports.
 */
export type Scenario = {
  id: string;
  /** Share of cases, roughly following how much each kind of fraud is reported to lose. */
  weight: number;
  /** How many claims a case like this gathers: the middle, and how wide it spreads. Most are small; a few run to hundreds. */
  size: { median: number; spread: number };
  /** How the operator is named. `{w}` is an invented word and `{h}` a short code, for operators nobody can name. */
  names: string[];
  fraudType: FraudType;
  /** Other kinds the same victims say fit. */
  alsoFits?: FraudType[];
  /** How money left, with weights. Only `wallet` can be signed for. */
  payment: [PaymentMethod, number][];
  channels: ContactChannel[];
  chains: [ChainId, number][];
  /** What was sent, by chain family when the chain has a usual one. */
  assets: string[];
  /** The middle of what claimants report losing, in dollars. */
  medianLoss: number;
  /** How wide losses spread; 0.6 is tight, 1.4 is wide. */
  spread: number;
  /** What the operator named a handle on, such as Telegram, when the scam ran on messages. */
  handle?: boolean;
  /** The case has a token: a contract and a name. */
  token?: boolean;
  /** Typical wallet the victim used. Drainers and phishing hit browser wallets. */
  wallets?: { type: WalletType; app: WalletApp }[];
  /** The victim's own words, several to vary. */
  statements: string[];
  /** For `other`, what the person says it was. */
  description?: string;
  /** The public source the pattern comes from, when one was checked. */
  source: { title: string; url: string } | null;
};

export const scenarios: Scenario[] = [
  {
    id: 'pig-butchering',
    weight: 24,
    size: { median: 70, spread: 1.2 },
    names: ['{w} Capital', '{w} Yield', '{w} Wealth', '{w} Trading', '{w} Invest'],
    fraudType: 'investment_platform',
    alsoFits: ['romance_scam'],
    payment: [
      ['wallet', 5],
      ['exchange', 4],
      ['p2p', 1],
    ],
    channels: ['messaging', 'social_dating', 'search'],
    chains: [
      ['tron', 6],
      ['ethereum', 3],
      ['bsc', 2],
    ],
    assets: ['USDT', 'USDC'],
    medianLoss: 40_000,
    spread: 1.2,
    handle: true,
    statements: [
      'Someone messaged me by mistake and we kept talking for weeks. They showed me an app where their trades made money and I put in a small amount. It grew, I added more, and when I tried to withdraw I was told to pay tax first.',
      'A friend I met online taught me to trade on a platform they said was run by a known firm. I deposited several times. The balance looked large but the withdrawal always needed one more fee.',
      'I was added to a trading group by a woman who said she had made her savings back. I sent funds from my exchange account to the address on the platform. The account was frozen when I asked for my money.',
    ],
    source: {
      title:
        'US DOJ: sentenced to 20 years for role in $73 million global cryptocurrency investment scam',
      url: 'https://www.justice.gov/opa/pr/man-sentenced-20-years-prison-role-73-million-global-cryptocurrency-investment-scam',
    },
  },
  {
    id: 'withdrawal-blocked-ponzi',
    weight: 8,
    size: { median: 120, spread: 1.3 },
    names: ['{w} Global', '{w} Capital Group', '{w} Network', '{w} Miners', '{w} Fund'],
    fraudType: 'investment_platform',
    payment: [
      ['wallet', 6],
      ['exchange', 3],
    ],
    channels: ['referral', 'ad_influencer', 'messaging'],
    chains: [
      ['bitcoin', 3],
      ['ethereum', 3],
      ['tron', 2],
    ],
    assets: ['BTC', 'ETH', 'USDT'],
    medianLoss: 12_000,
    spread: 1.1,
    statements: [
      'A relative told me about a company that paid a fixed return each week. The first payouts arrived. Then the website said withdrawals were paused for upgrades and has said so since.',
      'I joined through a promoter at a seminar and bought into a package. The dashboard showed daily profit but every withdrawal request stayed pending, and support asked me to recruit others to unlock it.',
    ],
    source: {
      title: 'US DOJ: sentenced for crypto Ponzi scheme (IcomTech); victims could not withdraw',
      url: 'https://www.justice.gov/usao-sdny/pr/fraudster-sentenced-71-months-prison-crypto-ponzi-scheme-icomtech',
    },
  },
  {
    id: 'fake-exchange',
    weight: 6,
    size: { median: 40, spread: 1.1 },
    names: ['{w} Exchange', '{w} Swap', '{w} Markets', '{w} Pro'],
    fraudType: 'exchange_service',
    alsoFits: ['investment_platform'],
    payment: [
      ['exchange', 5],
      ['wallet', 3],
    ],
    channels: ['search', 'call_text_email', 'ad_influencer'],
    chains: [
      ['tron', 4],
      ['ethereum', 3],
      ['bitcoin', 2],
    ],
    assets: ['USDT', 'BTC'],
    medianLoss: 15_000,
    spread: 1,
    statements: [
      'I found the trading site through an advert and an adviser called me every day. I deposited to the address shown. After my balance doubled I could only withdraw by paying a verification deposit.',
      'The site copied a well-known exchange. They let me take out a small test withdrawal, then asked for a larger deposit to remove a limit on my account.',
    ],
    source: {
      title:
        'US DOJ: forfeiture action against fake trading platforms that impersonated a known exchange',
      url: 'https://www.justice.gov/usao-dc/pr/justice-department-seeks-forfeiture-848247-cryptocurrency-confidence-scams',
    },
  },
  {
    id: 'nft-rug-pull',
    weight: 6,
    size: { median: 60, spread: 1.1 },
    names: ['{w} Society', '{w} Collective', '{w} Genesis', '{w} Legends'],
    fraudType: 'rug_pull',
    payment: [['wallet', 1]],
    channels: ['ad_influencer', 'messaging', 'social_dating'],
    chains: [
      ['ethereum', 4],
      ['solana', 4],
      ['polygon', 1],
    ],
    assets: ['ETH', 'SOL'],
    medianLoss: 1500,
    spread: 0.9,
    handle: true,
    token: true,
    wallets: [
      { type: 'browser_extension', app: 'metamask' },
      { type: 'browser_extension', app: 'phantom' },
      { type: 'mobile_app', app: 'trust_wallet' },
    ],
    statements: [
      'I minted during the public sale after the team promised a game and a roadmap on Discord. Hours after the mint closed the server was deleted, the account was gone and the funds had moved.',
      'The founders kept hyping the project on social media until the mint sold out. Then they stopped replying, the site went offline and the liquidity was removed.',
    ],
    source: {
      title:
        'US DOJ (E.D.N.Y.): NFT developer pleads guilty to wire fraud conspiracy over a rug pull',
      url: 'https://www.justice.gov/usao-edny/pr/nonfungible-token-nft-developer-pleads-guilty-international-scheme-defraud-nft',
    },
  },
  {
    id: 'token-rug-pull',
    weight: 3,
    size: { median: 45, spread: 1.2 },
    names: ['{w} Inu', '{w} Coin', '{w} Finance', '{w} Moon'],
    fraudType: 'rug_pull',
    alsoFits: ['honeypot_token'],
    payment: [['wallet', 1]],
    channels: ['ad_influencer', 'messaging'],
    chains: [
      ['bsc', 4],
      ['ethereum', 2],
      ['base', 2],
    ],
    assets: ['BNB', 'ETH'],
    medianLoss: 900,
    spread: 1.1,
    handle: true,
    token: true,
    wallets: [
      { type: 'browser_extension', app: 'metamask' },
      { type: 'mobile_app', app: 'trust_wallet' },
    ],
    statements: [
      'I bought a new token after a large account posted it. The price went up for two days, then the developer wallet sold everything and the price fell to nearly zero.',
      'The team locked liquidity on the website but the lock was fake. Liquidity was pulled and I could not sell.',
    ],
    source: {
      title:
        'US DOJ (E.D.N.Y.): SafeMoon CEO sentenced to 100 months for fraud involving the token',
      url: 'https://www.justice.gov/usao-edny/pr/ceo-digital-asset-company-safemoon-sentenced-100-months-prison-multi-million-dollar',
    },
  },
  {
    id: 'honeypot',
    weight: 4,
    size: { median: 30, spread: 1 },
    names: ['{w} Token', '{w} Inu', '{w} Protocol', '{w} Rocket'],
    fraudType: 'honeypot_token',
    payment: [['wallet', 1]],
    channels: ['messaging', 'ad_influencer', 'other'],
    chains: [
      ['bsc', 4],
      ['ethereum', 2],
      ['solana', 2],
    ],
    assets: ['BNB', 'ETH', 'SOL'],
    medianLoss: 400,
    spread: 1,
    handle: true,
    token: true,
    wallets: [
      { type: 'browser_extension', app: 'metamask' },
      { type: 'browser_extension', app: 'phantom' },
    ],
    statements: [
      'I bought a token from a group call. The buy went through but every attempt to sell failed with an error, and others in the chat said the same.',
      'The chart looked healthy and many people were buying. When I tried to sell, the contract would not let me. Only the creator wallet could sell.',
    ],
    source: {
      title:
        'CFTC advisory: beware virtual currency pump-and-dump schemes (pattern; no single case reviewed)',
      url: 'https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/beware_virtual_currency_pump_dump.html',
    },
  },
  {
    id: 'government-impersonation-atm',
    weight: 8,
    size: { median: 10, spread: 0.9 },
    names: ['{w} Security Desk', '{w} Safe Transfer', '{w} Verification Unit'],
    fraudType: 'impersonation',
    payment: [
      ['atm', 6],
      ['exchange', 2],
    ],
    channels: ['call_text_email', 'messaging'],
    chains: [['bitcoin', 1]],
    assets: ['BTC'],
    medianLoss: 10_000,
    spread: 0.9,
    statements: [
      'A caller said they were from a government agency and that my accounts were part of a crime. They told me to withdraw cash and put it into a Bitcoin machine to keep it safe. I only understood it was a scam afterwards.',
      'A message said my bank account was compromised and a "security officer" stayed on the phone while I deposited cash at a crypto ATM to a wallet they gave me.',
    ],
    source: {
      title:
        'FTC data spotlight: Bitcoin ATMs, a payment portal for scammers (median loss about $10,000)',
      url: 'https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/09/bitcoin-atms-payment-portal-scammers',
    },
  },
  {
    id: 'romance',
    weight: 5,
    size: { median: 12, spread: 1 },
    names: ['{w} Connect', '{w} Circle', '{w} Match'],
    fraudType: 'romance_scam',
    alsoFits: ['investment_platform'],
    payment: [
      ['wallet', 3],
      ['exchange', 4],
      ['p2p', 1],
    ],
    channels: ['social_dating', 'messaging'],
    chains: [
      ['tron', 4],
      ['ethereum', 3],
      ['bitcoin', 2],
    ],
    assets: ['USDT', 'USDC', 'BTC'],
    medianLoss: 20_000,
    spread: 1.2,
    handle: true,
    statements: [
      'We met on a dating app and moved to a messaging app within days. After months of daily contact they said they could not access their funds and asked me to help with a transfer in crypto.',
      'She said she was working overseas and needed money for a customs fee. I sent it from my exchange account. There was always another reason to send more.',
    ],
    source: {
      title:
        'FBI IC3 2025 annual report: confidence and romance fraud losses (about $929 million reported)',
      url: 'https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf',
    },
  },
  {
    id: 'recovery-fake-law-firm',
    weight: 5,
    size: { median: 25, spread: 1 },
    names: ['{w} Recovery Group', '{w} Asset Recovery', '{w} Chain Trace', '{w} Legal Partners'],
    fraudType: 'recovery_scam',
    payment: [
      ['wallet', 3],
      ['exchange', 3],
      ['p2p', 1],
    ],
    channels: ['messaging', 'search', 'call_text_email'],
    chains: [
      ['tron', 4],
      ['ethereum', 2],
      ['bitcoin', 2],
    ],
    assets: ['USDT', 'BTC', 'ETH'],
    medianLoss: 5000,
    spread: 1,
    handle: true,
    statements: [
      'After I lost money, a law firm contacted me and said they had traced the funds. They asked for a fee and then a tax in crypto to release them. When I paid, they asked for more.',
      'I searched online for help getting my money back and was added to a group with a "recovery agent". He said a bank processor needed fees to verify my ownership. The fees kept rising.',
    ],
    source: {
      title:
        'FBI alert: fictitious law firms targeting cryptocurrency scam victims with recovery offers',
      url: 'https://www.fbi.gov/investigate/cyber/alerts/2025/fictitious-law-firms-targeting-cryptocurrency-scam-victims-combine-multiple-exploitation-tactics-while-offering-to-recover-funds',
    },
  },
  {
    id: 'wallet-drainer',
    weight: 6,
    size: { median: 80, spread: 1.3 },
    names: ['{w} Airdrop', '{w} Claim', '{w} Rewards', '{w} Mint'],
    fraudType: 'wallet_drained',
    alsoFits: ['phishing'],
    payment: [['wallet', 1]],
    channels: ['messaging', 'ad_influencer', 'search'],
    chains: [
      ['ethereum', 4],
      ['bsc', 2],
      ['solana', 2],
      ['arbitrum', 1],
    ],
    assets: ['ETH', 'USDC', 'SOL'],
    medianLoss: 700,
    spread: 1.3,
    wallets: [
      { type: 'browser_extension', app: 'metamask' },
      { type: 'browser_extension', app: 'phantom' },
      { type: 'browser_extension', app: 'rabby' },
      { type: 'mobile_app', app: 'trust_wallet' },
    ],
    statements: [
      'I connected my wallet to claim an airdrop from a link in a community chat. I approved one transaction and within minutes my tokens and NFTs were sent out to an unknown address.',
      'The site looked identical to the project I follow. After I signed the request my wallet was emptied.',
    ],
    source: {
      title:
        'The Hacker News: wallet-drainer service reported about $70 million across 103,676 victims (about $700 each)',
      url: 'https://thehackernews.com/2023/12/beware-scam-as-service-aiding.html',
    },
  },
  {
    id: 'phishing',
    weight: 4,
    size: { median: 25, spread: 1.1 },
    names: ['{w} Wallet Verify', '{w} Secure Sync', '{w} Wallet Support'],
    fraudType: 'phishing',
    payment: [
      ['wallet', 4],
      ['exchange', 2],
    ],
    channels: ['call_text_email', 'search', 'ad_influencer'],
    chains: [
      ['ethereum', 3],
      ['tron', 3],
      ['solana', 1],
    ],
    assets: ['ETH', 'USDT', 'SOL'],
    medianLoss: 900,
    spread: 1.2,
    wallets: [
      { type: 'browser_extension', app: 'metamask' },
      { type: 'mobile_app', app: 'trust_wallet' },
      { type: 'hardware', app: 'ledger' },
    ],
    statements: [
      'An email said my wallet needed verification and linked to a page that asked for my recovery phrase. I entered it and my funds were moved the same hour.',
      'I searched for my wallet app and clicked the top result, which was a copy of the site. After I imported my wallet there my balance went to zero.',
    ],
    source: {
      title:
        'FBI IC3 2025 annual report: cryptocurrency complaints (181,565 complaints, over $11 billion)',
      url: 'https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf',
    },
  },
  {
    id: 'address-poisoning',
    weight: 3,
    size: { median: 4, spread: 0.8 },
    names: ['Address cluster {h}'],
    fraudType: 'address_poisoning',
    payment: [['wallet', 1]],
    channels: ['other'],
    chains: [
      ['ethereum', 3],
      ['tron', 4],
      ['bsc', 1],
    ],
    assets: ['USDT', 'USDC'],
    medianLoss: 15_000,
    spread: 1.5,
    wallets: [
      { type: 'browser_extension', app: 'metamask' },
      { type: 'mobile_app', app: 'tronlink' },
      { type: 'hardware', app: 'ledger' },
    ],
    statements: [
      'I sent a small test transfer to my usual address, then copied the address from my history for the main payment. The first and last characters matched, but it was a lookalike that had sent me a tiny transfer earlier.',
      'The address I pasted came from a recent transfer in my wallet. It was not the right one and the full amount went to a stranger.',
    ],
    source: {
      title:
        'Forklog / Scam Sniffer: address-poisoning losses, including a single transfer of about $50 million',
      url: 'https://forklog.com/en/investor-loses-nearly-50-million-in-address-spoofing-attack/',
    },
  },
  {
    id: 'task-scam',
    weight: 6,
    size: { median: 50, spread: 1.2 },
    names: ['{w} Tasks', '{w} Rewards', '{w} Talent', '{w} Boost'],
    fraudType: 'fake_job',
    payment: [
      ['wallet', 3],
      ['exchange', 4],
    ],
    channels: ['messaging', 'call_text_email'],
    chains: [
      ['tron', 6],
      ['ethereum', 1],
      ['bsc', 1],
    ],
    assets: ['USDT'],
    medianLoss: 2500,
    spread: 1,
    handle: true,
    statements: [
      'I got a text about an online job rating products for commission. I was paid a little at first. To unlock the next set of tasks I had to deposit crypto, and each set needed a bigger deposit.',
      'The job was to like videos in an app. My balance showed earnings but a mentor said a negative balance had to be cleared before I could withdraw.',
    ],
    source: {
      title:
        'FTC data spotlight: gamified job scams drive record losses (crypto the main payment method)',
      url: 'https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/12/paying-get-paid-gamified-job-scams-drive-record-losses',
    },
  },
  {
    id: 'sim-swap',
    weight: 4,
    size: { median: 5, spread: 0.8 },
    names: ['Swap ring {h}'],
    fraudType: 'account_takeover',
    payment: [
      ['exchange', 5],
      ['wallet', 2],
    ],
    channels: ['other'],
    chains: [
      ['bitcoin', 3],
      ['ethereum', 3],
    ],
    assets: ['BTC', 'ETH'],
    medianLoss: 8000,
    spread: 1.3,
    statements: [
      'My phone suddenly lost service. By the time it came back my exchange account had been accessed and my balance withdrawn to an address I do not know. My carrier confirmed my number had been moved to another SIM.',
      'I got login alerts for my exchange account and could not stop them because the codes went to a number I no longer controlled. Everything was withdrawn in under an hour.',
    ],
    source: {
      title:
        'US DOJ (S.D.N.Y.): sentenced for a SIM-swap scheme that stole over $20 million in cryptocurrency',
      url: 'https://www.justice.gov/usao-sdny/pr/florida-man-sentenced-18-months-theft-over-20-million-sim-swap-scheme',
    },
  },
  {
    id: 'sextortion',
    weight: 3,
    size: { median: 10, spread: 0.9 },
    names: ['Blackmail ring {h}'],
    fraudType: 'extortion',
    payment: [
      ['wallet', 3],
      ['atm', 3],
      ['exchange', 1],
    ],
    channels: ['social_dating', 'messaging'],
    chains: [
      ['bitcoin', 4],
      ['ethereum', 1],
      ['tron', 1],
    ],
    assets: ['BTC', 'USDT'],
    medianLoss: 1200,
    spread: 0.9,
    statements: [
      'Someone I met on a social app sent me private images and then threatened to send mine to my contacts unless I paid in Bitcoin. I paid and they asked for more.',
      'I received a message saying they had a video of me and would publish it. They gave a wallet address and a deadline.',
    ],
    source: {
      title: 'FTC consumer alert: cryptocurrency blackmail scam',
      url: 'https://consumer.ftc.gov/node/76707',
    },
  },
  {
    id: 'exploit',
    weight: 2,
    size: { median: 120, spread: 1.2 },
    names: ['{w} Finance', '{w} Lend', '{w} Vault', '{w} Protocol'],
    fraudType: 'hack_exploit',
    payment: [['wallet', 1]],
    channels: ['other'],
    chains: [
      ['ethereum', 3],
      ['bsc', 2],
      ['arbitrum', 1],
    ],
    assets: ['ETH', 'USDC', 'BNB'],
    medianLoss: 3000,
    spread: 1.4,
    token: true,
    wallets: [
      { type: 'browser_extension', app: 'metamask' },
      { type: 'browser_extension', app: 'rabby' },
    ],
    statements: [
      'I had funds deposited in a lending protocol when it was exploited and the pool was drained. The team confirmed an attacker took funds but has given no plan for repayment.',
      'My liquidity position was in a pool that was attacked through a flaw in the contract. The position is now worth nothing.',
    ],
    source: null,
  },
  {
    id: 'other',
    weight: 1,
    size: { median: 5, spread: 0.8 },
    names: ['{w} Goods', '{w} Supply', '{w} Store'],
    fraudType: 'other',
    payment: [
      ['wallet', 3],
      ['p2p', 2],
    ],
    channels: ['other', 'referral'],
    chains: [
      ['ethereum', 2],
      ['tron', 2],
    ],
    assets: ['USDT', 'ETH'],
    medianLoss: 1000,
    spread: 1.2,
    description:
      'I paid a seller for a hardware wallet batch and the goods never arrived. The seller stopped answering after the payment.',
    statements: [
      'I paid for a service in crypto and it was never delivered. The seller blocked me afterwards.',
    ],
    source: null,
  },
];
