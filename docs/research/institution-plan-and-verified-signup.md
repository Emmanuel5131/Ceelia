# Institution plan and verified sign-up

Plan for how Celia earns money and how it lets professionals in. No code yet. This builds on `taking-a-case.md` (who can pay, and what the rules forbid) and `accounts-and-roles.md` (account types).

**Decisions (2026-10):**
- People reporting a loss use Celia **free, always**, through the ordinary sign-up.
- Institutions that use the tool (law firms, investigative firms and similar) pay a **flat fee or subscription**, and the price is **shown before they apply**, not after.
- A professional or institution does **not** use the ordinary sign-up. They apply through their own process, which checks that they are a real firm before anything is unlocked.

**Built so far (2026-10):** the public plan page (`/join`), the application inside onboarding (kind, registration number, website, role, with the plan shown first), a review record per applicant (`institution_application`), the staff review queue with six checks, mark-ready and a second person to approve (one person may do both only in development), registry and sanctions lookups that inform the checks, rejection with a reason (shown in the app and sent by email), applying again after 30 days, and the review-date notice. Only law firms can take a case; other kinds are approved to use the tools and read the case bank. **Payment is not built in the app.** The fee is invoiced outside it: it is shown on `/join` (the `INSTITUTION_PRICE` setting), and approval opens access. If you later want payment inside the app, it slots between approval and access. **Still by hand:** the regulator or bar check (there is no global service), and the identity and call-back checks.

---

## 1. Two doors

| | Report a loss | Join as a professional or institution |
|---|---|---|
| Who | Anyone who lost money | Lawyers, law firms, investigative and forensic firms, and similar |
| Cost | Free | Flat fee, shown first |
| Sign-up | Email or Google, then the one-time identity check before the first report | An application, then review, then payment, then access |
| Gets | Their own claims and where they stand | The case bank, the evidence files, the tools |
| Checked by | Identity check and claim checks | Staff, against public records |

The landing page already says "join as a professional or enterprise". That becomes the second door, with its own page.

## 2. The plan, shown from the start

**What the fee is for:** the software and the analysis. Confirmed and checked claims, proved wallets, losses read from the chain, and the sealed evidence file, in one place.

**What it is not for:** being listed, being ranked, being matched, or winning a case. Paying does not get a firm a case. Taking one still needs conflicts confirmed, the open-case limit and jurisdiction admission. This wording matters because a fee for matching can make Celia look like a paid referral service (`taking-a-case.md`).

Rules the price must follow:
- **One price for every verified institution** of the same kind. No negotiated placement.
- **Never tied to the outcome**, and never a share of any recovery or fee.
- **Fixed and published**: the price, what it covers, the billing period, the cancellation and refund terms. The amount is still to decide (section 7).

Where it shows: a Pricing section on the landing page (the earlier plan cut it), the top of the professional sign-up before any form, and the terms. The wording "Celia charges nobody" on the landing page and in the onboarding terms must change first, to something like: "Reporting a loss is free. Institutions pay a flat fee for the tools."

**Order:** apply, then review (free), then pay, then access. Money is taken only after approval, so nobody pays and is then turned away.

## 3. The professional sign-up, step by step

1. **Choose the kind.** Law firm or lawyer, investigative or forensic firm, or other institution. The kind decides what is asked.
2. **See the plan.** Price and what it does and does not include, before any personal detail is asked for.
3. **Apply.** Legal name, country, company registration number, website, the jurisdictions they act in, and the person applying with their role. For a lawyer: each bar or registration entry, as in the current counsel form.
4. **Work email, not a free one.** The applicant verifies an email on the organisation's own domain (Clerk already does the verification). The domain must match the website given.
5. **Automatic checks** (the providers are options, not chosen):
   - the company exists in the official registry for its country;
   - for lawyers, the person appears in the bar or regulator directory, in good standing;
   - the website domain is not brand new and the email domain matches it;
   - sanctions and watch-list screening of the organisation and the applicant.
6. **The applicant's identity.** The existing identity check (Idswyft) on the person applying, plus proof they act for the firm, such as being listed on the firm's site or the regulator's page, or a signed letter from an officer.
7. **Call-back.** Staff contact the firm using a phone number or address found on the registry or regulator, never the one in the form.
8. **Staff review with two people.** One reviews against a checklist, a second approves. Both are recorded in the staff activity log. A rejection gives a short reason and can be appealed once.
9. **Terms and conflicts.** The firm accepts the terms and the duty to check conflicts for the whole firm (the existing confirmation).
10. **Pay, then activate.** The plan is paid, the account becomes active, and each extra lawyer is verified one by one before they can take cases.

### By kind

| Kind | What is checked beyond the common steps |
|---|---|
| Lawyer or law firm | Bar admission for each lawyer in good standing, firm registration, jurisdictions admitted |
| Investigative or forensic firm | Company registration, any investigator licence the country requires, named lead, references, how they protect data (a short security questionnaire) |
| Exchange, platform or compliance team | Company registration, the named compliance officer, sanctions screening |
| Law enforcement or a public body | An official email, and confirmation by calling the agency's published number. Free or paid is open (section 7) |

## 4. A new institution starts small

- It sees the case summaries, as everyone does, and no claimant details.
- It has a lower open-case limit for its first months.
- Each lawyer is checked individually, not just the firm.
- It is re-checked every year (registration and bar status), and can be suspended at once on a complaint. Suspension does not delete evidence it already holds, so cases are never left without a lead.

## 5. What changes in the product (not built)

- **Account types:** the "counsel" type widens to an institution with a kind (law firm, investigative, other). Firms use Clerk Organizations, as `accounts-and-roles.md` recommended. People are never in an organisation, and an institution's login cannot report a loss.
- **Application status:** `applied`, `in review`, `approved`, `active`, `suspended`, `rejected`, replacing today's pending and verified for counsel.
- **Staff area:** a review queue for applications with the checklist above, the two-person approval, and notes. Every step goes in the staff activity log (already built).
- **Billing:** a payment provider with invoicing, tax and refunds, subscription status on the organisation, and access that stops when it lapses. Not chosen.
- **Copy:** landing pricing section, the professional sign-up pages, the terms, and the emails about review and approval. All of it goes through the copy review.

## 6. Risks to settle with counsel

- Confirm in each jurisdiction that a flat fee for software and analysis is not treated as a referral fee (Rule 7.2(b) and the local equivalents).
- A subscription for investigators may need local licensing rules checked.
- Terms covering what happens to evidence and open cases when a plan lapses or an institution is suspended.
- Data protection: institutions get claimant data only after taking the case, as now, and nothing about the plan changes that.
- Refunds and cancellation: money taken only after approval keeps this simple.

## 7. Questions to settle

1. **The amount, and the period.** Per firm per year, per seat, or tiers by size? I have not researched what firms would pay, so there is no number here.
2. **Per file or subscription.** `taking-a-case.md` preferred a fixed fee per sealed file. Do we offer one, the other, or both?
3. **Law enforcement, NGOs and public bodies:** free, discounted, or the same?
4. **A trial:** a free first month, or none because the review is already free?
5. **Which checking services** for registry, regulator and sanctions lookups, and what each costs.
6. **Independent lawyers:** a firm of one pays the full price, or a smaller plan?
7. **Who approves:** which two staff, and who handles appeals.

## 8. Suggested order

1. Settle questions 1 to 3 and get counsel's view on section 6.
2. Change the landing and terms wording, and publish the plan page.
3. Build the application and the staff review queue, with no payment yet, for a first small group of firms.
4. Add billing, then open the second door publicly.
