import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // The shadcn components and layout primitives are a library: every part exists before a screen uses it.
  entry: ['src/components/ui/**/*.tsx', 'src/components/layout/**/*.tsx'],
  // Files to exclude from Knip analysis
  ignore: ['src/libs/I18n.ts', 'src/types/I18n.ts'],
  // Dependencies to ignore during analysis
  // Include custom Playwright test file suffixes
  playwright: {
    entry: ['tests/**/*.@(integ|e2e).ts'],
  },
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/gu)].join('\n'),
  },
  treatConfigHintsAsErrors: true,
};

export default config;
