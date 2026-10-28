import { describe, expect, it } from 'vitest';
import { cleanFileName, detectProofType } from './ProofFile';

describe(detectProofType, () => {
  it('knows a PNG, a JPEG, a WebP and a PDF by their first bytes', () => {
    expect(detectProofType(Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0))).toBe(
      'image/png',
    );
    expect(detectProofType(Uint8Array.of(0xff, 0xd8, 0xff, 0xe0))).toBe('image/jpeg');
    expect(
      detectProofType(Uint8Array.of(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50)),
    ).toBe('image/webp');
    expect(detectProofType(new TextEncoder().encode('%PDF-1.7'))).toBe('application/pdf');
  });

  it('refuses anything else, whatever it is called', () => {
    expect(detectProofType(new TextEncoder().encode('<svg onload=alert(1)>'))).toBeNull();
    expect(detectProofType(new TextEncoder().encode('<html>'))).toBeNull();
    expect(detectProofType(new Uint8Array())).toBeNull();
  });

  it('refuses a RIFF file that is not WebP', () => {
    expect(
      detectProofType(Uint8Array.of(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x41, 0x56, 0x45)),
    ).toBeNull();
  });
});

describe(cleanFileName, () => {
  it('drops folders and control characters and caps the length', () => {
    expect(cleanFileName('C:\\Users\\me\\receipt.png')).toBe('receipt.png');
    expect(cleanFileName('../../etc/pass\nwd')).toBe('passwd');
    expect(cleanFileName('a'.repeat(300))).toHaveLength(120);
  });

  it('gives a name to a file with none', () => {
    expect(cleanFileName('')).toBe('file');
    expect(cleanFileName('folder/')).toBe('file');
  });
});
