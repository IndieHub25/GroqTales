import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community | GroqTales',
  description:
    'Join the GroqTales community - share stories, connect with other writers and readers, and explore AI-powered storytelling',
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://groqtales.com'),
};
