import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Text Story NFTs | GroqTales',
  description:
    'Discover and collect unique text-based story NFTs from talented authors',
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://groqtales.com'),
};
