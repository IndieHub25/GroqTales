'use client';

import { HeroSection, TrendingSection, CTASection } from '@/components/home';
import { useWeb3 } from '@/components/providers/web3-provider';

export default function Home() {
  const { connectWallet } = useWeb3();

  return (
    <main className="flex min-h-screen flex-col relative overflow-hidden">
      <HeroSection connectWallet={connectWallet} isConnected={false} />
      <TrendingSection />
      <CTASection />
    </main>
  );
}
