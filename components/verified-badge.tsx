'use client';

import { CheckCircle } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}
export function VerifiedBadge({ className, size = 'md' }: VerifiedBadgeProps) {
  // Size mapping
  const sizeMap = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <CheckCircle
      className={cn(
        'text-purple-500 fill-purple-500',
        sizeMap[size],
        className
      )}
    />
  );
}
