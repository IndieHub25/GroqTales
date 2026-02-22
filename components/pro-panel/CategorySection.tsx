'use client';

/**
 * CategorySection Component
 * Compact dark technical parameters section — matches reference TECHNICAL PARAMETERS style
 * Uses bg-black/80 with white borders, red accent header, compact layout
 */

import React from 'react';
import { useProPanelStore } from '@/store/proPanelStore';
import type { CategoryKey } from '@/lib/schemas/proPanelSchemas';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ICON_MAP } from './iconMap';

interface CategorySectionProps {
  id: CategoryKey;
  title: string;
  description: string;
  icon: string;
  children: React.ReactNode;
}

export function CategorySection({
  id,
  title,
  description,
  icon,
  children,
}: CategorySectionProps) {
  const resetCategory = useProPanelStore((s) => s.resetCategory);

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    resetCategory(id);
  };

  return (
    <AccordionItem
      value={id}
      className="border-4 border-white/20 overflow-hidden bg-black/80"
    >
      {/* Compact dark trigger with red border accent */}
      <AccordionTrigger className="bg-black/90 px-5 py-3 hover:no-underline group border-b-2 border-[#8a0000] hover:bg-black/70 transition-all">
        <div className="flex items-center justify-between w-full mr-3">
          <div className="flex items-center gap-3">
            {(() => {
              const IconComp = ICON_MAP[icon];
              return IconComp ? <IconComp className="w-5 h-5 text-white" /> : <span className="text-xl">{icon}</span>;
            })()}
            <div className="text-left">
              <h3 className="font-marker text-white text-base sm:text-lg tracking-wider leading-tight">
                {title}
              </h3>
              <p className="text-xs text-gray-400 font-condensed uppercase tracking-widest mt-0.5">
                {description}
              </p>
            </div>
          </div>

          {/* Reset button */}
          <span
            role="button"
            tabIndex={0}
            onClick={handleReset}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                resetCategory(id);
              }
            }}
            title={`Reset ${title.toLowerCase()} to defaults`}
            className="h-7 px-3 text-[10px] font-condensed font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#8a0000] border border-white/20 hover:border-[#8a0000] bg-black/60 inline-flex items-center justify-center cursor-pointer select-none"
          >
            ↺ RESET
          </span>
        </div>
      </AccordionTrigger>

      {/* Dark content area — compact padding */}
      <AccordionContent className="bg-black/60 border-t border-white/10 px-5 pb-4">
        <div className="pt-4">
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
