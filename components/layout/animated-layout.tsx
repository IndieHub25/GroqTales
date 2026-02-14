import React, { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface AnimatedLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedLayout({ children, className }: AnimatedLayoutProps) {
  return (
    <div className={cn('relative min-h-screen', className)}>
      {/* Main content container */}
      <div className={cn('relative w-full', className)}>{children}</div>
    </div>
  );
}
