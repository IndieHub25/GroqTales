'use client';

import { motion } from 'framer-motion';
import { Users, BookOpen, Star } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Generate mock featured creators
const getMockCreators = () => {
  return [
    {
      id: 'creator-1',
      name: 'Alex Morgan',
      username: '@alexwrites',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=alex',
      bio: 'Sci-fi author exploring the boundaries of technology and humanity',
      followers: 12800,
      stories: 24,
      featured: true,
      rating: 4.9,
      tags: ['Science Fiction', 'Cyberpunk', 'AI'],
    },
    {
      id: 'creator-2',
      name: 'Elena Kim',
      username: '@elenakim',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=elena',
      bio: 'Fantasy storyteller weaving magical worlds and complex characters',
      followers: 9400,
      stories: 18,
      featured: true,
      rating: 4.7,
      tags: ['Fantasy', 'Magic', 'Adventure'],
    },
    {
      id: 'creator-3',
      name: 'Marcus Johnson',
      username: '@marcuswrites',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=marcus',
      bio: 'Mystery and thriller author who loves to keep readers guessing',
      followers: 7600,
      stories: 15,
      featured: true,
      rating: 4.8,
      tags: ['Mystery', 'Thriller', 'Suspense'],
    },
    {
      id: 'creator-4',
      name: 'Sophia Chen',
      username: '@sophiawrites',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=sophia',
      bio: 'Contemporary fiction focusing on cultural narratives and family',
      followers: 6300,
      stories: 12,
      featured: true,
      rating: 4.6,
      tags: ['Contemporary', 'Cultural', 'Drama'],
    },
  ];
};

export function FeaturedCreators() {
  const [creators, setCreators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading creators from an API
    setIsLoading(true);
    setTimeout(() => {
      setCreators(getMockCreators());
      setIsLoading(false);
    }, 700);
  }, []);

  return (
    <section className="py-12 bg-muted/30">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold gradient-heading flex items-center">
              <Users className="mr-2 h-6 w-6" />
              Featured Creators
            </h2>
            <p className="text-muted-foreground mt-2">
              Meet our top storytellers creating amazing content
            </p>
          </div>
          <Link href="/creators">
            <Button variant="outline">View All Creators</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-muted mb-4" />
                    <div className="h-4 w-24 bg-muted rounded mb-2" />
                    <div className="h-3 w-16 bg-muted rounded mb-4" />
                    <div className="h-3 w-full bg-muted rounded mb-4" />
                    <div className="flex justify-between w-full mt-4">
                      <div className="h-4 w-16 bg-muted rounded" />
                      <div className="h-4 w-16 bg-muted rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {creators.map((creator, index) => (
              <Link href={`/profile/${creator.id}`} key={creator.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{
                    y: -5,
                    transition: { duration: 0.2 },
                  }}
                >
                  <Card className="overflow-hidden h-full card-glow transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="w-20 h-20 mb-4">
                          <AvatarImage src={creator.avatar} />
                          <AvatarFallback>
                            {creator.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold">{creator.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {creator.username}
                        </p>
                        <p className="text-sm line-clamp-2 mb-4">
                          {creator.bio}
                        </p>
                        <div className="flex flex-wrap gap-1 justify-center mb-4">
                          {creator.tags.slice(0, 2).map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 w-full border-t pt-4 mt-2">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">
                              {creator.followers >= 1000
                                ? `${(creator.followers / 1000).toFixed(1)}k`
                                : creator.followers}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Followers
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="font-medium">
                              {creator.stories}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Stories
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="font-medium flex items-center">
                              {creator.rating}
                              <Star
                                className="h-3 w-3 text-yellow-500 ml-1"
                                fill="currentColor"
                              />
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Rating
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
