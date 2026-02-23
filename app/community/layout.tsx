import Link from 'next/link';
import React from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { metadata } from './metadata';

export { metadata };

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-16">
        <h1 className="text-3xl font-bold gradient-heading">Community</h1>
        <div className="flex space-x-2">
          <Link href="/community">
            <div className="px-4 py-2 rounded-md hover:bg-muted transition-colors">
              Main Feed
            </div>
          </Link>
          <Link href="/community/creators" className="flex-1 sm:flex-none">
            <div className="px-3 sm:px-4 py-2 rounded-md hover:bg-muted text-center text-xs sm:text-sm font-bold transition-all">
              Creators
            </div>
          </Link>
        </div>
      </div>

      {children}
    </div>
  );
}
