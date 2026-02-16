import * as React from 'react';

import { cn } from '@/lib/utils';

// Simple animated skeleton placeholder
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-none border-4 border-black bg-muted shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]', className)}
      {...props}
    />
  );
}
