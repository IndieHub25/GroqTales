'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

// Provider wrapper with short delay for responsive tooltips
const TooltipProvider = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>) => (
  <TooltipPrimitive.Provider
    delayDuration={200}
    skipDelayDuration={0}
    {...props}
  >
    {children}
  </TooltipPrimitive.Provider>
);

// Root tooltip component
const Tooltip = TooltipPrimitive.Root;

// Trigger component that accepts any child element
const TooltipTrigger = TooltipPrimitive.Trigger;

// Enhanced content component with Portal and Pro Panel styling
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    variant?: 'default' | 'pro-panel';
  }
>(
  (
    { className, sideOffset = 8, variant = 'default', children, ...props },
    ref
  ) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-[100] overflow-hidden rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          variant === 'pro-panel' &&
            'border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-xs normal-case tracking-normal font-normal',
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
