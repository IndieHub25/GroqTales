'use client';

import { BookOpen, Bookmark } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StoryCard from '@/components/profile/StoryCard';
import ProfileActivity from '@/components/profile/ProfileActivity';
import ProfileCollections from '@/components/profile/ProfileCollections';
import { StoryCardData } from '@/types/story';

interface Props {
  stories?: StoryCardData[];
  savedStories?: StoryCardData[];
  isSelf?: boolean;
}

export default function ProfileTabs({
  stories = [],
  savedStories = [],
}: Props) {
  return (
    <Tabs defaultValue="stories" className="mt-8">
      <TabsList>
        <TabsTrigger value="stories" className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Stories
        </TabsTrigger>

        <TabsTrigger value="saved" className="flex items-center gap-2">
          <Bookmark className="w-4 h-4" />
          Saved
        </TabsTrigger>

        <TabsTrigger value="collections">Collections</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>

      <TabsContent value="stories" className="mt-6">
        {stories.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-12">
            No stories yet.
          </p>
        )}
      </TabsContent>

      <TabsContent value="saved" className="mt-6">
        {savedStories.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-12">
            No saved stories.
          </p>
        )}
      </TabsContent>

      <TabsContent value="collections" className="mt-6">
        <ProfileCollections />
      </TabsContent>

      <TabsContent value="activity" className="mt-6">
        <ProfileActivity />
      </TabsContent>
    </Tabs>
  );
}
