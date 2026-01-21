'use client';

import { AlertTriangle } from 'lucide-react';

export default function ProfileError() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
      <AlertTriangle
        className="w-10 h-10 mb-4 text-destructive"
        aria-hidden="true"
      />
      <p className="text-sm">Failed to load profile. Please try again later.</p>
    </div>
  );
}
