import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NFT Gallery | GroqTales',
  description:
    'Browse the top NFT stories on GroqTales - discover trending stories, featured creators, and top-selling digital collectibles',
  openGraph: {
    title: 'NFT Gallery | GroqTales',
    description:
      'Discover trending stories, featured creators, and top-selling digital collectibles on GroqTales NFT Gallery',
    type: 'website',
    images: [
      {
        url: '/og-nft-gallery.jpg', // You can add your own Open Graph image
        width: 1200,
        height: 630,
        alt: 'GroqTales NFT Gallery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NFT Gallery | GroqTales',
    description:
      'Discover trending stories, featured creators, and top-selling digital collectibles on GroqTales NFT Gallery',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://groqtales.com'),
};
