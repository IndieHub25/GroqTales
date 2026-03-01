'use client';

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  // Log critical application-level errors
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Application Error</title>
      </head>
      <body className="flex min-h-screen items-center justify-center bg-background text-foreground px-6 text-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">
            Unexpected Application Error
          </h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            A critical error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}