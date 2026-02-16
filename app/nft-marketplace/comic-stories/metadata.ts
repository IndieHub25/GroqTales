import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comic Story NFTs | GroqTales',
  description:
    'Discover and collect unique comic-based story NFTs with stunning artwork and engaging narratives',
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://groqtales.com'),
};
