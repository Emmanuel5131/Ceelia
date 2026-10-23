/** Split multi-line titles authored with "\n" into lines. */
export const lines = (s: string) => s.split('\n');
/** Plain single-line version of a title (for meta tags, aria-labels, JSON-LD). */
export const flat = (s: string) => s.replace(/\n/g, ' ');
/** Minimal, safe inline markup: escapes HTML, then turns **x** into <strong>x</strong>. */
export const richText = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
export const pad2 = (n: number) => String(n).padStart(2, '0');
