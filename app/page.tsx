'use client';

import { HeroSection, TrendingSection, CTASection } from '@/components/home';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col relative overflow-hidden">
      <HeroSection />
      <TrendingSection />
      <CTASection />
    </main>
  );
}
