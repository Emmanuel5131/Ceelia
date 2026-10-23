/**
 * The one look for every text field, select trigger and textarea (docs/DESIGN.md §6, Forms): 44px tall, square, a 1.5px
 * ink-at-30% border that turns ink on focus. Errors turn the border seal red; the message below carries the meaning.
 */
export const fieldStyles =
  'w-full min-w-0 border-[1.5px] border-input bg-surface px-3 text-base text-ink outline-none transition-colors duration-150 ease-out placeholder:text-ink-muted focus-visible:border-ink focus-ring disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-seal';
