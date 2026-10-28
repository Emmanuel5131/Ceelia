# What kinds of crypto fraud are reportable, and what that means for the claim form

Research for `apps/web`. Question: which crypto frauds happen most, which of them does a pooled case bank fit, and how should the claim form be built around that instead of around "a wallet and a platform"?

**Written for:** you and your co-founders. **Method and limits:** public sources only. Figures that come from news coverage of a report, not the report, are marked. Details of lawsuits come largely from plaintiff firms' own press releases, so they are allegations. The FBI report PDF (`ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf`) and the Chainalysis report are the authoritative sources; I did not read them directly.

---

## 1. What is most common, and what it costs

| Source | What it says |
|---|---|
| **FBI IC3, 2025 report** (reported by [The Block](https://www.theblock.co/amp/post/397134/fbi-says-crypto-related-fraud-losses-hit-record-11-4-billion-in-2025-with-seniors-bearing-the-brunt) and [HSToday](https://www.hstoday.us/subject-matter-areas/cybersecurity/cryptocurrency-and-ai-scams-cost-u-s-almost-21-billion-in-2025-according-to-new-fbi-internet-crime-report/)) | 181,565 crypto-related complaints and about $11.4B in losses. **Crypto investment fraud alone: $7.2B**, the largest category. Crypto ATM scams: about $389M, up 58%. **Recovery scams** (people re-targeted after a loss): over 10,500 complaints and about $1.4B. People 60 and over: 44,555 complaints and $4.4B. |
| **Chainalysis, 2026 report** (secondary coverage by [Cointelegraph](https://cointelegraph.com/news/crypto-scams-2025-ai-impersonation-fraud-chainalysis) and [Decrypt](https://decrypt.co/354624/ai-impersonation-drove-crypto-scam-losses-record-17-billion-2025-chainalysis?amp=1)) | At least $14B in scam revenue on chain in 2025, expected to pass $17B. Average payment up 253%. Impersonation scams up about 1,400%. Investment and "pig butchering" scams increasingly mix in impersonation and wallet-focused tactics. |
| **Chainabuse's own categories** ([TRM docs](https://docs.trmlabs.com/guides/chainabuse/scam-categories.md)) | 16 categories in four groups: *blackmail* (sextortion, ransomware), *fraud* (impersonation, romance, pig butchering, NFT airdrop, donation impersonation, other phishing), *investment* (fake project, fake returns, rug pull), *hacks* (SIM swap, contract exploits, other hacks). |

**Reading across them:** the money is in **investment fraud** (a platform or scheme that promises returns and then blocks withdrawals), usually started by **impersonation or a romance approach** (pig butchering), with **recovery scams** layered on top of the same victims afterwards. Hacks and drained wallets are common too but are a different kind of harm.

## 2. Not every loss is a reportable fraud

You are right that not everything in crypto is "a protocol". Sorting the losses by what a lawyer can actually do:

| Kind of loss | Is there someone to pursue? | Fit for Celia |
|---|---|---|
| **Fake investment platform, Ponzi, "fake returns"** | Yes: an operator, a company, often a bank or exchange that handled the money | **Best fit.** Many victims, one operator |
| **Rug pull / fake token project** | Sometimes: the team. There is no crypto-specific US statute; prosecutors use wire fraud, securities and money-laundering law ([TokenTax](https://tokentax.co/blog/are-crypto-rug-pulls-illegal)). "Hard" rug pulls are illegal; "soft" ones may only be unethical | **Good fit** when the contract and the team can be identified |
| **Exchange or custodial service that froze or lost funds** | Yes: the company | **Good fit** |
| **Impersonation, romance, fake support** | The individual scammer, often abroad; but the same wallets and the same script hit many people | **Fit by pattern.** Pool by receiving address, not by a company name |
| **Recovery scam** | The "recovery firm" | **Good fit**: a named operator who took a second payment |
| **Wallet drained, phishing, address poisoning, SIM swap, hack by an unknown attacker** | Often nobody, unless a provider with a duty is involved. Example: the Atomic Wallet class action, where about 50 clients with losses of roughly $12M of a $100M hack were organised through lawyers and a blockchain analysis firm ([CryptoPotato](https://cryptopotato.com/class-action-lawsuit-filed-against-atomic-wallet-after-a-12-million-loss-report/)) | **Weaker fit.** Accept the report; be honest that a lawyer needs a defendant |
| **Crypto ATM scam** | The scammer, and sometimes the kiosk operator | **Fit, but the victim has no wallet** (cash went in at a machine) |
| **Market losses, a token falling, a failed project with no misrepresentation** | No | **Out of scope.** Say so plainly |
| **Sextortion, ransomware** | Not a pooled civil claim | **Out of scope** for the case bank |

## 3. Real cases where a pooled case bank was needed

These show the pattern Celia is built for: many victims, one operator, and the evidence and the victim list built late and by hand.

- **CBEX (Nigeria, April 2025).** Alleged Ponzi promising 100% in 30 days, unregistered with the SEC, where users had to recruit at least 12 people to withdraw. Estimates of the loss run to about ₦1.3 trillion and about 600,000 investors, but TechCabal said it could only verify losses of hundreds of thousands of dollars, so the trillion figure is unverified. The SEC said "there is nothing the commission can do" to recover funds ([TechCabal](https://techcabal.com/2025/04/15/cbex-ponzi-collapse-nigeria/), [ThisDay](https://www.thisdaylive.com/2025/04/20/no-hope-for-600000-cbex-victims-as-agama-says-sec-cant-recover-lost-n1-3tn-funds/)). This is the lead market and the clearest example: a very large, scattered group, with no organised legal route.
- **Mirror Trading International (South Africa, 2020 onward).** Victims were pushed into a liquidation process. The liquidators had to ask the court how to value Bitcoin deposits in rand: at deposit day or at closure. Anyone who had withdrawn more than they put in was excluded from the recovery deal. A US order required over $1.7B in restitution ([BehindMLM](https://behindmlm.com/companies/mirror-trading-international/mti-victims-offered-recovery-deal-ponzi-hearing-postponed), [CFTC](https://cftc.gov/node/247131)). **What it teaches the form:** per-victim *what was paid in, when, and what was taken out* decides who recovers what. That must come from the chain, not memory.
- **Goliath Ventures (US, 2026).** Alleged $328M Ponzi from over 2,000 investors; a class action within weeks of the arrest, later extended to banks and advisers ([Class Law Group](https://classlawgroup.com/goliath-ventures-faces-class-action-lawsuit-over-alleged-328-million-ponzi-scheme)). Money moved through both bank accounts and wallets, so tracing both is central.
- **Atomic Wallet (2023).** A hack, not a fraud by an operator, but the lawyers still had to gather victims one by one and hire analysts ([CryptoPotato](https://cryptopotato.com/class-action-lawsuit-filed-against-atomic-wallet-after-a-12-million-loss-report/)). It shows the same gap for hacks that have a defendant.
- **Nigerian crypto and romance syndicates (2024 to 2025).** One EFCC operation led to 792 arrests; the money moved partly through peer-to-peer trades; the agency had not said how much was stolen ([Guardian Nigeria](https://guardian.ng/news/nigeria/metro/efcc-arraigns-42-foreigners-firm-over-792-cryptocurrency-romance-fraud/), [Decrypt](https://decrypt.co/297099?p=297099)). Victims are scattered across countries and nobody holds the list.

## 4. What this changes in the form

The first version asked: *chain, wallet, platform name*. That fits a Ponzi paid from the victim's own wallet. It does not fit a large share of the cases above. Four problems:

1. **"Platform" is the wrong pooling key for many frauds.** For an impersonation scam there may be no company. The thing the victims share is **where the money went** (receiving addresses), a **website or handle**, or a **token contract**.
2. **Not everyone paid from their own wallet.** Paid from an exchange, a crypto ATM, or a peer-to-peer purchase: there is no wallet to sign with. These victims have a **transaction hash or a receipt** instead.
3. **People cannot tell us the fraud's name.** They know what happened to them. The form should ask that in plain words and work out the type.
4. **The most useful details differ by type.** A rug pull needs the token contract; an investment platform needs the website and how the contact started; a recovery scam needs the recovery firm.

### The refined form: four short questions

**1. What happened?** (pick one, in plain words)

| Choice | Covers |
|---|---|
| I put money into an **investment platform or scheme** | fake trading sites, Ponzi, "fake returns", pig butchering |
| I bought a **token or NFT** and the team disappeared | rug pull, fake project |
| An **exchange or wallet service** froze or lost my funds | custodial platforms |
| **Someone pretended to be someone else** | impersonation, fake support, romance, giveaway |
| A **recovery service** took a fee | recovery scam |
| My **wallet was drained** | phishing, drainer, address poisoning, SIM swap |
| Something else | |

Add one honest line under it: *Celia works best when many people were affected by the same operator. We can't promise a lawyer takes any case.*

**2. How did you pay?** From **my own wallet** (wallet address and chain, and I can prove it by signing) | from an **exchange account** | at a **crypto ATM** | by **buying from a person** (peer to peer). For all but "my own wallet", ask for the **transaction hash** of the payment instead of the wallet.

**3. Who took the money?** Name (or "I don't know"), website, Telegram or social handle, and, for tokens, the **contract address**. Any of these can link claims together, not just the name.

**4. Your account.** Free text, with a hint written for the type (for an investment platform: what returns were promised, who told you, when withdrawals stopped, whether you were asked for a fee or tax). Optional: how it started (dating app or social, Telegram or WhatsApp, an ad or influencer, a friend, a call or message), and roughly how much was lost.

**Pooling.** Claims join a case when they share **any strong identifier**: the website domain, the receiving address that the transaction hashes lead to, the token contract, or the normalised name. A person's own wallet is never a pooling key.

**Honest scoping on screen.** For "my wallet was drained" with no operator to name: file it, say it helps the pattern, and say plainly that a lawyer needs someone to pursue. For market losses and blackmail: a short note on what Celia is not for, before they fill anything in.

## 5. Questions to settle with the lawyer co-founder

1. **Is the type list right,** and does it match how a lawyer groups cases in Nigeria and the US? Some may want "securities fraud" and "wire fraud" language. I used plain words on purpose.
2. **Do we accept ATM and exchange-paid claims?** I think yes; ownership then shows as "not confirmed".
3. **How strictly do we scope out?** Do we refuse market losses and blackmail at the first question, or file and flag them?
4. **A recovery scam is also a victim of the first fraud.** Do we link the two claims for one person?
5. **Whose name goes on the file** when the operator is unknown: nothing, until the chain shows who received the money?
