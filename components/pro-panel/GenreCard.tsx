'use client';

/**
 * GenreCard Component
 * Mugshot-style genre/preset card — matches reference HTML exactly:
 * - bg-white card with border-4 border-black
 * - Grayscale image with mugshot overlay
 * - Case ID bar at bottom of image
 * - Font-condensed bold uppercase title
 */

import Image from 'next/image';
import React from 'react';

/** Props for GenreCard — genre metadata, selection state, and click handler. */
export interface GenreCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  badge: string;
  caseId: string;
  archetype: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

/** Mugshot-style genre/preset card with grayscale image and case-ID bar. */
export function GenreCard({
  id,
  title,
  description,
  imageUrl,
  badge,
  caseId,
  archetype,
  isSelected,
  onSelect,
}: GenreCardProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(id)}
      className={`group relative w-full text-left overflow-hidden transition-all shadow-comic group-hover:-translate-y-1 ${
        isSelected
          ? 'border-4 border-noir-primary bg-noir-primary/20'
          : 'border-4 border-black bg-white'
      }`}
    >
      {/* Card inner padding like reference */}
      <div className="p-2">
        {/* Image Area — grayscale with mugshot overlay */}
        <div className="relative aspect-[3/4] w-full bg-gray-300 border-2 border-black overflow-hidden grayscale contrast-150 brightness-75">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />

          {/* Scanline overlay */}
          <div className="absolute inset-0 mugshot-overlay pointer-events-none" />

          {/* Case ID bar at bottom of image */}
          <div className="absolute bottom-2 left-0 right-0 text-center bg-black/70 text-white font-condensed text-[10px]">
            {caseId}
          </div>

          {/* Selected checkmark */}
          {isSelected && (
            <div className="absolute bottom-8 right-2 w-6 h-6 bg-noir-primary border-2 border-white flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </div>
      </div>

      {/* Info Area — white bg with black text like reference */}
      <div className="px-2 pb-3 pt-2 text-center">
        <h4 className="font-condensed font-bold text-black uppercase text-sm">
          {title}
        </h4>
        {/* Archetype label in italic noir-title */}
        <div className="font-noir-title italic text-noir-primary text-xs mt-0.5">
          {archetype}
        </div>
        <p className="text-[9px] font-condensed text-gray-600 uppercase tracking-wider mt-1 line-clamp-2">
          {description}
        </p>
      </div>
    </button>
  );
}
