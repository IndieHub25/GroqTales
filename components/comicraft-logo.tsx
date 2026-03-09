'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

// ---------------------------------------------------------------------------
// Comicraft Logo System — Uses the official /logo.png brand asset
//
// variant="full"   → Logo image at full size (navbar, hero, footer)
// variant="icon"   → Logo image at compact size (favicon / badge)
// variant="mark"   → Logo image at medium size (minimal contexts)
//
// The logo is always rendered from /logo.png to ensure the full COMICRAFT
// wordmark is visible and never clipped at any viewport size.
// ---------------------------------------------------------------------------

export type LogoVariant = 'full' | 'icon' | 'mark';
export type LogoColorScheme = 'color' | 'mono-light' | 'mono-dark';

interface ComiCraftLogoProps {
  variant?: LogoVariant;
  colorScheme?: LogoColorScheme;
  /** Height in px (width auto-calculated). Default 40 for full, 36 for icon. */
  size?: number;
  /** When true, wraps the logo in a Link to "/" */
  asLink?: boolean;
  className?: string;
  animate?: boolean;
}

// ---------------------------------------------------------------------------
// PUBLIC COMPONENT
// ---------------------------------------------------------------------------
export function ComiCraftLogo({
  variant = 'full',
  colorScheme = 'color',
  size,
  asLink = false,
  className = '',
  animate = true,
}: ComiCraftLogoProps) {
  const iconSize = size ?? (variant === 'full' ? 40 : variant === 'mark' ? 32 : 36);

  // Calculate dimensions based on variant
  // Full: wider to show the complete COMICRAFT wordmark
  // Icon: square aspect ratio
  // Mark: medium width
  const aspectRatio = variant === 'full' ? 3.2 : variant === 'mark' ? 2.5 : 1;
  const width = Math.round(iconSize * aspectRatio);
  const height = iconSize;

  // Apply filter for mono schemes
  const filterStyle: React.CSSProperties =
    colorScheme === 'mono-light'
      ? { filter: 'brightness(0) invert(1)' }
      : colorScheme === 'mono-dark'
      ? { filter: 'brightness(0)' }
      : {};

  const logoImage = (
    <Image
      src="/logo.png"
      alt="COMICRAFT"
      width={width}
      height={height}
      className="object-contain"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: '100%',
        ...filterStyle,
      }}
      priority
      unoptimized
    />
  );

  const inner = (
    <span
      className={`inline-flex items-center select-none flex-shrink-0 ${className}`}
      aria-label="Comicraft"
    >
      {animate ? (
        <motion.span
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.03 }}
          className="flex items-center flex-shrink-0"
        >
          {logoImage}
        </motion.span>
      ) : (
        <span className="flex items-center flex-shrink-0">
          {logoImage}
        </span>
      )}
    </span>
  );

  if (asLink) {
    return (
      <Link
        href="/"
        aria-label="Comicraft home"
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded-lg"
      >
        {inner}
      </Link>
    );
  }

  return inner;
}
