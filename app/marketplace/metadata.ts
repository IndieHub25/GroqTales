import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NFT Marketplace | GroqTales',
  description:
    'GroqTales NFT Marketplace - Buy, sell, and trade unique story NFTs created by our community of storytellers.',
  keywords: [
    'NFT marketplace',
    'story NFTs',
    'GroqTales',
    'digital collectibles',
    'blockchain stories',
    'Web3 stories',
    'buy NFT',
    'sell NFT',
    'unique stories',
    'digital ownership',
  ],
  openGraph: {
    title: 'NFT Marketplace | GroqTales',
    description:
      'GroqTales NFT Marketplace - Buy, sell, and trade unique story NFTs.',
    url: 'https://groqtales.com/nft-marketplace',
    type: 'website',
    images: [
      {
        url: '/images/og-nft-marketplace.jpg',
        width: 1200,
        height: 630,
        alt: 'GroqTales NFT Marketplace',
      },
    ],
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://groqtales.com'),
};
