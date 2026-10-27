import { describe, expect, it } from 'vitest';
import { toCsv } from './Csv';

describe(toCsv, () => {
  it('joins rows with line breaks and cells with commas', () => {
    expect(
      toCsv([
        ['a', 'b'],
        ['c', 'd'],
      ]),
    ).toBe('a,b\r\nc,d');
  });

  it('quotes cells with a comma, a quote or a line break', () => {
    expect(toCsv([['a,b', 'say "hi"', 'one\ntwo']])).toBe('"a,b","say ""hi""","one\ntwo"');
  });

  it('keeps a cell that starts like a formula as text', () => {
    expect(toCsv([['=SUM(A1)', '+1', '-1', '@x']])).toBe("'=SUM(A1),'+1,'-1,'@x");
  });

  it('writes an empty cell as nothing', () => {
    expect(toCsv([['a', '', 'c']])).toBe('a,,c');
  });
});
