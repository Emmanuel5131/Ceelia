import { createHash } from 'node:crypto';
import type { StoredCheck } from '@/utils/Transaction';

type EvidenceFile = {
  name: string;
  contentType: string;
  size: number;
  /** The SHA-256 of the file's bytes, which shows later that the file has not changed. */
  sha256: string;
  addedAt: string;
};

/** What the record says, written once and never changed after it is made. */
export type EvidenceBody = {
  version: 1;
  generatedAt: string;
  claimId: string;
  status: string;
  createdAt: string;
  submittedAt: string | null;
  wallet: { chain: string; address: string | null; paymentMethod: string };
  ownership: {
    confirmed: boolean;
    method: string | null;
    signedAt: string | null;
    message: string | null;
    signature: string | null;
    /** Whether the signature was checked again when the record was made. */
    signatureValid: boolean | null;
  };
  video: string | null;
  files: EvidenceFile[];
  payment: Record<string, string | null>;
  chainChecks: { transaction: StoredCheck | null; funding: StoredCheck | null };
  operator: { name: string | null; website: string | null };
  statement: string | null;
};

export type EvidenceRecord = { body: EvidenceBody; recordHash: string };

/**
 * The SHA-256 of some bytes or text, in hex.
 * @param data - What to fingerprint.
 * @returns The hash.
 */
export function sha256Hex(data: Uint8Array | string) {
  return createHash('sha256').update(data).digest('hex');
}

// The same JSON whatever order the keys were written in, so the same record always has the same hash.
function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(',')}]`;
  }

  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .toSorted(([a], [b]) => a.localeCompare(b));

    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`).join(',')}}`;
  }

  return JSON.stringify(value);
}

/**
 * Seals a record: its fingerprint is the SHA-256 of its contents, so anyone can later check that not one character has changed.
 * @param body - What the record says.
 * @returns The record with its fingerprint.
 */
export function sealEvidence(body: EvidenceBody): EvidenceRecord {
  return { body, recordHash: sha256Hex(stableJson(body)) };
}

const escapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeHtml = (value: string) =>
  value.replaceAll(/[&<>"']/gu, (char) => escapes[char] ?? char);

const verdict = (valid: boolean | null) => {
  if (valid === null) {
    return null;
  }

  return valid ? 'Valid' : 'Not valid';
};

const confirmed = (ownership: EvidenceBody['ownership']) => {
  if (!ownership.confirmed) {
    return 'Not yet';
  }

  return ownership.method ? `Yes, by ${ownership.method}` : 'Yes';
};

const row = (label: string, value: string | null | undefined) =>
  value ? `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>` : '';

function checkLine(label: string, check: StoredCheck | null) {
  if (!check) {
    return '';
  }

  const found =
    check.status === 'found'
      ? `Found on the chain, checked ${check.checkedAt}`
      : `Not found on the chain, checked ${check.checkedAt}`;

  return row(label, found);
}

/**
 * Draws a record as one self-contained page, with no scripts and no outside files, so it can be saved, printed to PDF or handed
 * to a lawyer as it is. Everything the person wrote is escaped, so it can never be read as page code.
 * @param record - The sealed record.
 * @returns The page.
 */
export function renderEvidenceHtml(record: EvidenceRecord) {
  const { body } = record;
  const files = body.files
    .map(
      (file) =>
        `<tr><td>${escapeHtml(file.name)}</td><td>${file.size} bytes</td><td><code>${file.sha256}</code></td></tr>`,
    )
    .join('');
  const payment = Object.entries(body.payment)
    .map(([label, value]) => row(label, value))
    .join('');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Evidence record ${escapeHtml(body.claimId)}</title>
<style>
body{font:16px/1.5 system-ui,sans-serif;max-width:760px;margin:2rem auto;padding:0 1rem;color:#111}
h1{font-size:1.6rem;margin:0}h2{font-size:1.1rem;margin:2rem 0 .5rem;border-bottom:1px solid #ccc;padding-bottom:.25rem}
table{width:100%;border-collapse:collapse}th{text-align:left;width:11rem;vertical-align:top;color:#555;font-weight:500}
td,th{padding:.25rem .5rem .25rem 0;word-break:break-word}code,pre{font:13px/1.4 ui-monospace,monospace}
pre{white-space:pre-wrap;background:#f5f3ee;padding:.75rem;word-break:break-word}.note{color:#555;font-size:.9rem}
</style></head><body>
<h1>Evidence record</h1>
<p class="note">Made by the claimant on Celia. It lists what was added to the claim and when, with a fingerprint of every file. It does
not show that what the claimant says is true, and it is not a finding of fraud.</p>
<table>${row('Claim', body.claimId)}${row('Made', body.generatedAt)}${row('Status', body.status)}${row('Started', body.createdAt)}${row('Sent', body.submittedAt)}${row('Record fingerprint (SHA-256)', record.recordHash)}</table>
<h2>Wallet</h2>
<table>${row('Chain', body.wallet.chain)}${row('Address', body.wallet.address)}${row('Paid by', body.wallet.paymentMethod)}</table>
<h2>Proof of control</h2>
<table>${row('Confirmed', confirmed(body.ownership))}${row('Signed at', body.ownership.signedAt)}${row('Signature checked again', verdict(body.ownership.signatureValid))}</table>
${body.ownership.message ? `<p class="note">The message that was signed:</p><pre>${escapeHtml(body.ownership.message)}</pre>` : ''}
${body.ownership.signature ? `<p class="note">The signature. Anyone can check it with the wallet's own signing tool:</p><pre>${escapeHtml(body.ownership.signature)}</pre>` : ''}
<h2>Video and files</h2>
<table>${row('Video link', body.video)}</table>
${files ? `<table><tr><th>File</th><th>Size</th><th>SHA-256</th></tr>${files}</table>` : '<p class="note">No files were added.</p>'}
<h2>Payment</h2>
<table>${payment}${checkLine('Payment transaction', body.chainChecks.transaction)}${checkLine('Funding transaction', body.chainChecks.funding)}</table>
<h2>Operator named</h2>
<table>${row('Name', body.operator.name)}${row('Website', body.operator.website)}</table>
<h2>The claimant's account</h2>
${body.statement ? `<pre>${escapeHtml(body.statement)}</pre>` : '<p class="note">No account added.</p>'}
</body></html>`;
}
