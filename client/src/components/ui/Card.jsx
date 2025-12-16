import { cn } from '../../lib/cn';

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg bg-card shadow-soft border border-black/5 dark:bg-neutral-900 dark:border-white/10',
        className
      )}
      {...props}
    />
  );
}
