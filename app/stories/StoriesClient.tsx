'use client';

import { PenSquare, LightbulbIcon, Share2 } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

// Minimal client-side presentation extracted from previous page implementation.
export function StoriesClient() {
  const handleCreate = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `/create/ai-story?source=stories_cta&format=free`;
    }
  };

  return (
    <div className="space-y-16">
      <section className="grid gap-6 md:grid-cols-3">
        <InfoCard
          icon={<LightbulbIcon className="h-5 w-5 mr-2 text-primary" />}
          title="Preserve Ideas"
          body="Your unique ideas and perspectives deserve to be preserved and shared with the world. Web3 ensures your stories live forever."
        />
        <InfoCard
          icon={<Share2 className="h-5 w-5 mr-2 text-primary" />}
          title="Build Community"
          body="Stories bring people together, creating communities of like-minded individuals who share your interests and passions."
        />
      </section>
      <section className="text-center">
        <div className="inline-block p-8 rounded-xl theme-gradient-bg bg-opacity-10 border animated-gradient">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Start Your Story?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Join thousands of storytellers who are sharing their creativity with
            the world and building a community through the power of Web3.
          </p>
          <Button
            size="lg"
            className="theme-gradient-bg text-white border-0 hover:opacity-90"
            onClick={handleCreate}
          >
            <PenSquare className="mr-2 h-5 w-5" /> Create Your First Story
          </Button>
        </div>
      </section>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  body: string;
}

function InfoCard({ icon, title, body }: InfoCardProps) {
  return (
    <div className="bg-card border-border hover:shadow-md transition-shadow p-4 rounded-md">
      <div className="flex items-center mb-2 font-semibold">
        {icon}
        {title}
      </div>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

export default StoriesClient;
