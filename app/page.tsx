'use client';

import { HeroSection, TrendingSection, CTASection } from '@/components/home';
import { useCallback } from 'react';

export default function Home() {
  // Placeholder wallet connection function
  // Update with actual Web3 provider when integrated
  const handleConnectWallet = useCallback(async () => {
    // TODO: Implement actual wallet connection logic
    console.warn('Wallet connection hook not yet implemented');
  }, []);

  return (
    <main className="flex min-h-screen flex-col relative overflow-hidden">
      <HeroSection connectWallet={handleConnectWallet} isConnected={false} />
      <TrendingSection />
      <CTASection />
    </main>
  );
}
