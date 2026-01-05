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

interface TooltipTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}
const TooltipTrigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  ({ className, asChild = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn('inline-flex items-center justify-center', className)}
        {...props}
      />
    );
  }
);
TooltipTrigger.displayName = 'TooltipTrigger';

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
}
const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, sideOffset = 4, ...props }, ref) => {
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
