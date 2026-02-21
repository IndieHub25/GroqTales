'use client';

import { FeaturePillarCard } from './feature-pillar-card';

export function FeaturePillars() {
  const features = [
    {
      title: 'AI Generation',
      description: 'Powered by Groq for lightning-fast story creation.',
    },
    {
      title: 'NFT Ownership',
      description: 'Your stories are truly yours on the blockchain.',
    },
    {
      title: 'Community',
      description: 'Read, share, and trade with other creators.',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6">
      {features.map((feature, index) => (
        <FeaturePillarCard
          key={index}
          title={feature.title}
          description={feature.description}
          icon={null}
          backgroundColor="bg-card"
          darkModeBackgroundColor="dark:bg-slate-800/50"
        />
      ))}
    </div>
  );
}
