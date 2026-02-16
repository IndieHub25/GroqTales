import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Story Generator | GroqTales',
  description:
    'Generate unique stories with Groq AI and mint them as NFTs on the Monad blockchain',
  openGraph: {
    title: 'AI Story Generator | GroqTales',
    description:
      'Create AI-powered stories and turn them into blockchain NFTs on GroqTales',
    type: 'website',
    images: [
      {
        url: '/og-ai-story-generator.jpg',
        width: 1200,
        height: 630,
        alt: 'GroqTales AI Story Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Story Generator | GroqTales',
    description:
      'Create AI-powered stories and turn them into blockchain NFTs on GroqTales',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://groqtales.com'),
};
