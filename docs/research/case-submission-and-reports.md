# How a case is submitted, how Sandworm builds the evidence, and how the report is delivered

Research for `apps/web`. It goes back to the pitch to check the app against it, then answers three questions: what does a victim submit, how does Sandworm turn it into evidence, and how do we deliver the report (iframe, PDF, or something else).

**Written for:** you and your co-founders. **Status:** a plan to decide on; nothing here is built.

**Built so far (2026-10):** the claim table in our database (`claim`), the claim flow (`/dashboard/claims/new`, then the claim page with the ownership, statement and send steps), the person Overview showing real claims or an honest empty state, and `packages/core` (`@celia/core`) with address checks for EVM, Solana, Tron and Bitcoin and ownership-signature checks for EVM, Solana and Tron. Not built: pooling into cases, the Sandworm connection, the worker, sealing, the case detail for counsel.

**Decisions so far:**
- **No separate Sandworm API.** Celia connects through the **MCP**, and an LLM agent does the analysis and writes the report (see §5).
- **An iframe of the published Sandworm notebook is allowed** and wanted, as a live view (see §6).
- **All chains.** Read it as: a claim can be filed for any chain; how deeply we analyse and verify depends on the chain family (see §2).

---

## 1. The pitch, restated (so we build against it)

From `docs/legal-hack-context.md` and the landing page copy:

- Celia is a **vertical of Sandworm** for crypto fraud, done the legal way. Sandworm supplies the **chain analytics and the reports**. Celia supplies the **intake, the pooling, the legal layer and the lawyers' access**.
- Celia is a **case bank**. Victims of the same platform each add a **wallet and a few lines of text**. Celia pools them, builds the evidence **from the chain**, and gives a lawyer or firm a case with the victims **already listed**. Celia holds no funds, runs no cases, pays no one.
- **The method is committed before any data is touched.** Claim, tests and thresholds are hashed onchain first. Then the tests run. Then the report is sealed against the commitment.
- Every finding says what is **proven** and what is **not proven**. **We do not declare fraud.** Celia establishes **falsity and loss from the chain** and collects **reliance from the victims themselves**. Intent is for the court.
- The output is an **evidence file plus a jurisdiction-specific certificate** (Section 84 in Nigeria, FRE 902(13)/(14) in the US, in counsel review).

**A correction to my own work.** I had added a *short video* to the claim (a step in the stepper, a line in the consent, a rule in the copy-reviewer notes). That is not in the pitch. The landing page says the victim adds a wallet and says what they were promised and what they lost, in text. I have removed every mention of video from the app, the docs and `.agent/copy-reviewer.md`.

---

## 2. What a victim submits

> **Updated:** the form is now built around the kind of loss, how it was paid and who took the money, not just a wallet and a platform. See [fraud-types-and-claim-form.md](fraud-types-and-claim-form.md). The table below is the first version.

Principle: the chain is the evidence, so the victim only gives what the chain **cannot** say, plus enough to find them on it. Ask for as little as that.

| What | Required | Why | How it is checked |
|---|---|---|---|
| **Wallet address** and which chain | Yes | Where the money left from; the starting point of every test | On chain |
| **Signed message from that wallet** | Strongly yes | Proves the person controls the wallet | The signature is verified; no data from the victim needed |
| **The platform**: its name and site, plus any address, contract or token they know | Yes (name); address optional | Pools the claim with others hurt by the same platform | We match it to the platform's addresses; if unknown, the trace from the victim's wallet finds where the money went |
| **A transaction hash** of a payment to the platform | Optional, helps | A pointer when the victim does not know the platform's address | On chain |
| **What you were promised, who told you, where you saw it, and what happened** (a few lines of text) | Yes | The **reliance** element, which the chain cannot show: the promise, the ad, the blocked withdrawal, a fee demanded | **Not confirmed** by design. Shown as "victim report, not on chain", as in the landing's sample file |
| **Screenshots, chat exports, links** | Optional | Supports the statement; "most victims kept only a wallet address and a few screenshots" | Stored privately; never treated as proven |
| **Country** and **consent** to share with the counsel who takes the case | Yes | Routes the case; lawful basis | Recorded with a timestamp and wording version |

**Ownership has two strengths.** A self-custody wallet can **sign**, which is strong. A person who paid from an **exchange account** cannot sign for the exchange's wallet. They can still submit the statement and the exchange withdrawal receipt, and the file marks ownership as **not confirmed** for that claim, which is honest and still useful. This is a design point to confirm with the lawyer co-founder.

**Not collected:** video, ID documents, phone, address, date of birth.

### All chains
Decision: **all chains**. The sensible reading is that a claim can be **filed for any chain**, and what we can *do* with it depends on the chain's family. Two things vary by chain, and they are separate:

| | What it needs | Plan |
|---|---|---|
| **Analysis** (the tests) | Sandworm's data for that chain | Whatever Sandworm covers, which is your side to confirm. A chain Sandworm cannot read gets "statement only, not analysed". |
| **Wallet ownership** (the signed message) | A signature check for that chain's scheme | Done per family: **EVM** (EIP-191, plus EIP-1271 for contract wallets), **Solana** (ed25519), **Tron**, **Bitcoin** (message signing). Others are added as we go; until then the claim is accepted with ownership **not confirmed**. |
| **Address checks on the form** | The address format | Validate by family so a typo is caught before it is filed. |

The claim form lists about 55 chains with their logos, popular ones first (`chains` in `@celia/core`), plus "Other EVM network" and "Another chain", so nothing is turned away. Signature checks cover the EVM, Solana and Tron families; the rest are accepted with ownership not confirmed.

### What Celia works out for each claim (no effort from the victim)
From the wallet and the platform, Sandworm computes: deposits to the platform, anything received back, **net loss**, dates, and whether the money went on through a mixer to an exchange. This is the per-victim row a lawyer wants: *wallet, signed proof, paid in, taken out, net loss, transactions*. It is **computed from the chain**, so it is "confirmed on chain" and does not depend on the victim's memory.

---

## 3. From submission to a sealed file

```
Victim submits  →  Match to platform  →  Pool into a case  →  Commit the method
                                                                    ↓
Counsel opens ← Publish + certificate ← Seal the report ← Review ← Run the tests (Sandworm)
```

1. **Intake.** Wallet, signature, platform, statement, consent. Stored in our database (private).
2. **Match and pool.** Group claims by platform and jurisdiction. A case exists once the platform is identified; staff or a rule decides when it has enough claims to analyse (open question).
3. **Commit the method.** Hash the claim, the tests and the thresholds, and commit that onchain *before the analysis*. In Sandworm terms this is the **attestation** of the method notebook (see §4).
4. **Run the tests.** Through the Sandworm MCP: funding trail, cohort vs baseline, circularity, concentration, and the per-wallet loss. Output is the findings.
5. **Review.** A researcher or analyst checks it; a later test may overturn an earlier reading, and the report says so.
6. **Seal.** Hash the final report and publish the hash and verdict against the earlier commitment.
7. **Legal layer.** Map each finding to a category, apply the house language, and generate the **certificate** for the jurisdiction.
8. **Counsel.** The case appears in the (public) case bank as a summary. A verified lawyer or firm opens the file with the claimants' details.

---

## 4. What the Sandworm MCP gives us (and what it does not)

These points are from the tool descriptions I could read in this session. I have not run them against a live workspace, so treat them as *documented*, not *tested*.

| Documented capability | What it means for Celia |
|---|---|
| Create a notebook, add cells, **run it** (`run_notebook`) and read results (`get_run_results`). Runs are for **cloud notebooks** only. | We can drive the whole analysis from our server. |
| `get_run_results` returns **text output, tables as text, the first rows of SQL results, and chart summaries**. Long output is shortened. | The MCP is built for an AI client, not for pulling clean charts or complete tables. We should make each test end with **one cell that prints a JSON "finding"** (verdict, numbers, proven, not proven) so we have a structured result to store. |
| `attest_notebook` **commits the code, data sources and parameters of every cell, and when it last ran, onchain**, and a validator re-runs it and checks. | This is our **"commit the method before the data"** step, ready-made. |
| The attestation **does not hash the output** (output changes as the data does) and does not prove the logic is right. | **We must hash the report ourselves** at the seal step. The Sandworm attestation covers the method; our seal covers the result. |
| Attested code is **pinned publicly (IPFS) for good**. Changing a cell makes the attestation stale. | **Privacy rule:** never put victim details in an attested notebook. See §6. |
| `publish_notebook` returns a **public link**. `set_dashboard` lays out a dashboard of tiles. | We can offer a live, public view of the method and chain evidence ("anyone can inspect"). |
| `schedule_notebook` re-runs on a cron. | Useful for monitoring, but it means a published notebook **changes over time**. It cannot be the court record on its own. |
| I found **no export-to-PDF tool** in the list. | A PDF is something Celia produces, unless Sandworm adds an export. |

---

## 5. Connecting to the MCP from our server

**Yes, a server can connect to the MCP.** An MCP server is just an HTTP endpoint that any MCP client can call, not only Claude's apps. There are two ordinary ways to do it, plus one that is a little fiddlier:

| Way | How it works | Good | Watch out |
|---|---|---|---|
| **1. Anthropic's MCP connector** | Our server calls the Messages API with an `mcp_servers` entry (`type: "url"`, the Sandworm MCP URL, a name, and an `authorization_token`) and a `tool_configuration` with an `allowed_tools` list. Claude calls Sandworm's tools itself, and the tool calls and results come back in the response. | Least code; no MCP client to run; the allowlist restricts the agent to the tools we name. | It is a beta feature (the current header in the docs is `mcp-client-2025-11-20`), supports tool calls only, needs the MCP reachable over HTTP, and is not available through Bedrock or Vertex. |
| **2. AI SDK MCP client** (recommended to start) | Our server uses `createMCPClient` from `@ai-sdk/mcp` with an HTTP transport and `headers` (or an `authProvider` for OAuth), turns Sandworm's tools into tools for `generateText`, and runs the loop itself. | We see and log **every tool call and result**, set time limits, retry, and run it as durable steps. Works with any model. | The client is lightweight: no session management or resumable streams. Check the installed version's docs (v7 changed the redirect default). |
| 3. Claude Agent SDK | Same idea with MCP servers configured on an agent. | Built for long agent runs. | Heavier than we need for a fixed battery of tests. |

I recommend **2**, because **the log is evidence**. In a legal product we want to keep the exact sequence of tool calls, parameters and results the agent used, next to the sealed report. Option 1 also returns them, so we could switch later.

### The real blocker is authentication, not connection
The Sandworm MCP works today as a connector where **a person approves access in a browser** (OAuth). A server has no person. The options:

1. **Best: Sandworm issues a service token** (a long-lived, scoped bearer token) for a dedicated **"Celia" workspace**. We send it as the `Authorization` header (or `authorization_token`). Because you own Sandworm, this is a small change on your side, and it gives us: a separate workspace for Celia's data, easy revocation, and a place to put usage limits and billing.
2. **Fallback: sign in once as a Celia service user** and store the refresh token for the server to reuse. It works with the AI SDK's `authProvider`, but refresh tokens can expire or need consent again, so it is fragile.
3. **Standard route for the future:** the MCP project has a *client-credentials* extension for machine-to-machine access, but it is still a draft and few clients support it. The practical advice from the sources is the same as option 1: fetch or hold a token yourself and send it as a bearer header.

Until one of these exists, **nothing in Celia's backend can start an analysis**, so it is the first thing to settle with the Sandworm side.

### How long the work takes, and where it runs
An analysis is minutes, not seconds. `run_notebook` waits up to 45 seconds, then says "running" and you poll `get_run_results`. That does not fit a single web request. Run each analysis as a **durable background job** (Vercel Workflow or a queue) with steps: *start run → wait → read results → write findings → store snapshot*. Each step can be retried without repeating the work.

### An LLM doing the analysis must not change the method
The pitch is that **the tests and thresholds are fixed before the data is touched**. If the agent writes new analysis code for every case, that promise is gone, and a defence lawyer will say the method was tuned. So:

- The **battery of tests lives in a template notebook** that we write once, review with counsel, and keep fixed (funding trail, cohort vs baseline, circularity, concentration, per-wallet loss). The tool list includes `fork_notebook`, which I have not read in detail.
- For each case the agent only **forks the template, fills in the parameters** (the platform's addresses, chain, time window, thresholds from the template), **runs it, reads the results, and writes the findings in house language**. The allowlist stops it using tools that rewrite the tests.
- After the run, **check that the test cells are unchanged** from the template (compare hashes) before accepting the result.
- The agent **writes words, not tests**: the verdict wording, the proven and not-proven lists, in the fixed house language, and nothing that declares fraud. A person reviews it before it is sealed.

### The order of the onchain steps needs one correction
Sandworm's `attest_notebook` says to **run the notebook first** and commits the code, parameters and *when it last ran*. So Sandworm's attestation happens **after** the run. It cannot be the "committed before any data is touched" step by itself.

- **Before the run:** Celia hashes *(template version + parameters + thresholds + claim)* and commits it onchain itself. This is the true pre-registration.
- **After the run:** Sandworm's attestation adds a second, independent proof that the validator re-ran the same code.
- **At the seal:** Celia hashes the frozen findings and commits that, referring to the earlier commitment.

---

## 6. The report: iframe, PDF, or something else?

What the report must be, for a court: **fixed** (it cannot change after it is sealed), **verifiable** (anyone can re-hash it), **ours to present** (the certificate and house language are Celia's legal layer), and **private where it must be** (claimant details).

| Option | Good | Bad for this product |
|---|---|---|
| **A. Iframe a published Sandworm notebook** | Fastest; always Sandworm's latest look and charts | The page **can change** (re-runs), so it is not a sealed record. Shows Sandworm's page, but the pitch says Sandworm appears only as a small "Data infrastructure by Sandworm Labs" line. Depends on Sandworm allowing embedding (not confirmed) and on its uptime. Cannot hold private claimant rows. |
| **B. PDF made by Sandworm** | One file a lawyer can attach | I found no export tool, so it would need building on the Sandworm side. A PDF alone is hard to read on screen and cannot link live evidence. |
| **C. Celia stores a frozen snapshot of the findings and renders it itself** (recommended) | The snapshot is the **record**: stored as JSON, hashed, sealed, never edited. Celia draws it in its own design, adds the **certificate** and the proven/not-proven wording, and can **export a PDF from the same snapshot**. Works without Sandworm being online. | We draw the charts ourselves from the data (a charting library), instead of reusing Sandworm's. More work than an iframe. |

**Recommendation: C, with A as a labelled extra. You have confirmed the iframe works, so it goes in.**
- The **sealed snapshot** is the evidence file. Celia renders it and generates the **PDF** from it, with the hash printed on the page.
- A **"Verify it yourself" link** opens the published Sandworm notebook (the attested method), so a lawyer or researcher can re-run it. That is the landing's "evidence you can verify yourself". It can be a link, or an iframe in a tab labelled **live view, not the record**.
- Wallet-level detail (names a lawyer sees) lives only in Celia, never in the public notebook.

**Iframe details:** allow Sandworm's domain in our `frame-src` header, use the `sandbox` attribute, label it "Live view, not the sealed record", and never put claimant rows in the notebook it shows.

**To test before we commit:** can the template notebook print its findings as one JSON block that parses reliably? (A short spike once the service token exists.)

---

## 7. Privacy: what may be public and what may not

- **Public:** the platform's addresses, the method, the tests, the chain evidence, the report hash, **counts** of claimants. This is what the attested, published notebook may contain.
- **Private:** the **statement**, any screenshots, and the **link between a person and a wallet**. A wallet address is public onchain, but "this wallet belongs to someone who says they were defrauded by X" is sensitive. It is shared only with the verified counsel handling the case.
- **Why it matters here:** because attestation pins the notebook's parameters publicly and forever, **the public method notebook must be keyed to the platform, not to the victims.** Per-victim loss is computed in a **separate, unattested** notebook or step, and the results go only into the private snapshot.

---

## 8. What this changes in what we planned

- **Claim form:** wallet, signature, platform, a text box for the account of what happened, optional screenshots and links, country, consent. No video.
- **My claim stepper:** wallet added → ownership signed → account of what happened added → pooled → taken by counsel. (The app now shows this.)
- **Case detail (counsel view):** *Confirmed on chain* and *Not confirmed (victim report)* lists, as on the landing's sample file; a claimants table with the computed loss per wallet; the evidence (tests, thresholds, hashes, the commitment and the seal); the certificate; "Verify in Sandworm".
- **Staff and analysts:** need a queue to **start an analysis run**, review the result, and **seal** it. Analysts matter here: the landing lists researchers and analysts separately, and the analyst runs the fixed tests. I merged them earlier for simplicity; this suggests keeping *analyst* as its own approved profile.
- **New data we store:** `claims`, `cases`, `analysis_runs` (notebook ids, attestation reference, the frozen findings JSON, its hash, the seal transaction), `findings`, `certificates`.

## 9. Suggested build order

1. **Get the service token from Sandworm** for a "Celia" workspace (the one blocker; see §5).
2. **A spike:** a script that connects through the AI SDK MCP client, forks a template notebook, runs it on one known case (the anonymized Protocol P or the "funds taken" sample), reads a JSON finding, stores it and hashes it. This proves the MCP route before we build around it.
3. **Database tables** for claims, cases and analysis runs; then the **claim form** (wallet, signature check for the first chain families, statement, platform, consent).
4. **Case detail page** rendering the snapshot (confirmed vs not confirmed, loss per wallet), with the live-view iframe.
5. **Pre-registration commit, seal, PDF and certificate.**
6. **Staff and analyst queue** to start runs, review the agent's draft and seal.
7. Public case bank page.

## 10. Questions to settle

Answered: no separate Sandworm API (we use the MCP); the iframe is allowed; all chains.

1. **Service token.** Can Sandworm issue a long-lived, scoped token for a dedicated Celia workspace? Without it, nothing in the backend can run an analysis.
2. **Chain coverage.** Which chains can Sandworm read today? The rest are "statement only" until it can.
3. **The template notebook.** Who writes the battery of tests, and who signs it off with counsel? It is the method, so it needs the most care.
4. **Exchange-account victims:** accept a claim with "ownership not confirmed", and show it as such?
5. **Who triggers an analysis, and at what size?** A staff action, or automatically at N claims per platform?
6. **Who seals?** The pre-registration and the seal are onchain transactions, so someone holds the key. Decide who, and where the key lives.
7. **Review before sealing.** Does a person always review the agent's draft? I would say yes for the first cases at least.
8. **Do we keep analyst as a separate profile from researcher?** I now think yes.

---

## Sources

- `docs/legal-hack-context.md` (the method, the verdict wording, the sample case) and `apps/landing/src/data/home.ts` (what victims and lawyers are told they get).
- Anthropic, [MCP connector](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector): `mcp_servers` with `url`, `name`, `authorization_token`, `tool_configuration` and `allowed_tools`; tool calls only; beta header.
- AI SDK, [MCP tools](https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools): `createMCPClient` from `@ai-sdk/mcp`, HTTP transport with `headers` or `authProvider`; the client is lightweight.
- Model Context Protocol, [OAuth client credentials extension](https://modelcontextprotocol.io/extensions/auth/oauth-client-credentials.md): a draft for machine-to-machine access; Zuplo's guide notes few clients support it and suggests holding a token and sending it as a bearer header.
- Sandworm MCP tool descriptions available in this session: `run_notebook`, `get_run_results`, `attest_notebook`, `check_notebook_trust`, `publish_notebook`, `set_dashboard`, `schedule_notebook`, `create_notebook`. Read, not run. `fork_notebook` exists in the tool list; I have not read its details.
