import { cn } from '../../lib/cn';

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-accent-2 px-2 py-0.5 text-[11px] font-medium text-text dark:bg-white/10 dark:text-neutral-100',
        className
      )}
      {...props}
    />
  );
}
