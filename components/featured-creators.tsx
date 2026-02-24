'use client';

import { motion } from 'framer-motion';
import { Users, BookOpen, Star } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  stories: number;
  featured: boolean;
  rating: number;
  tags: string[];
}

export function FeaturedCreators() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCreators = async () => {
      setIsLoading(true);
      try {
        // Try fetching from the community creators API
        const res = await fetch('/api/feed?limit=4&type=creators');
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json.creators || json;

          if (Array.isArray(data) && data.length > 0) {
            // Only map items that are actually creator-shaped objects
            const mapped: Creator[] = data
              .filter((c: any) =>
                // Require at least one creator-identifying field
                c.username || c.followersCount !== undefined || c.profileImage
              )
              .slice(0, 4)
              .map((c: any) => ({
                id: c._id || c.id || '',
                name: c.name || c.authorName || 'Unknown Creator',
                username: c.username || '',
                avatar: c.avatar || c.profileImage || `https://api.dicebear.com/7.x/personas/svg?seed=${c._id || c.id || 'default'}`,
                bio: c.bio || c.description || '',
                followers: c.followers ?? c.followersCount ?? 0,
                stories: c.stories ?? c.storiesCount ?? 0,
                featured: c.featured ?? false,
                rating: c.rating ?? 0,
                tags: c.tags || c.genres || [],
              }))
              // Only keep creators with a valid ID (to avoid linking to bad profile routes)
              .filter((c) => c.id !== '');
            setCreators(mapped);
          } else {
            setCreators([]);
          }
        } else {
          setCreators([]);
        }
      } catch (err) {
        console.error('Failed to fetch creators:', err);
        setCreators([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreators();
  }, []);

  // Don't render section if no creators and not loading
  if (!isLoading && creators.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-muted/20 dark:bg-muted/10">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold flex items-center text-foreground">
              <Users className="mr-2 h-6 w-6" style={{ color: 'var(--comic-purple)' }} />
              Featured Creators
            </h2>
            <p className="text-muted-foreground mt-2 font-bold">
              Meet our top storytellers creating amazing content
            </p>
          </div>
          <Button
              asChild
              variant="outline"
              className="border-4 border-foreground font-black uppercase rounded-none shadow-[4px_4px_0px_0px_var(--shadow-color)]"
            >
              <Link href="/community/creators">
                View All
              </Link>
            </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse border-4 border-foreground/20">
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
                  <Card className="overflow-hidden h-full border-4 border-foreground transition-all duration-300 hover:shadow-[8px_8px_0px_0px_var(--shadow-color)]"
                    style={{ boxShadow: '6px 6px 0px 0px var(--shadow-color)' }}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="w-20 h-20 mb-4 border-4 border-foreground">
                          <AvatarImage src={creator.avatar} />
                          <AvatarFallback>
                            {creator.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-black text-foreground uppercase">{creator.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2 font-bold">
                          {creator.username}
                        </p>
                        <p className="text-sm line-clamp-2 mb-4 text-muted-foreground font-bold">
                          {creator.bio}
                        </p>
                        <div className="flex flex-wrap gap-1 justify-center mb-4">
                          {creator.tags.slice(0, 2).map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs border-2 border-foreground/30 font-bold"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 w-full border-t-4 border-foreground/20 pt-4 mt-2">
                          <div className="flex flex-col items-center">
                            <span className="font-black text-foreground">
                              {creator.followers >= 1000
                                ? `${(creator.followers / 1000).toFixed(1)}k`
                                : creator.followers}
                            </span>
                            <span className="text-xs text-muted-foreground font-bold">
                              Followers
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="font-black text-foreground">
                              {creator.stories}
                            </span>
                            <span className="text-xs text-muted-foreground font-bold">
                              Stories
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="font-black text-foreground flex items-center">
                              {creator.rating}
                              <Star
                                className="h-3 w-3 ml-1"
                                style={{ color: 'var(--comic-yellow)' }}
                                fill="currentColor"
                              />
                            </span>
                            <span className="text-xs text-muted-foreground font-bold">
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
