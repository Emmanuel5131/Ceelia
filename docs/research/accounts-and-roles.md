# Accounts, roles and onboarding: who uses Celia and what we collect

Research for `apps/web`. Questions: who are the different people on the platform, what should we ask at sign-up, should we use Clerk Organizations, how have comparable products done it, and what does each person get on the dashboard?

**Decisions (2026-10):**
- Two account types, person and counsel, in the Upwork style: one login, separate reviewed profiles. A person can add a researcher profile later.
- A lawyer cannot report a loss from the same account (use a second email).
- **The case bank is public.** Anyone can see the summary (platform, jurisdiction, size, status). Claimant data is never public.

**Built so far:** the account type and the onboarding screens (`/onboarding`), the gate that sends anyone with no account type there, counsel starting as `pending`, and the type-aware navigation. Not built: Clerk Organizations for firms (turn Organizations on in the Clerk dashboard first), our own database tables (onboarding details sit in Clerk `privateMetadata` until then), the researcher profile, the staff verification queue, and the public case bank page.

**Status of the rest:** a recommendation, not built yet. Facts about other products and about Clerk come from public pages (linked at the end). Where I could not confirm something, I say so.

**Revision:** the first version had four fixed roles (victim, lawyer, researcher, analyst). This version follows the suggestion to make "victim" a plain person account that can also be a researcher, and to keep lawyer or firm as its own path.

---

## 1. The short answer

1. **Two kinds of account, not four roles.**
   - A **person** account. Anyone who signs up as an individual. A victim is just a person with a claim. The same person can also apply to be a **researcher**. No separate "victim" account type.
   - A **counsel** account: a lawyer, who always belongs to a **firm** (an independent lawyer is a firm of one).
2. **Capabilities stack for people, not for counsel.** A person starts able to report a claim. They can add a researcher profile later (reviewed by staff). A lawyer's account is counsel only: to report a loss of their own they use a second email. This keeps the access rules simple, and avoids a lawyer seeing both sides of a case.
3. **Ask almost nothing at sign-up.** Email or Google through Clerk, then one question: "Report a loss" or "I'm a lawyer or firm". The rest is asked when a feature needs it.
4. **Use Clerk Organizations only for firms.** People are never in an organization.
5. **Clerk holds identity; our own database holds everything else:** profiles, verification status, cases, claims, assignments, evidence, audit log.
6. **Lawyers and researchers are verified by staff** before they get what the role unlocks. Self-selecting is not enough.
7. **Fix one thing now:** `parseRole` in `apps/web/src/utils/Role.ts` defaults to `lawyer` when no role is set. A new sign-up with no choice would see the lawyer view. That is the wrong default, because lawyers see victim data. No account type should mean onboarding, and nothing else.
8. **A conflict rule is needed:** a person cannot review or analyse a case in which they are a claimant, and counsel cannot take a case in which they are one.

---

## 2. How comparable products do it

| Product | Model | What it tells us |
|---|---|---|
| **Upwork** | One login, separate **profiles**: freelancer, client, agency. You add the other profile from settings and move between them from the profile menu. A new freelancer profile is reviewed first. Several accounts are against its terms. | Matches the suggestion: one person, several profiles, with review for the profile that carries trust. |
| **HackerOne** | The same login has a **hacker view** and **organization views**; a profile menu switches between them and an organization dropdown switches between organizations you belong to. | Researcher and company sides in one login, with a clear switch. The docs I found do not say how permissions are split, so I only rely on the switching idea. |
| **GitHub** (from my own knowledge, not checked in this session) | A person account that can belong to many **organizations**, each with its own members and roles. | The standard shape of "people are accounts, firms are organizations". It is how Clerk Organizations is meant to be used. |
| **Chainabuse** (TRM Labs) | A public report form. Reports are public, are **not** a confidential legal channel, and are not filed with law enforcement for the user. Victims can opt in to be contacted. I could not confirm whether an account is required. | The contrast with Celia: they alert the space, we hold a case file for counsel. We keep claimant data private, so we cannot copy a public-report model. |
| **Lawyer intake pages and class-action sign-ups** | Mostly a firm's own contact form, or opt-in claims run by one firm. I found no platform that vets many lawyers the way Celia would. | Few direct precedents. Also a warning: "no recovery, no fee" pitches are a common follow-up scam on victims, so how we verify counsel and what we say about fees must be careful. |

Takeaway: **one login with separate, reviewed profiles** is common and well understood (Upwork, HackerOne). The firm as an organization (GitHub) is the normal pattern for the lawyer side. I did not find a close competitor to copy for the verification step, so that part is ours to design.

---

## 3. The people and what they can do

| | Person (default) | Person + researcher profile | Counsel (firm member) | Celia staff |
|---|---|---|---|---|
| Report a claim, prove a wallet, follow own case | Yes | Yes | No (use another email) | n/a |
| See other claimants' statements and identities | No | No | Yes, for cases their firm took | Logged access |
| Review the method, add analysis | No | Yes, once approved | No | Yes |
| Browse the case bank | Summary only | Yes, no claimant data | Yes, in their jurisdictions | Yes |
| Take a case | No | No | Yes, once verified | n/a |
| Verify people, pool and merge claims, take down | No | No | No | Yes |

Notes:
- **Counsel and the firm.** The firm is the owner of the cases it takes, so if a lawyer leaves, the cases stay. A firm admin invites colleagues.
- **Staff** is not self-service. Set it from Clerk or a script and require two-factor authentication.
- **Co-counsel:** start with one firm per case. How a firm takes a case, the 5-open-cases limit and conflicts inside a firm are in `taking-a-case.md`.

---

## 4. What to collect

**Principle:** data minimisation. Every field must have a stated use (GDPR, Nigeria's NDPA and most other regimes expect this, and it protects victims if Celia is breached or subpoenaed).

### At sign-up
- Email or Google, name (Clerk).
- One choice: **Report a loss** or **I'm a lawyer or firm**.

### Person (victim by default)
| When | What | Why |
|---|---|---|
| Onboarding | Country (and state or province where it matters) | To route the case to counsel admitted there |
| Onboarding | Consent to share the claim with the counsel who takes the case, with a timestamp and wording version | Lawful basis; matches the rule that the statement and the wallet-to-identity link go only to the handling counsel |
| First claim | Platform name, wallet address, a signed message from the wallet | Proves ownership without ID documents |
| Later, optional | Screenshots, links, notes | Reliance evidence counsel asks for (see `case-submission-and-reports.md`) |

**Do not collect:** ID documents, phone, home address or date of birth. If counsel needs identity checks, that is between counsel and their client.

### Researcher profile (added later by a person)
| What | Why |
|---|---|
| Public handle, optional affiliation, links (GitHub, X, an explorer profile) | Credibility for the work they publish |
| Declaration of any interest in the platforms they review | Conflict of interest, so the findings hold up |
| Agreement to the method and code of conduct | They work to the sealed method |

Status `pending` until staff approve. A researcher never needs victim data.

### Counsel
| What | Why |
|---|---|
| Full name, work email on the firm's domain | Identity, and a signal the firm is real |
| Firm name (or "independent", which creates a firm of one) | The organization that owns the cases |
| **Jurisdictions admitted in** and the registration number for each | Matches cases to people; the basis for verification (reuse the `@celia/jurisdictions` picker) |
| Agreement to the terms: Celia holds no funds, charges no fee and does not pay counsel; any fee is an agreement between counsel and the client | Matches the product and the copy rules |
| Confirmation that they run their own conflict checks | Responsibility stays with counsel |

Status `pending`. A pending lawyer can see the case bank in summary form (platform, jurisdiction, size) but **no claimant data** until staff verify the registration.

---

## 5. Clerk Organizations or something else?

**What Organizations is for:** B2B apps where each customer is a tenant with members and roles. It gives invitations, an organization switcher, member management and two default roles, `admin` and `member`. Custom roles and permissions exist but need a paid add-on in production.

**Does Celia fit that model?** Only in part. The case bank is **shared**: lawyers from different firms look at the same pool. It is not one silo per tenant. What a firm needs is narrower: a group that owns the cases it took, with an admin who can invite colleagues. That is a membership group, which Organizations does well.

| Option | What it means | Good | Bad |
|---|---|---|---|
| A. Everyone a plain user, role in metadata | No organizations | Simplest | No shared firm workspace; firms would share a login or we build teams |
| **B. People are plain users; one Clerk Organization per firm (recommended)** | Account type in `publicMetadata`; only counsel create or join an organization | Invitations, member list, admin vs member for free | Free-tier limits (below) |
| C. Everyone in an organization | Organizations as the universal container | One model | Wrong for victims (privacy), and inflates the active-organization count |
| D. Build teams in our own database | Our own firm and member tables | Full control, no per-organization cost | We build invitations, roles and edge cases |
| E. Another provider (for example WorkOS) | Swap identity | Enterprise SSO is first-class | Rework of the sign-in we just built, for no present need |

**Recommendation: B, with our own database as the source of truth.**
- **Account type** lives in `publicMetadata` (a small value such as `person` or `counsel`), **set server-side only**. Never store it in `unsafeMetadata`, which the user can write.
- **Researcher** status is a profile row in our database with a status; route checks read it from there, or from a small mirrored flag in the session.
- **Firms:** a Clerk Organization per firm. Default `admin` is the firm admin and `member` a lawyer. That is enough to start, so we avoid the custom-roles add-on.
- **Verification** is our own status field, not a Clerk role.
- **Switching view:** a person who is also a researcher gets a "Researcher" area in the sidebar (HackerOne-style), not a second login.

**Limits and cost to confirm before launch** (from Clerk's pricing page; check the live page):
- The free tier lists 100 monthly active organizations and up to 5 members per organization. A firm with more than 5 lawyers needs the paid plan.
- Verified domains, automatic invitations and custom roles are in a paid add-on (around $100 a month in the pages I found).
- Organizations with no active member are not counted. People never create one, so the count follows the number of active firms.

**When to revisit:** a large firm asks for SAML single sign-on, or we need roles beyond admin and member (for example "can export evidence" vs "read only").

**Onboarding flow.** A gate sends anyone with no account type to `/onboarding`. It reads a flag from the session token (Clerk documents this pattern with `sessionClaims.metadata`), so it does not hit the database on every request. Finishing onboarding writes the account type and the flag from a server action.

---

## 6. What each person gets on the dashboard

Builds on `docs/research/dashboard-research.md` §4.

### Person
- **Overview:** claim status; one primary action, Report a loss.
- **My claims:** a plain-language stepper per claim (wallet, ownership signature, their account of what happened, pooled case, taken by counsel).
- **My case:** status and the firm that took it, once there is one. A count of other claimants, never their details.
- **My data:** download or delete my claim.
- **Notifications, Settings** (theme, language, account, and "Become a researcher").

### Researcher area (a person who has been approved)
- **Review queue** and **My analyses.**
- **Case bank:** read-only, without claimant data; cases where they are a claimant are hidden from their review queue.

### Counsel
- **Overview:** new cases in my jurisdictions, my open cases, claimants waiting.
- **Case bank:** the table we built, filtered to the jurisdictions the lawyer is admitted in.
- **Case detail (the evidence file):** summary, confirmed and not confirmed findings, claimants, evidence and hashes, timeline, activity.
- **Take this case:** assigns it to the firm. Needs a rule for two firms wanting the same case.
- **My cases, Firm** (members and invitations), **Export** (court-ready evidence pack with hashes and the method reference).
- **Notifications, Settings.**

### Celia staff (an area not yet planned)
- **Verification queue:** approve or reject lawyers and researchers.
- **Claims and cases:** pool, merge, split, take down.
- **Audit log:** every staff action and every access to claimant data.
- **Requests:** a record of legal requests we receive and how we answered.

### Who sees what
| Data | Person (own) | Counsel (verified, case taken by their firm) | Other counsel | Researcher | Staff |
|---|---|---|---|---|---|
| Own statement | Yes | Yes | No | No | Logged access |
| Other claimants' statements and identities | No | Yes, for their case | No | No | Logged access |
| Count of claimants | Yes | Yes | Yes | Yes | Yes |
| Findings and method | Yes | Yes | Yes | Yes | Yes |
| Firm's internal notes | No | Own firm only | No | No | No |

---

## 7. Suggested build order

1. **Close the default:** no account type means onboarding, not the lawyer view.
2. **Onboarding** for the two paths, writing the account type server-side. Counsel first (the product's value), then person.
3. **Our database:** profiles, firms, verification status, then cases, claims and assignments.
4. **Firm organizations** (Clerk) and the Firm screen.
5. **Staff area:** the verification queue first, since nothing else is safe without it.
6. **Real data** in the case bank and overview, replacing the sample data.
7. **Claim flow**, then the researcher profile, then the evidence export.

---

## 8. Questions to settle

1. ~~Is the case bank public?~~ Decided: yes, summary only.
2. **Who pools claims into a case?** Automatically by platform, or a coordinator on staff?
3. **Can more than one firm work one case?** I suggest one at first.
4. **How do we verify lawyers?** Manual review of the registration number against the public bar register is the realistic start.
5. ~~Can a lawyer also report a loss?~~ Decided: no, only with a second email.
6. **Do victims see who took their case?** I suggest yes, the firm name only.
7. **Which data law governs us?** NDPA, GDPR or both; confirm with counsel.

---

## Sources

- Upwork Help, [Be a client and a freelancer](https://support.upwork.com/hc/en-us/articles/211067558-Be-a-Client-and-a-Freelancer): one login with separate profiles, a new freelancer profile is reviewed, several accounts are against the terms.
- HackerOne Docs, [Organization navigation](https://docs.hackerone.com/en/articles/8365330-organization-navigation): the profile menu switches between hacker and organization views; an organization dropdown switches between organizations.
- TRM Labs, [Chainabuse documentation](https://docs.trmlabs.com/guides/chainabuse/offering-scam-support): public reports, not a confidential legal channel, opt-in contact from law enforcement.
- Clerk, [Roles and permissions](https://clerk.com/docs/guides/organizations/roles-and-permissions), [Organization metadata](https://clerk.com/docs/guides/organizations/metadata) and [Pricing](https://clerk.com/pricing).
- Product rules from `docs/legal-hack-context.md` and `.agent/legal-copy-reviewer.md`: Celia holds no funds, pays no one, does not declare fraud, and shares a victim's statement and identity link only with the handling counsel.
