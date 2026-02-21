import React from 'react';
import { cn } from '@/lib/utils';

interface FeaturePillarCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  backgroundColor: string;
  darkModeBackgroundColor?: string;
  index?: number;
}

/**
 * FeaturePillarCard
 * Individual feature pillar card component with icon, title, and description
 * Used in the FeaturePillars section to showcase AI Generation, NFT Ownership, and Community features
 */
export function FeaturePillarCard({
  title,
  description,
  icon,
  backgroundColor,
  darkModeBackgroundColor = 'dark:bg-slate-800/50',
  index = 0,
}: FeaturePillarCardProps) {
  return (
    <div
      className={cn(
        backgroundColor,
        darkModeBackgroundColor,
        'border-4 border-foreground p-8 shadow-[12px_12px_0px_0px_var(--shadow-color)] transition-all duration-300 hover:shadow-[16px_16px_0px_0px_var(--shadow-color)] hover:scale-105 hover:-translate-y-1'
      )}
    >
      {/* Icon Box */}
      <div className="bg-card border-4 border-foreground w-20 h-20 flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-3xl font-black uppercase mb-4 text-foreground">
        {title}
      </h3>

      {/* Description */}
      <p className="text-xl font-bold border-l-4 border-foreground pl-4 bg-card/50 py-2 text-foreground">
        {description}
      </p>
    </div>
  );
}
