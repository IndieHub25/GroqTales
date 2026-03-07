'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground px-6 text-center">
      <h2 className="text-3xl font-bold mb-4">Something went wrong.</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        An unexpected error occurred while loading this page.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
      >
        Try Again
      </button>
    </div>
  );
}
