'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

// This is a fallback tooltip component for use when @radix-ui/react-tooltip is not available
// It provides basic tooltip functionality but without animations and advanced positioning

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

interface TooltipProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
const Tooltip = ({
  children,
  open,
  defaultOpen,
  onOpenChange,
}: TooltipProps) => {
  return <>{children}</>;
};

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}
const TooltipTrigger = React.forwardRef<HTMLSpanElement, TooltipTriggerProps>(
  ({ className, asChild = false, children, ...props }, ref) => {
    // When asChild is true, render children directly to avoid button nesting issues
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        ref,
        className: cn(
          (children as React.ReactElement).props?.className,
          className
        ),
        ...props,
      });
    }
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
TooltipTrigger.displayName = 'TooltipTrigger';

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
}
const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, sideOffset = 4, side = 'top', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'z-50 overflow-hidden border-2 border-black bg-white px-3 py-1.5 text-xs font-bold uppercase italic tracking-wider text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      />
    );
  }
);
TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
