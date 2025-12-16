import { cn } from '../../lib/cn';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-md border border-black/10 bg-white px-3 text-sm outline-none transition placeholder:text-muted focus:ring-2 focus:ring-accent dark:border-white/10 dark:bg-neutral-900 dark:placeholder:text-neutral-400',
        className
      )}
      {...props}
    />
  );
}
