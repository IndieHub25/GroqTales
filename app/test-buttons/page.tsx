'use client';

import React from 'react';

import AIStoryGenerator from '@/components/ai-story-generator';

export default function TestButtonsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center gradient-heading">
        AI Story Generator with Animated Buttons
      </h1>
      <AIStoryGenerator />
    </div>
  );
}
