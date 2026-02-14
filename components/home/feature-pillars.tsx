'use client';

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
        <div
          key={index}
          className="comic-card group hover:-translate-y-1 transition-transform"
        >
          <h4 className="font-display text-3xl mb-1 text-primary uppercase">
            {feature.title}
          </h4>
          <p className="font-subheading font-bold text-lg leading-snug uppercase">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}
