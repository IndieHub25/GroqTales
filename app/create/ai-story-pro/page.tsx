/**
 * Pro Panel Page
 * Advanced story generation configuration with 70+ parameters
 * Noir Dossier visual design
 */

import { Metadata } from 'next';
import { ProPanel } from '@/components/pro-panel/ProPanel';

export const metadata: Metadata = {
  title: 'Pro Panel | GroqTales',
  description:
    'Advanced AI story generation with 70+ customizable parameters across 9 categories',
  openGraph: {
    title: 'Pro Panel | GroqTales',
    description: 'Fine-tune every aspect of your AI-generated stories',
    type: 'website',
  },
};

export default function ProPanelPage() {
  return (
    <div className="bg-background-dark font-display overflow-x-hidden min-h-screen relative">
      {/* Halftone dot background */}
      <div className="fixed inset-0 z-0 halftone-bg pointer-events-none opacity-40" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-grow">
          <ProPanel />
        </main>
      </div>
    </div>
  );
}
