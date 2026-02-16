import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Top Creators | GroqTales',
  description:
    'Discover the most talented storytellers on GroqTales - explore their profiles, read their stories, and follow your favorites',
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://groqtales.com'),
};
