import React from 'react';

import './globals.css';
import fs from 'fs';
import path from 'path';

import type { Metadata } from 'next';
import { Inter, Comic_Neue } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';

import ClientLayout from '@/components/client-layout';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { AnimatedLayout } from '@/components/layout/animated-layout';
import { Web3Provider } from '@/components/providers/web3-provider';
import { WalletProvider } from '@/components/providers/wallet-provider';
import { QueryProvider } from '@/components/query-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import BackToTop from '@/components/back-to-top';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

const comicNeue = Comic_Neue({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-comic',
  display: 'swap',
});

const requiredEnvVars = [
  'NEXT_PUBLIC_URL',
  'NEXT_PUBLIC_VERSION',
  'NEXT_PUBLIC_IMAGE_URL',
  'NEXT_PUBLIC_SPLASH_IMAGE_URL',
  'NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR',
];

if (
  process.env.NODE_ENV === 'production' &&
  !process.env.CI &&
  !process.env.NEXT_PUBLIC_BUILD_MODE
) {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}

function getQuickBootScript(): string {
  try {
    const filePath = path.join(process.cwd(), 'public', 'quick-boot.js');
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

const quickBootScript = getQuickBootScript();

export const metadata: Metadata = {
  title: 'GroqTales - AI-Generated Story NFTs',
  description:
    'Create, mint, and share AI-generated stories as NFTs on the Monad blockchain.',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: quickBootScript }} />
        <Script id="theme-fix" src="/theme-fix.js" strategy="beforeInteractive" />
      </head>
      <body className={`${inter.className} ${comicNeue.variable}`}>
        <Web3Provider>
  <WalletProvider>
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={true}
        disableTransitionOnChange={false}
        storageKey="groqtales-theme"
      >
        <AnimatedLayout>
          <ClientLayout>
            <div className="min-h-screen bg-background flex flex-col">
              <Header />
              <main className="container mx-auto px-4 py-6 flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </ClientLayout>
        </AnimatedLayout>
        <Toaster />
      </ThemeProvider>
    </QueryProvider>
  </WalletProvider>
</Web3Provider>

        <BackToTop />
      </body>
    </html>
  );
}
