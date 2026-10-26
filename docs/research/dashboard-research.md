# Dashboard research: how comparable enterprise apps are structured

Research for the Celia app dashboard (`apps/web`). Question: how do enterprise products in crypto forensics, fraud case management, legal tech and on-chain analytics lay out their apps, and what should Celia take from them?

**Method and limits.** Most of these products sit behind a login, so this is built from what is public: product-page and blog screenshots, vendor documentation, help centres and write-ups. I looked at the images myself where I could get them (saved in `docs/research/dashboard-inspiration/`, git-ignored because they are third-party). For the products below marked *text only*, the help pages blocked automated access, so I only have written descriptions, not pictures. Vendor marketing illustrations are not real UI, and I say so where that applies.

---

## 1. What I looked at

| Product | Domain | What I could see | Source |
|---|---|---|---|
| **Chainalysis Investigations / Reactor** | Crypto forensics, case work | Real UI: case graph with a detail panel; a mobile-style address summary | [Chainalysis blog](https://www.chainalysis.com/blog/how-chainalysis-crypto-investigations-supports-cases/), [Reactor](https://www.chainalysis.com/product/reactor/) |
| **Arkham Intelligence** | On-chain analytics | Real UI: custom dashboards of tiles, alerts home, alert detail table | [Arkham Codex](https://codex.arkm.com/the-platform/dashboard), [alerts](https://codex.arkm.com/the-platform/alerts) |
| **Sardine** | Fraud and compliance | Real UI: admin and settings layout | [Sardine product updates](https://www.sardine.ai/blog/product-updates-august-2026) |
| **Elliptic Lens** | Crypto screening | Marketing illustration of the screening table and copilot panel (not a raw screenshot) | [Elliptic](https://www.elliptic.co/insights/introducing-the-new-lens-one-workflow-from-alert-to-decision/) |
| **Smokeball** | Legal practice management | Marketing shot of the personalised dashboard | [Smokeball](https://www.smokeball.com.au/blog/introducing-the-all-new-smokeball-dashboard) |
| TRM Labs Forensics | Crypto forensics | *Text only*: shareable cases, custom fields, evidence attachments, audit trail, court-ready exports | [TRM Investigation 360](https://www.trmlabs.com/solutions/investigation-360) |
| Unit21 | Fraud and AML case management | *Text only*: Cases page with My Cases, Queued Cases and Admin tabs; alert queues; alert to case to report | [Unit21 docs](https://docs.unit21.ai/docs/case-queues) |
| Clio Manage | Legal practice management | *Text only*: personal dashboard and a per-matter dashboard of draggable widgets, a firm feed | [Clio help](https://help.clio.com/hc/en-us/articles/16681289917595-Matter-s-Dashboard) |
| Everlaw | Legal e-discovery | *Text only*: project analytics, assignment-group dashboards, a "case overview" description field | [Everlaw support](https://support.everlaw.com/hc/en-us/articles/360001036191-Evaluating-Your-Project-Using-Project-Analytics) |
| Access Legal Case Management | Legal case management | *Text only*: a widget dashboard (inbox, calendar, recent matters, tasks) | [Access help](https://help-accesslegalcasemanagement.theaccessgroup.com/en/articles/12166665-dashboard-overview) |

Files in `docs/research/dashboard-inspiration/`:
- `chainalysis-investigations-case-graph-and-detail.png`: the most useful one (see §2.1).
- `chainalysis-field-investigations-address-summary.png`
- `arkham-custom-dashboard-tiles.png`, `arkham-alerts-home.png`, `arkham-alert-detail-table.png`, `arkham-add-a-unit-picker.png`
- `sardine-admin-settings.png`
- `elliptic-lens-screening-and-copilot.png` (illustration)
- `smokeball-personalised-dashboard.png` (marketing shot)

---

## 2. What each one shows

### 2.1 Chainalysis Investigations: the closest to Celia
- **Top navigation, not a sidebar:** *Cases · Graphs · Stories · Community · Tools · Labs*. The **case is the first-class object** and comes first.
- A case has a human name in its header: *"Case 14 – Pig Butchering – Sarah K"* (number, type of fraud, victim). Celia's cases are the same idea: platform plus pooled victims.
- **Split view:** the investigation canvas on the left (a graph of victim → address → contract), and a **detail panel on the right** that opens for whatever you select: a *Summary* (lead party, counterparty, total transfers), a tab, a chart, and a **table whose rows expand** to show hash, time, fee and block.
- The address summary page is a **light, calm page**: the address as the page title, a grey **Insights** callout, plain key-value facts (suspicious activity, balance, total transacted, last activity, network), and a **category table with a colour bar at the start of each row** for severity. Primary actions sit in a bar at the bottom.
- Light theme, a lot of white space, mono only for hashes and addresses. This is the nearest match to our paper-and-ink system.

### 2.2 Arkham: dense, dark, tile-based
- Top bar with a global search ("tokens, addresses, entities"), and a left rail that changes per area (the alerts area has a list of alert types down the left).
- **Dashboards are grids of tiles** ("units"); users add units from a categorised picker (*Address & entity intel, Token intel, General, Exchange data*).
- **Alerts home:** featured alert cards on top, then a notification table: *time · from · to · value · coin · USD*, with entity labels and truncated addresses. Filter chips are shown as coloured pills.
- Dark and mono-heavy. Right for traders watching markets; wrong for a legal audience.

### 2.3 Sardine: a clean settings and admin pattern
- Left nav in **groups** (*Personal settings*, *Admin organisation*), a page title with the one primary button on the right, **underlined tabs**, a tinted info banner, then bordered cards. This is a good template for our settings area.

### 2.4 Elliptic Lens (text and illustration)
- A screening table with a **risk score in a ring** per row, Transactions and Wallets as a segmented switch, an assignment filter, an Export and a Screen action, and a side **Copilot** panel with an overview, destination of funds and a risk graph. Cases carry assignments, statuses, structured notes and an audit history, and escalate to a deeper tool with the context kept.

### 2.5 Legal tools (text and one marketing shot)
- **Clio, Access, Smokeball** use a **personal dashboard of widgets**: recently viewed matters, tasks due today, a daily digest, an activity timeline, a firm feed. Clio also has a **per-matter dashboard** with financials, details, a timeline and conflict checks.
- **Everlaw** puts progress analytics (percent reviewed, reviewer activity) and assignment-group dashboards for admins.
- **Unit21** splits work by who it belongs to: **My cases / Queued cases (the team's queue) / Admin**.

---

## 3. Patterns that repeat

1. **One primary object, and it is a case.** Every product lets you open a case and see everything about it in one place.
2. **Home answers "what needs me?"** Assigned and recent items, a few key numbers, a feed. Not a wall of charts.
3. **Work is split by ownership:** mine, my team's, everything (admin).
4. **List → detail without leaving the page.** Click a row, a side panel or sheet opens; full page for the heavy view.
5. **Summary first, evidence below.** A short written summary or callout, then the key facts, then the tables.
6. **Dense tables with fixed columns:** time, parties, value, status. Identifiers in mono. Filters and saved views above.
7. **Audit and export are first-class:** activity history, assignments, notes, and an export for court or a regulator.
8. **Customisable widget grids** (Clio, Arkham, Access) exist, but they are the most expensive feature and are not needed at the start.
9. **AI copilot panels** (Elliptic, TRM) are new and sit beside the work, not in the navigation.
10. **Severity or risk is visible at a glance:** a coloured bar, a ring, a pill.

---

## 4. What this means for Celia

Celia differs from all of these in three ways that should shape the dashboard:
- Its core is **pooling victims into one case** (not monitoring or screening).
- **Four kinds of people** use it: victims, lawyers and firms, researchers and analysts (the "Who builds the case" section on the landing page).
- Every finding is **confirmed or not confirmed**, ends in a **seal**, and leaves **intent to the court**.

### 4.1 Recommended structure (v1)

**Shell** (from `docs/DESIGN.md` §4): 64px header with logo, global search and account menu; a 240px left navigation; content in `PageContainer` with `PageHeader` (title left, the page's one primary action right). Light theme only.

**Navigation depends on the role** (the same shell, different items):

| Role | Left navigation |
|---|---|
| Victim | Overview · My claim · My case · Notifications · Settings |
| Lawyer or firm | Overview · Case bank · My cases · Settings |
| Researcher and analyst | Overview · Review queue · My analyses · Case bank · Settings |

**Overview** (answers "what needs me?"):
- A greeting and **one primary action** (Report fraud for a victim, Browse the case bank for a lawyer).
- **3 or 4 numbers** with `tabular-nums` (for a lawyer: new cases in my jurisdictions, my open cases, claimants waiting; for a victim: claim status, claimants in my case).
- **Needs your attention:** a short list, each row a case with a status badge.
- **Recent activity:** the audit feed.
- No customisable widgets.

**Case bank** (list):
- A table: case name, platform, claimants, jurisdiction, status (shape plus label), last updated.
- A filter bar (jurisdiction, status, size), saved views, search. Row click opens a **side panel** with the summary; "Open case" goes to the full page.

**Case detail = the evidence file** (the main screen, closest to Chainalysis):
- Header: case name in Aeonik, status badge, jurisdiction chips, the seal state, primary action (Take this case).
- Tabs: **Summary · Claimants · Evidence · Timeline · Documents · Activity**.
- **Summary** leads with a short written callout, then **Confirmed** and **Not confirmed** lists, then intent left to the court.
- **Claimants:** a table of wallets with ownership proven or pending; videos stay private and are visible only to the lawyer or firm.
- **Evidence:** the tests, thresholds, hashes and seal (mono for hashes).
- **Activity:** an append-only audit log, with export.
- A right-hand detail panel (like Chainalysis) for whatever row is selected.

**My claim** (victim): a stepper in plain language, with wallet, short video, ownership proof, then the status of the pooled case.

**Settings:** the Sardine pattern: grouped left nav, underlined tabs, bordered cards.

### 4.2 How it should look
- Follow the **light, calm** direction (Chainalysis' summary page, Sardine's settings), not the dark trading look.
- Use our own status language: filled square for confirmed, dashed for not confirmed, seal red only for a finding or verdict. Do not copy the multi-colour severity bars; use the shape plus a label.
- Mono only for hashes, addresses and block numbers.
- Build everything from `components/ui` and the layout components, as in `docs/DESIGN.md` §12.

### 4.3 Leave out of v1
- Customisable widget dashboards (large cost, little value early).
- An AI copilot panel (add later, beside the case, with its actions logged).
- Graph or canvas investigation tools (Celia hands that to the analyst's own tools).
- Charts for their own sake. Add one only when a number needs context.

---

## 5. Questions to settle before building

1. **Which role do we build first?** I would start with the lawyer's view (case bank and case detail), since that is the product's value, then the victim's claim flow.
2. **Is the case bank public, or only for signed-in lawyers and researchers?** This decides whether there is a public case page in addition to the dashboard.
3. **How are claims pooled into a case?** Automatically by platform, or by a coordinator? This changes the Claimants tab and who has the "approve" action.
4. **Do victims see other claimants' details?** Presumably only a count.
5. **What are the case statuses?** A short list (for example: collecting, evidence building, sealed, taken by counsel, filed) so the status badge and filters are fixed from the start.

## 6. Suggested build order

1. App shell: header, role-based left nav, empty states.
2. Overview.
3. Case bank list with filters and the side panel.
4. Case detail (Summary and Claimants first).
5. Victim claim flow.
6. Settings.
