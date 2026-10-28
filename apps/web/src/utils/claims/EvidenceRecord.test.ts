import { describe, expect, it } from 'vitest';
import type { EvidenceBody } from './EvidenceRecord';
import { renderEvidenceHtml, sealEvidence, sha256Hex } from './EvidenceRecord';

const body: EvidenceBody = {
  version: 1,
  generatedAt: '2026-10-28T10:00:00.000Z',
  claimId: 'c1',
  status: 'draft',
  createdAt: '2026-10-01T10:00:00.000Z',
  submittedAt: null,
  wallet: { chain: 'ethereum', address: '0xabc', paymentMethod: 'wallet' },
  ownership: {
    confirmed: true,
    method: 'signature',
    signedAt: '2026-10-02T10:00:00.000Z',
    message: 'Celia ownership proof',
    signature: '0xsig',
    signatureValid: true,
  },
  video: 'https://youtu.be/x',
  files: [
    { name: 'a.png', contentType: 'image/png', size: 3, sha256: sha256Hex('abc'), addedAt: 'x' },
  ],
  payment: { txHash: '0x1' },
  chainChecks: { transaction: null, funding: null },
  operator: { name: 'Nova', website: null },
  statement: 'I lost money.',
};

describe(sealEvidence, () => {
  it('gives the same fingerprint however the keys are ordered', () => {
    const reordered = {
      ...body,
      wallet: { paymentMethod: 'wallet', address: '0xabc', chain: 'ethereum' },
    };

    expect(sealEvidence(reordered).recordHash).toBe(sealEvidence(body).recordHash);
  });

  it('changes the fingerprint when anything changes', () => {
    expect(sealEvidence({ ...body, statement: 'I lost more.' }).recordHash).not.toBe(
      sealEvidence(body).recordHash,
    );
  });
});

describe(sha256Hex, () => {
  it('fingerprints a file the standard way', () => {
    expect(sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });
});

describe(renderEvidenceHtml, () => {
  it('never lets what a person wrote become page code', () => {
    const html = renderEvidenceHtml(
      sealEvidence({
        ...body,
        statement: '<script>alert(1)</script>',
        operator: { name: '"><img src=x onerror=1>', website: null },
      }),
    );

    expect(html).not.toContain('<script>alert');
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;script&gt;');
  });

  it('shows the fingerprint, the signature and each file’s hash', () => {
    const record = sealEvidence(body);
    const html = renderEvidenceHtml(record);

    expect(html).toContain(record.recordHash);
    expect(html).toContain('0xsig');
    expect(html).toContain(sha256Hex('abc'));
  });
});
