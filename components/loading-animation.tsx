'use client';

import React, { useEffect, useState } from 'react';

interface LoadingAnimationProps {
  message?: string;
}
export function LoadingAnimation({
  message = 'Loading...',
}: LoadingAnimationProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute w-full h-full rounded-full border-4 border-t-primary border-r-transparent border-b-primary/50 border-l-transparent animate-spin"></div>
        <div className="absolute w-full h-full rounded-full border-4 border-r-primary/30 border-t-transparent border-l-primary/70 border-b-transparent animate-spin-slow"></div>
      </div>
      <div className="relative">
        <p className="text-lg font-medium text-muted-foreground">
          {message}
          <span className="inline-block w-6 text-left">{dots}</span>
        </p>
      </div>
    </div>
  );
}
