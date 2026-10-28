/** What a person may send as proof of a wallet: a screenshot or a receipt, as an image or a PDF. */
export const proofFileLimits = {
  /** The most files in one send. */
  perSend: 3,
  /** The most files a claim can hold. */
  perClaim: 6,
  /** The most bytes in one file. */
  bytes: 4 * 1024 * 1024,
} as const;

export type ProofType = 'image/png' | 'image/jpeg' | 'image/webp' | 'application/pdf';

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((value, index) => bytes[offset + index] === value);

/**
 * Tells what a file really is from its first bytes, never from its name or the type the browser reported, which the sender
 * controls. Anything that is not a PNG, JPEG, WebP or PDF gives nothing.
 * @param bytes - The file's bytes.
 * @returns The type, or null when it is not one we keep.
 */
export function detectProofType(bytes: Uint8Array): ProofType | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png';
  }

  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return 'image/jpeg';
  }

  // WebP is "RIFF", four size bytes, then "WEBP".
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return 'image/webp';
  }

  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) {
    return 'application/pdf';
  }

  return null;
}

/**
 * Reduces a file name to something safe to store and show: no folders, no control characters, at most 120 characters.
 * @param name - The name the browser sent.
 * @returns The cleaned name, or "file" when nothing is left.
 */
export function cleanFileName(name: string) {
  const base = name.split(/[\\/]/u).pop() ?? '';
  // oxlint-disable-next-line no-control-regex -- control characters are exactly what this removes
  const cleaned = base.replaceAll(/[\u0000-\u001F\u007F]/gu, '').trim();

  return cleaned.slice(0, 120) || 'file';
}
