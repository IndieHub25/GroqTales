import StoryClient from './client';

export const dynamic = 'force-static';
export const dynamicParams = true;

/**
 * Pre-render a few known IDs at build time;
 * `dynamicParams = true` means unknown IDs still fallback to CSR (the 'use client' child handles data fetching).
 */
export function generateStaticParams() {
  const params: { id: string }[] = [];
  // Top mock IDs kept for backward compat
  for (const id of ['top-1', 'top-2', 'top-3']) params.push({ id });
  // Numeric story IDs
  for (let i = 1; i <= 90; i++) params.push({ id: `story-${i}` });
  return params;
}

export default function StoryPage({ params }: { params: { id: string } }) {
  return <StoryClient id={params.id} />;
}