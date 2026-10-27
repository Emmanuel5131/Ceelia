# The case report: what Sandworm hands over and what the case bank shows

The case bank's **Preview** (and the "Analysis report" section on a case page) shows one frozen record per case: the findings of an analysis, written in Celia's house language. Sandworm produces the findings; staff check and save them; Celia stores them with a hash and draws them in its own design. See `case-submission-and-reports.md` §6 (option C) for why a frozen snapshot and not an iframe.

Sandworm's existing "Case #00x" notebooks (published-style write-ups of named companies) are the model for the shape, "They say, the chain says, a verdict", but they are not loaded into Celia: platform names stay anonymised in the case bank until the platform consents to being named.

## How a report gets into the app

1. Run the analysis in Sandworm. End the notebook with one cell that prints the findings below as a single JSON block.
2. Staff open **Staff, Cases**, press **Add report** on the case, paste the JSON, and optionally the link to the published *method* notebook.
3. The app checks the format and the house language, hashes the result (SHA-256 of its canonical JSON) and saves it as a new version. Older versions are kept.
4. A case can be moved to **Sealed** only once it has a report.

Nothing here calls Sandworm yet. Pulling the JSON through the Sandworm MCP automatically needs the service token described in `case-submission-and-reports.md` §5.

## The format (`apps/web/src/validations/ReportValidation.ts`)

```json
{
  "version": 1,
  "headline": "The chain shows 142 wallets sending funds to one address. It does not show intent.",
  "figures": [
    { "label": "Wallets", "value": "142", "note": "that sent funds to the platform" }
  ],
  "checks": [
    {
      "claim": "Withdrawals are always available.",
      "evidence": "No withdrawal leaves the platform's address after 14 September.",
      "result": "proven"
    }
  ],
  "method": {
    "tests": ["Funding trail", "Concentration"],
    "commitment": "0x…64 hex characters, if the method was committed before the data was read"
  },
  "dataAsOf": "2026-10-27T10:00:00Z",
  "sources": ["Solana RPC"]
}
```

- `result` is one of `proven`, `partly_proven`, `not_proven`, `not_checkable`. Use `not_checkable` for what the chain cannot show (a bank transfer, a card payment, a promise made in chat). Never guess.
- Up to 4 `figures`, 20 `checks`, 20 `tests`, 10 `sources`.
- The app rejects text with words Celia does not use: scam, scammer, fraud detected, guaranteed, recover your money, exposes. Say what is proven and not proven; a court decides intent.

## What must never be in it

Public facts only: the platform's addresses, the method, what the tests found, counts. **Never a claimant's name, wallet, statement or loss.** Everything a lawyer sees about a claimant lives only in Celia, after the lawyer takes the case.

## The method notebook link

Optional, and only an https link on `sandwormlab.xyz`. It is shown as **Verify the method**. Attested method notebooks are pinned publicly and permanently, so the notebook it points to must be keyed to the platform, never to victims.
