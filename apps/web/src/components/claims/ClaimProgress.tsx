import { cn } from '@/utils/Cn';

/**
 * How far through a flow the person is: one bar per step, the first `step` of them filled.
 * @param props - The progress props.
 * @param props.step - How many bars are filled.
 * @param props.total - How many bars there are.
 * @returns The bars.
 */
export function ClaimProgress(props: { step: number; total: number }) {
  return (
    <div aria-hidden="true" className="flex gap-2">
      {Array.from({ length: props.total }, (_, index) => (
        <div
          key={index}
          className={cn(
            'h-1 flex-1 transition-colors duration-300',
            index < props.step ? 'bg-ink' : 'bg-border',
          )}
        />
      ))}
    </div>
  );
}
