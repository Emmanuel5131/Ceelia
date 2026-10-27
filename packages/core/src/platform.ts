/**
 * Turns a platform's name into the key claims are pooled by, so "Quantum-Fi", "quantum fi" and "QuantumFi" are one platform.
 * It is deliberately simple: lowercase, accents removed, everything but letters and digits dropped. Near-misses are left for
 * a person to merge.
 * @param name - The platform's name as typed.
 * @returns The pooling key.
 */
export function platformKey(name: string) {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
}

/**
 * Reduces a website address to its host, so `https://www.Quantum.fi/invest` and `quantum.fi` are the same site.
 * @param url - A web address as typed.
 * @returns The lowercase host without `www.`, or undefined when it is not a valid address.
 */
export function platformHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./u, '').toLowerCase();
  } catch {
    return undefined;
  }
}
