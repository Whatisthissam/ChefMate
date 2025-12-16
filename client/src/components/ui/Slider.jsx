import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '../../lib/cn';

export function Slider({ className, ...props }) {
  return (
    <SliderPrimitive.Root
      className={cn('relative flex w-full touch-none select-none items-center', className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <SliderPrimitive.Range className="absolute h-full bg-accent" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border border-black/10 bg-white shadow-sm outline-none focus:ring-2 focus:ring-accent dark:border-white/10 dark:bg-neutral-50" />
    </SliderPrimitive.Root>
  );
}
