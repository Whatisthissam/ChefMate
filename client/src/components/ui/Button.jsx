import { cn } from '../../lib/cn';

export function Button({ className, variant = 'primary', size = 'md', ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-md font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-accent text-white hover:opacity-95',
    secondary:
      'bg-white text-text border border-black/10 hover:bg-black/5 dark:bg-neutral-900 dark:text-neutral-50 dark:border-white/10 dark:hover:bg-white/10',
    ghost: 'bg-transparent hover:bg-black/5 dark:hover:bg-white/10',
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
  };

  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
