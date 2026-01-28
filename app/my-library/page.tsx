import React from 'react';
import type { Metadata } from 'next';

import { LibraryClient } from './LibraryClient';

export const metadata: Metadata = {
  title: 'My Library | GroqTales',
  description: 'View and manage your liked stories on GroqTales',
};

export default function MyLibraryPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <LibraryClient />
    </div>
  );
}
