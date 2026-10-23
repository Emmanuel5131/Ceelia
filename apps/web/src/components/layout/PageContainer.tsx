import { cn } from '@/utils/Cn';

/**
 * The content area of every app page: centred, 1600px wide at most, padded 24px on mobile and 32px from 900px up.
 * Pages never set their own outer padding or width.
 * @param props - The container props.
 * @param props.children - The page content.
 * @param props.className - Extra classes for layout inside the container only, such as `grid gap-8`.
 * @returns The padded content wrapper.
 */
export function PageContainer(props: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-400 px-6 py-8 md:px-8', props.className)}>
      {props.children}
    </div>
  );
}
