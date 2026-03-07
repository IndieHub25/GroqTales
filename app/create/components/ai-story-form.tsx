'use client';

import React from 'react';

// This component wraps the existing AI Story Generator component
export default function AIStoryForm() {
  const AIStoryGenerator = React.lazy(
    () => import('@/components/ai-story-generator')
  );

  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="text-white/60">Loading AI Story Generator...</div>
        </div>
      }
    >
      <AIStoryGenerator />
    </React.Suspense>
  );
}
