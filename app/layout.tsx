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
import { Web3Provider } from '@/components/providers/web3-provider'; // DISABLED VERSION FOR PRODUCTION
import { QueryProvider } from '@/components/query-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import BackToTop from '@/components/back-to-top';

// Optimize font loading
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

// Build-time environment variable validation
const requiredEnvVars = [
  'NEXT_PUBLIC_URL',
  // 'NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME', // Commented out OnChain references
  'NEXT_PUBLIC_VERSION',
  'NEXT_PUBLIC_IMAGE_URL',
  'NEXT_PUBLIC_SPLASH_IMAGE_URL',
  'NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR',
];

// Validate required environment variables at build time (only in production)
// Skip validation during build process (CI/Vercel build)
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
} else {
  // In development or build mode, set default values for missing environment variables
  const defaultEnvVars: Record<string, string> = {
    NEXT_PUBLIC_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000',
    // 'NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME': 'GroqTales', // Commented out OnChain references
    NEXT_PUBLIC_VERSION: '1.0.0',
    NEXT_PUBLIC_IMAGE_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/images`
      : 'https://groqtales.com/images',
    NEXT_PUBLIC_SPLASH_IMAGE_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/splash.jpg`
      : 'https://groqtales.com/splash.jpg',
    NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR: '#1a1a2e',
  };

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      process.env[envVar] = defaultEnvVars[envVar];
    }
  }
}

// Get quick boot script content
function getQuickBootScript(): string {
  try {
    const filePath = path.join(process.cwd(), 'public', 'quick-boot.js');
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    console.warn('Could not read quick-boot.js:', e);
    return ''; // Return empty string if file reading fails
  }
}

// Quick boot script to prevent flashing and improve initial load
const quickBootScript = getQuickBootScript();

export const metadata: Metadata = {
  title: 'GroqTales - AI-Generated Story NFTs',
  description:
    'Create, mint, and share AI-generated stories as NFTs on the Monad blockchain.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://groqtales.com'),
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'GroqTales',
    description:
      'AI-Powered Web3 Storytelling Platform | Create, share, and own AI-generated stories and comics as NFTs on the Monad blockchain',
    images: [{ url: 'https://www.groqtales.xyz/groq_tales_logo.png' }],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111111' },
  ],
};

// Disable static optimization for the entire app layout to prevent build-time
// evaluation of client components that access browser-only globals.
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Force dynamic rendering to avoid static export attempting to execute
  // client-only logic (e.g., window / localStorage usage) during build.
  // This mitigates build errors like "window is not defined" across pages
  // that are intentionally client components.
  // (Next.js will ignore static optimization for this layout subtree.)
  // Ref: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _forceDynamic: 'force-dynamic' = 'force-dynamic';
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline critical JS for fastest possible execution */}
        <script dangerouslySetInnerHTML={{ __html: quickBootScript }} />

        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Optimize for performance */}
        <meta name="color-scheme" content="light dark" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Performance optimization scripts */}
        <Script
          id="theme-fix"
          src="/theme-fix.js"
          strategy="beforeInteractive"
        />
        <Script
          id="performance-fix"
          src="/performance-fix.js"
          strategy="afterInteractive"
        />
        <Script
          id="scroll-optimization"
          src="/scroll-optimization.js"
          strategy="afterInteractive"
        />
        <Script
          id="pwa-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} ${comicNeue.variable} optimize-paint`}
      >
        {/* Skip link for keyboard users to jump to main content */}
        <a
          href="#main-content"
          className="skip-link sr-only focus:not-sr-only absolute left-2 top-2 z-50 px-3 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Skip to main content
        </a>
        <Web3Provider>
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
                  <div className="min-h-screen bg-background dark:dark-premium-bg flex flex-col">
                    <Header />
                    <main
                      id="main-content"
                      tabIndex={-1}
                      className="container mx-auto px-4 py-6 flex-grow focus:outline-2 focus:outline-primary"
                    >
                      {children}
                    </main>
                    <Footer />
                  </div>
                </ClientLayout>
              </AnimatedLayout>
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </Web3Provider>
        <BackToTop />
      </body>
    </html>
  );
}
