import { cn } from '@/utils/Cn';

const diag =
  'M 36.4 25.8 C 28 26.3 19.9 29.6 13.5 35 C 5.8 41.6 1.3 51.7 1.7 61.6 C 2.1 72.7 8 82.7 17.8 88.9 C 23.9 92.9 31.6 95 39.1 94.9 C 46.1 94.7 52.2 93.1 58 89.6 C 59.4 88.8 61.4 87.4 63 86.1 C 65.1 84.3 68.9 80.4 68.9 80 C 68.9 79.7 68.5 79.3 66.5 78 C 64.9 76.8 63 75.5 57.9 71.8 C 56 70.4 54.6 69.4 54.4 69.4 C 54.3 69.4 54 69.7 53.6 70.2 C 51.3 72.6 50.4 73.4 48.4 74.6 C 44.5 77.1 38.9 77.9 34.1 76.7 C 31.3 75.9 28.8 74.5 26.5 72.1 C 24 69.6 22.6 67 21.8 63.4 C 21.3 61.2 21.5 57.9 22.3 55.4 C 24.1 49.8 29.1 45.6 35.4 44.2 C 36.9 43.9 41.5 44 42.9 44.3 C 47.1 45.4 49.9 46.9 53.1 50.1 C 54.3 51.4 54.5 51.4 55.1 51 C 55.2 50.8 55.7 50.4 56.1 50.1 C 56.5 49.8 57.5 49.1 58.3 48.5 C 59.1 47.9 60.4 46.9 61.2 46.3 C 62.1 45.7 63.2 44.9 63.8 44.4 C 64.4 44 65.8 43 66.8 42.4 C 69.2 40.7 69.3 40.6 69.2 40.2 C 69 39.9 65.8 36.5 64.8 35.7 C 61.1 32.6 57.7 30.5 53.9 28.9 C 48.6 26.6 41.9 25.4 36.4 25.8 Z';
const leg =
  'M 78.7 30.7 C 78.6 30.7 78.4 30.8 78.4 30.9 C 78.3 31.1 78.3 40.4 78.3 62.2 C 78.3 92.7 78.3 93.3 78.5 93.5 L 78.6 93.8 88.1 93.8 C 98.7 93.8 98.1 93.8 98.2 93.1 C 98.2 92.9 98.3 78.9 98.2 61.9 C 98.2 32.4 98.2 31 98 30.8 C 97.9 30.6 97.3 30.6 88.4 30.6 C 83 30.6 78.8 30.6 78.7 30.7 Z';
const arm =
  'M 78.6 5.8 C 78.4 5.9 78.3 6 78.3 6.1 C 78.3 6.8 78.4 24 78.4 24.2 C 78.5 24.7 78.3 24.7 88.3 24.7 L 97.6 24.7 97.8 24.4 L 98 24.2 98 15.1 L 98 6 97.8 5.8 C 97.6 5.7 96.6 5.7 88.2 5.7 C 83 5.7 78.7 5.8 78.6 5.8 Z';

/**
 * The compact Celia mark (the c, the i stem and the red square), for places too narrow for the wordmark such as the collapsed
 * sidebar. The letters follow `currentColor`.
 * @param props - The mark props.
 * @param props.size - Rendered width and height in pixels.
 * @param props.onDark - True on an ink surface, where the red square switches to the lighter seal red.
 * @param props.className - Extra classes, for example a text colour.
 * @returns The mark as an SVG.
 */
export function LogoMark(props: { size?: number; onDark?: boolean; className?: string }) {
  const size = props.size ?? 28;

  return (
    <svg
      className={cn('block', props.className)}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      focusable="false"
    >
      <title>Celia</title>
      <path fill="currentColor" d={`${diag} ${leg}`} />
      <path className={props.onDark ? 'fill-seal-on-dark' : 'fill-seal'} d={arm} />
    </svg>
  );
}
