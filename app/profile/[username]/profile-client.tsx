'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StoryCard } from '@/components/profile/story-card';

export default function ProfileClient({ stories }: { stories: any[] }) {
  return (
    <div className="mt-8">
      <Tabs defaultValue="stories" className="w-full">
        <div className="flex justify-center md:justify-start mb-6">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="stories">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story, idx) => (
              <StoryCard key={idx} story={story} />
            ))}
          </div>
          {stories.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              <p className="text-lg">No stories told yet.</p>
              <button className="mt-4 text-violet-400 hover:underline">
                Create your first story
              </button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
