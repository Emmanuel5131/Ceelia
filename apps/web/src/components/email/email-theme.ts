/**
 * The colours and type of every email. Mail clients cannot read our CSS variables, so the tokens from docs/DESIGN.md §2 are
 * written out here as plain values. This is the one file where hex values are allowed; change a token in DESIGN.md and here.
 */
export const emailTheme = {
  light: {
    page: '#FFFFFF',
    panel: '#F5F2EA',
    ink: '#0F1B2D',
    muted: '#46566E',
    line: '#CACDD1',
    onInk: '#FFFFFF',
  },
  dark: {
    page: '#0F1B2D',
    panel: '#16263D',
    ink: '#F5F2EA',
    muted: '#B8C2D1',
    line: '#2C3D57',
    onInk: '#0F1B2D',
  },
  // Aeonik and Mulish are web fonts that mail clients do not load, so mail uses the system fonts.
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
} as const;
