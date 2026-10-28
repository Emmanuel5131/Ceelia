# Taking a case: how a firm takes one, how many, and who can work on it

Research for `apps/web`, 2026-10. Three questions from the case bank: how does a lawyer or firm take a case, how many cases can one lawyer hold from the platform, and can several people work on a case without a conflict.

Facts about rules come from public pages (linked at the end). I read search summaries, not every rule in full, so counsel should confirm each rule in the jurisdictions Celia opens. The Model Rules are the ABA's template; each state has its own version.

## Short answers

1. **Taking a case.** The firm takes it, not the individual lawyer, and the claimants choose the firm. Celia lists the case and shows only a summary until a verified firm has confirmed it checked conflicts. Celia does not pick a firm, charge for the match or take part in the fee.
2. **How many.** No rule sets a number. The ABA says a lawyer with too much work must decline new matters, and gives no formula. Celia sets a guardrail of **5 open cases per lawyer**. It is a product limit, not a legal one, and lives in one place so it is easy to change.
3. **Several people on a case.** Yes, inside one firm. A conflict for one lawyer is a conflict for the whole firm, so conflicts are checked per firm. Start with **one lead firm per case**. A second firm joins only as co-counsel, invited by the lead firm, and their fee split is between them.

## 1. How a firm takes a case

- **Lawyers choose the case, clients choose the lawyer.** Marketplaces such as LegalMatch alert pre-screened lawyers, lawyers respond, and the client picks. Celia has no fee and no ranking, so it should not recommend or rank firms.
- **Money rules shape the design.** A non-lawyer generally cannot share a lawyer's fee (Rule 5.4). A lawyer may pay the usual charges of a qualified referral service (Rule 7.2(b)). A paid, for-profit matching service raises both questions, and Avvo's legal services program ended partly over ethics concerns. Celia stays out of it by charging nobody and paying nobody. Do not add a paid placement, a success fee or a lead price without counsel's review.
- **Conflicts start at first contact.** Someone who only consults a lawyer is a prospective client (Rule 1.18), and what the lawyer learns can disqualify the whole firm. Recent ABA guidance (Opinion 510) says to limit what intake collects and to identify the parties before the facts. So before a firm confirms its conflict check, it sees only the case summary: platform, where the victims are, size and status. Claimant details follow after the firm takes the case.
- **A court can decide instead.** In a class action the court appoints lead counsel (Rule 23(g)), often several firms plus an executive committee, and appointments are personal to the lawyer. Celia's case bank is the route before or outside that.

## 2. How many cases

- ABA Formal Opinion 06-441 says a lawyer whose workload stops them serving existing clients must not take new ones, and must withdraw if competent work is no longer possible. It uses no formula; complexity, support and experience matter.
- A case with 300 claimants is heavier than one with 20, so a single number is rough. We start with a simple count because it is easy to explain and to enforce.
- The firm is responsible for the workload of its lawyers (Rule 5.1), so the count is per lawyer on the team, and a firm cannot get round it by naming one lawyer.

## 3. Several people, and conflicts

- **Inside a firm.** Rule 1.10(a): a conflict that bars one lawyer bars every lawyer in the firm. Screening a lawyer off works only for former-client conflicts that came with a lawyer from a prior firm, not for two current clients on opposite sides. So Celia asks the firm to confirm, once per case, that it checked conflicts for the whole firm.
- **Between claimants.** One firm acting for many claimants of one platform can face a conflict when money is limited. Rule 1.8(g) needs each client's informed consent, in writing, before an aggregate settlement, and the ABA counts separate cases settled together. This is the firm's duty, but the confirmation should name it.
- **Co-counsel.** Courts routinely appoint more than one firm. Splitting a fee between firms needs the client's written agreement and a reasonable total (Rule 1.5(e)). Celia stays out of it.
- **Celia's own rule, unchanged:** a lawyer who is a claimant uses a second account, and counsel cannot take a case they are a claimant in.

## Decisions

| Question | Decision |
|---|---|
| Who takes a case | A verified firm, through a lawyer on it. Not an individual alone |
| Before taking | Case summary only. Claimant details only after the firm confirms conflicts and takes the case |
| Limit | 5 open cases per lawyer (`maxOpenCasesPerLawyer` in `@celia/core`) |
| Lead | One lead firm per case. A taken case closes to other takers |
| Team | Any lawyer at the lead firm can be added to the case |
| Co-counsel | Invited by the lead firm, later. Fee split is theirs |
| Fees and money | Celia holds none, charges none, pays none, ranks no one |

## Who pays for the analysis, if Celia charges

Today Celia charges nobody: the onboarding terms and the landing page say so. Charging means changing that wording first.

Rules that limit the options:
- **Never contingent on the outcome.** Most places bar paying an expert a fee that depends on the result or the content of the evidence (Rule 3.4(b) and state opinions). Celia's findings are evidence, so a share of any recovery is out.
- **No share of a lawyer's fee.** A non-lawyer cannot take part of it (Rule 5.4), and a payer cannot steer the lawyer's judgment (Rules 1.8(f), 5.4(c)).
- **A fee for matching looks like a referral service.** A California court treated LegalMatch, which charges lawyers a membership, as one (Rule 7.2(b)). A price that depends on being matched or taking a case invites the same label.

| Payer | Verdict |
|---|---|
| Claimants | No. They have already lost money, and "pay us to get it back" is the shape of a recovery scam |
| Celia, from a share of recovery | No. Contingent evidence fee and fee sharing |
| The firm, a fixed fee per sealed evidence file, due whatever the outcome | Best starting shape. Priced for the analysis, not the match |
| The firm, a flat subscription for the tools | Workable, if it is for the software and analysis, not for being listed or matched |
| A grant or funder paying for building case files | Good for independence. If a funder pays a lawyer, the client must consent and the funder cannot direct the case |

Whichever is chosen: the method is committed and the file sealed before any firm is chosen, so who pays cannot change the finding. One price for every verified firm. Counsel must approve the arrangement in each jurisdiction before the first invoice.

## Built and not built

- **Built:** `canTakeCase` and the limit (`packages/core/src/caseTeam.ts`); `case` and `case_team` tables, with a unique index so only one lead per case; the case bank reading real cases; the case page with "Take this case" and the conflict confirmation; a staff page (`/dashboard/staff`) to verify lawyers and to open cases and move them between stages.
- **Staff access:** set `staff: true` in a user's Clerk `publicMetadata` by hand. There is no screen for it, on purpose.
- **Not built:** adding colleagues to a case team (only the lead lawyer is recorded; a firm is its lead lawyer until Clerk Organizations is on), rejecting a lawyer (staff can only verify), pooling claims into cases (the claimant count is calculated from claims with the same platform key), the claimant list for the lead firm, and closing a case, so every case a lawyer has taken counts against the limit. The overview still shows sample data.

## Sources

- [Rule 1.10, imputation (ABA text)](https://www.jenner.com/a/web/hf8YGRfd1ryP2ZhfVCA3Wz/4HRMZQ/Model_Rules_of_Profl_Conduct_R.1.10.pdf) and [New Hampshire's version](https://www.courts.nh.gov/new-hampshire-rules-professional-conduct/rule-110-imputation-conflicts-interest-general-rule)
- [ABA Formal Opinion 06-441, excessive caseloads](https://ezel.ai/ethics-opinions/aba/06-441-excessive-caseloads-indigent-defense) ([text](https://in.gov/ccaa/files/ABA.Ethics06-441.pdf))
- [Rule 1.18, prospective clients](https://www.courts.nh.gov/new-hampshire-rules-professional-conduct/rule-118-duties-prospective-client) and [intake procedures and imputation](https://minnlawyer.com/2024/06/25/quandaries-quagmires-developing-intake-procedures-to-avoid-firm-imputation/)
- [Rule 1.8(g) and ABA Opinion 06-438, aggregate settlements](https://www.newyorklegalethics.com/?p=755)
- [Referral fees, Rules 5.4, 7.2 and 1.5(e)](https://www.clio.com/blog/attorney-referral-agreements/) and [D.C. Ethics Opinion 286](https://dcbar.org/For-Lawyers/Legal-Ethics/Ethics-Opinions-210-Present/Ethics-Opinion-286)
- [Class counsel appointment under Rule 23(g), an example order](https://www.cohenmilstein.com/wp-content/uploads/2023/07/Order-Leadership-Appointment-Brown-v-JBS-USA-Red-Meat-01092023.pdf)
- [LegalMatch for attorneys](https://www.legalmatch.com/attorneys/how-it-works.html) and [ABA: for-profit referral services](https://www.americanbar.org/groups/professional_responsibility/publications/professional_lawyer/25/2/attorney-client-matchmaking-for-profit-referral-services/)
