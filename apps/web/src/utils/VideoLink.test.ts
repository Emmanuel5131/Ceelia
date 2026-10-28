import { describe, expect, it } from 'vitest';
import { parseVideoLink } from './VideoLink';

describe(parseVideoLink, () => {
  it('keeps an https link and drops the fragment', () => {
    expect(parseVideoLink(' https://www.loom.com/share/abc123#t=5 ')).toBe(
      'https://www.loom.com/share/abc123',
    );
    expect(parseVideoLink('https://youtu.be/abc?si=x')).toBe('https://youtu.be/abc?si=x');
  });

  it('refuses anything that is not an https link to a site', () => {
    for (const value of [
      '',
      'loom.com/share/abc',
      'http://loom.com/share/abc',
      ['javascript', 'alert(1)'].join(':'),
      'file:///etc/passwd',
      'https://localhost/video',
      'https://user:pass@loom.com/x',
      `https://example.com/${'a'.repeat(500)}`,
    ]) {
      expect(parseVideoLink(value)).toBeNull();
    }
  });
});
