import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

import { getGenreBySlug } from '@/components/genre-selector';
import StoryCard from '@/components/story-card';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { fetchPopularStoriesByGenre } from '@/lib/mock-data';

/**
 * Pre-render a page for every known genre slug at build time.
 * Required by Next.js static export (`output: 'export'`).
 *
 * NOTE: Slugs are hardcoded here because the `genres` array lives in a
 * 'use client' module (it contains JSX icon elements) and cannot be
 * imported into server-side generateStaticParams().
 * Keep this list in sync with components/genre-selector.tsx.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { slug: 'fantasy' },
    { slug: 'sci-fi' },
    { slug: 'horror' },
    { slug: 'romance' },
    { slug: 'adventure' },
    { slug: 'historical' },
    { slug: 'educational' },
    { slug: 'magical-realism' },
  ];
}

export default function GenrePage({ params }: { params: { slug: string } }) {
  const genre = getGenreBySlug(params.slug);

  if (!genre) {
    return (
      <div className="container mx-auto py-16">
        <Card>
          <CardHeader>
            <CardTitle>Genre Not Found</CardTitle>
            <CardDescription>
              The genre you're looking for doesn't exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/genres">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Genres
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stories = fetchPopularStoriesByGenre(genre.slug, 12);

  return (
    <div className="container mx-auto py-12">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link href="/genres">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Genres
            </Button>
          </Link>
        </div>

        <Card className="mb-10" style={{ backgroundColor: genre.color + '15' }}>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: genre.color }}
              >
                {genre.icon}
              </div>
              <div>
                <CardTitle className="text-3xl font-bold">
                  {genre.name}
                </CardTitle>
                <CardDescription className="text-lg">
                  {genre.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Popular Elements</h3>
              <p>{genre.elements}</p>

              <h3 className="text-xl font-semibold">Famous Works</h3>
              <p>{genre.famousWorks}</p>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold mb-6">
          Popular {genre.name} Stories
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </div>
    </div>
  );
}
