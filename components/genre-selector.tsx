// No imported icons to prevent Next.js static build errors
import Link from 'next/link';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type Genre = {
  name: string;
  slug: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  elements?: string;
  famousWorks?: string;
};

export const genres: Genre[] = [
  {
    name: 'Fantasy',
    slug: 'fantasy',
    icon: (
      <span className="text-xl" aria-hidden="true">
        ✨
      </span>
    ),
    color: '#9333ea',
    description: 'Magical worlds, mythical creatures, and epic adventures',
    elements:
      'Magic systems, fantastical creatures, quests, prophecies, chosen ones, ancient artifacts',
    famousWorks:
      'Lord of the Rings, Harry Potter, The Chronicles of Narnia, Game of Thrones',
  },
  {
    name: 'Sci-Fi',
    slug: 'sci-fi',
    icon: (
      <span className="text-xl" aria-hidden="true">
        🚀
      </span>
    ),
    color: '#3b82f6',
    description:
      'Futuristic technology, space exploration, and alternate realities',
    elements:
      'Advanced technology, space travel, time manipulation, dystopian futures, artificial intelligence',
    famousWorks: 'Dune, Foundation, The Expanse, Star Wars, Blade Runner',
  },
  {
    name: 'Horror',
    slug: 'horror',
    icon: (
      <span className="text-xl" aria-hidden="true">
        💀
      </span>
    ),
    color: '#b91c1c',
    description:
      'Terrifying tales, supernatural entities, and psychological terror',
    elements:
      'Monsters, ghosts, psychological fear, isolation, suspense, the unknown',
    famousWorks: 'The Shining, Dracula, It, The Haunting of Hill House',
  },
  {
    name: 'Romance',
    slug: 'romance',
    icon: (
      <span className="text-xl" aria-hidden="true">
        ❤️
      </span>
    ),
    color: '#ec4899',
    description: 'Love stories, relationships, and emotional journeys',
    elements:
      'Love interests, emotional connections, obstacles to love, personal growth, happy endings',
    famousWorks: 'Pride and Prejudice, The Notebook, Outlander, Bridgerton',
  },
  {
    name: 'Adventure',
    slug: 'adventure',
    icon: (
      <span className="text-xl" aria-hidden="true">
        🧭
      </span>
    ),
    color: '#d97706',
    description: 'Thrilling quests, exploration, and exciting challenges',
    elements:
      'Journeys, dangers, exotic locations, heroic protagonists, treasure hunting',
    famousWorks: 'The Hobbit, Treasure Island, Indiana Jones, The Alchemist',
  },
  {
    name: 'Historical',
    slug: 'historical',
    icon: (
      <span className="text-xl" aria-hidden="true">
        📜
      </span>
    ),
    color: '#92400e',
    description: 'Stories set in past time periods with historical context',
    elements:
      'Historical accuracy, period settings, cultural context, historical figures',
    famousWorks: 'War and Peace, The Book Thief, All the Light We Cannot See',
  },
  {
    name: 'Educational',
    slug: 'educational',
    icon: (
      <span className="text-xl" aria-hidden="true">
        🎓
      </span>
    ),
    color: '#16a34a',
    description: 'Informative stories that teach valuable lessons and facts',
    elements:
      'Learning objectives, factual information, educational themes, moral lessons',
    famousWorks:
      "The Magic School Bus, Sophie's World, A Short History of Nearly Everything",
  },
  {
    name: 'Magical Realism',
    slug: 'magical-realism',
    icon: (
      <span className="text-xl" aria-hidden="true">
        🔮
      </span>
    ),
    color: '#14b8a6',
    description: 'Ordinary worlds with magical elements woven into reality',
    elements: 'Subtle magic, realistic settings, metaphor, cultural traditions',
    famousWorks:
      "One Hundred Years of Solitude, Midnight's Children, The House of the Spirits",
  },
];

/**
 * Retrieves genre by slug data
 */
export function getGenreBySlug(slug: string): Genre | undefined {
  return genres.find((genre) => genre.slug === slug);
}
export function GenreCard({ genre }: { genre: Genre }) {
  return (
    <Link href={`/genres/${genre.slug}`} className="block group">
      <div className="bg-card hover:bg-accent transition-colors rounded-lg shadow p-6 h-full">
        <div className="flex items-center mb-4">
          <div className="mr-2">{genre.icon}</div>
          <h3 className="font-medium text-lg">{genre.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{genre.description}</p>
      </div>
    </Link>
  );
}
export function GenreSelector() {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Explore Genres</h2>
        <Button variant="link" asChild>
          <Link href="/genres">View All</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {genres.slice(0, 4).map((genre) => (
          <GenreCard key={genre.slug} genre={genre} />
        ))}
      </div>
    </div>
  );
}
export function GenresPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Stories by Genre</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {genres.map((genre) => (
          <GenreCard key={genre.slug} genre={genre} />
        ))}
      </div>
    </div>
  );
}
