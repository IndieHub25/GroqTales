'use client';

import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';

import { Button } from '@/components/ui/button';

export default function ComicStoryDetailPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={() => router.back()} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Comic Story Detail
            </h1>
            <p className="text-gray-600">Comic ID: {params.id}</p>
            <p className="text-sm text-gray-500">
              This page is under development. The full comic detail
              functionality will be implemented soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
