/**
 * Quotes one CSV cell. A cell that starts with `=`, `+`, `-`, `@`, a tab or a return would run as a formula when the file is
 * opened in a spreadsheet, and these cells hold text people typed, so a leading apostrophe keeps them as text.
 * @param value - The cell text.
 * @returns The cell, quoted when it has a comma, a quote or a line break.
 */
function csvCell(value: string) {
  const text = /^[=+\-@\t\r]/u.test(value) ? `'${value}` : value;

  return /[",\r\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/**
 * Turns rows of text into CSV.
 * @param rows - The rows, the heading row first.
 * @returns The CSV text.
 */
export function toCsv(rows: string[][]) {
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}

/**
 * Saves CSV text as a file in the browser. The byte order mark lets Excel read accented letters correctly.
 * @param filename - The name of the file.
 * @param csv - The CSV text.
 */
export function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
