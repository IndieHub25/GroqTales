'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Trash2, BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useWeb3 } from '@/components/providers/web3-provider';
import { StoryCard } from '@/components/story-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Story {
  id: string;
  title: string;
  content?: string;
  author: string;
  authorAvatar?: string;
  authorUsername?: string;
  likes?: number;
  views?: number;
  comments?: number;
  coverImage?: string;
  image?: string;
  description?: string;
  price?: string;
  isTop10?: boolean;
  genre?: string;
}

export function LibraryClient() {
  const router = useRouter();
  const { account } = useWeb3();
  const { toast } = useToast();
  const [likedStories, setLikedStories] = useState<Story[]>([]);
  const [createdStories, setCreatedStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'saved' | 'created'>('saved');

  // Load liked stories from localStorage
  useEffect(() => {
    const loadLibrary = async () => {
      try {
        if (!account) {
          setLikedStories([]);
          setCreatedStories([]);
          setIsLoading(false);
          return;
        }

        // Load liked/saved stories
        const likedStoriesKey = `liked-stories-${account}`;
        const likedStoryIds = JSON.parse(localStorage.getItem(likedStoriesKey) || '[]');

        if (likedStoryIds.length > 0) {
          const mockLikedStories: Story[] = likedStoryIds.map((id: string, index: number) => ({
            id,
            title: `Liked Story ${index + 1}`,
            description: 'A story you saved to your library',
            author: 'Story Author',
            likes: Math.floor(Math.random() * 500),
            views: Math.floor(Math.random() * 1000),
            comments: Math.floor(Math.random() * 50),
            genre: ['Science Fiction', 'Fantasy', 'Mystery', 'Romance', 'Thriller'][
              Math.floor(Math.random() * 5)
            ],
            coverImage: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=400&auto=format&fit=crop&q=60`,
          }));
          setLikedStories(mockLikedStories);
        } else {
          setLikedStories([]);
        }

        // Load created stories
        const createdStoriesKey = `created-stories-${account}`;
        const createdStoryIds = JSON.parse(localStorage.getItem(createdStoriesKey) || '[]');

        if (createdStoryIds.length > 0) {
          const mockCreatedStories: Story[] = createdStoryIds.map((id: string, index: number) => ({
            id,
            title: `My Created Story ${index + 1}`,
            description: 'A story I created and published',
            author: 'You',
            likes: Math.floor(Math.random() * 300),
            views: Math.floor(Math.random() * 800),
            comments: Math.floor(Math.random() * 40),
            genre: ['Science Fiction', 'Fantasy', 'Mystery', 'Romance', 'Thriller'][
              Math.floor(Math.random() * 5)
            ],
            coverImage: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=400&auto=format&fit=crop&q=60`,
          }));
          setCreatedStories(mockCreatedStories);
        } else {
          setCreatedStories([]);
        }
      } catch (error) {
        console.error('Error loading library:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your library',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLibrary();
  }, [account, toast]);

  const handleRemoveFromLibrary = (storyId: string) => {
    if (!account) return;

    const likedStoriesKey = `liked-stories-${account}`;
    const likedStoryIds = JSON.parse(localStorage.getItem(likedStoriesKey) || '[]');
    const updatedIds = likedStoryIds.filter((id: string) => id !== storyId);

    localStorage.setItem(likedStoriesKey, JSON.stringify(updatedIds));
    setLikedStories(likedStories.filter(story => story.id !== storyId));

    toast({
      title: 'Removed',
      description: 'Story removed from your saved library',
    });
  };

  const handleRemoveCreatedStory = (storyId: string) => {
    if (!account) return;

    const createdStoriesKey = `created-stories-${account}`;
    const createdStoryIds = JSON.parse(localStorage.getItem(createdStoriesKey) || '[]');
    const updatedIds = createdStoryIds.filter((id: string) => id !== storyId);

    localStorage.setItem(createdStoriesKey, JSON.stringify(updatedIds));
    setCreatedStories(createdStories.filter(story => story.id !== storyId));

    toast({
      title: 'Deleted',
      description: 'Story deleted from your created stories',
      variant: 'destructive',
    });
  };

  const handleClearLibrary = () => {
    if (!account) return;

    if (window.confirm('Are you sure you want to clear your saved library? This cannot be undone.')) {
      const likedStoriesKey = `liked-stories-${account}`;
      localStorage.removeItem(likedStoriesKey);
      setLikedStories([]);

      toast({
        title: 'Saved Library Cleared',
        description: 'Your saved stories have been cleared',
      });
    }
  };

  const handleClearCreated = () => {
    if (!account) return;

    if (window.confirm('Are you sure you want to delete all your created stories? This cannot be undone.')) {
      const createdStoriesKey = `created-stories-${account}`;
      localStorage.removeItem(createdStoriesKey);
      setCreatedStories([]);

      toast({
        title: 'Created Stories Deleted',
        description: 'All your created stories have been deleted',
        variant: 'destructive',
      });
    }
  };

  if (!account) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold comic-pop mb-2">My Library</h1>
            <p className="text-muted-foreground">View and manage your liked stories</p>
          </div>
        </div>

        {/* Tab Selection Buttons - Always Visible */}
        <div className="flex gap-2 border-b-4 border-black">
          <Button
            onClick={() => setActiveTab('saved')}
            variant={activeTab === 'saved' ? 'default' : 'outline'}
            className={`px-6 py-2 text-lg comic-text-bold rounded-none ${
              activeTab === 'saved'
                ? 'bg-yellow-400 text-black border-b-4 border-black'
                : 'hover:bg-muted'
            }`}
          >
            💾 Saved ({likedStories.length})
          </Button>
          <Button
            onClick={() => setActiveTab('created')}
            variant={activeTab === 'created' ? 'default' : 'outline'}
            className={`px-6 py-2 text-lg comic-text-bold rounded-none ${
              activeTab === 'created'
                ? 'bg-yellow-400 text-black border-b-4 border-black'
                : 'hover:bg-muted'
            }`}
          >
            ✍️ Created ({createdStories.length})
          </Button>
        </div>

        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="bg-yellow-400 dark:bg-yellow-600 border-b-4 border-black">
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription className="text-black dark:text-white">
              Please connect your wallet to view your library
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-6">
              Your library stores all the stories you've liked and want to save. Connect your wallet to get started!
            </p>
            <Button
              onClick={() => router.push('/')}
              className="theme-gradient-bg text-white border-0"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold comic-pop mb-2">My Library</h1>
            <p className="text-muted-foreground">Loading your stories...</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-muted rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold comic-pop mb-2">My Library</h1>
          <p className="text-muted-foreground">
            View and manage your created and saved stories
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Tab Selection Buttons */}
      <div className="flex gap-2 border-b-4 border-black">
        <Button
          onClick={() => setActiveTab('saved')}
          variant={activeTab === 'saved' ? 'default' : 'outline'}
          className={`px-6 py-2 text-lg comic-text-bold rounded-none ${
            activeTab === 'saved'
              ? 'bg-yellow-400 text-black border-b-4 border-black'
              : 'hover:bg-muted'
          }`}
        >
          💾 Saved ({likedStories.length})
        </Button>
        <Button
          onClick={() => setActiveTab('created')}
          variant={activeTab === 'created' ? 'default' : 'outline'}
          className={`px-6 py-2 text-lg comic-text-bold rounded-none ${
            activeTab === 'created'
              ? 'bg-yellow-400 text-black border-b-4 border-black'
              : 'hover:bg-muted'
          }`}
        >
          ✍️ Created ({createdStories.length})
        </Button>
      </div>

      {/* Saved Stories Section */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {likedStories.length === 0 ? (
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader className="bg-yellow-400 dark:bg-yellow-600 border-b-4 border-black text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-black" />
                <CardTitle className="text-black">Your Saved Library is Empty</CardTitle>
                <CardDescription className="text-black dark:text-white">
                  Start liking stories to build your personal library. Click the heart icon on any story to save it!
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 text-center">
                <Link href="/stories">
                  <Button className="theme-gradient-bg text-white border-0">
                    <Heart className="mr-2 h-4 w-4" />
                    Explore Stories
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearLibrary}
                >
                  Clear Saved Library
                </Button>
              </div>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
                    : 'space-y-4'
                }
              >
                {likedStories.map(story => (
                  <div key={story.id} className="relative group">
                    <StoryCard
                      story={story}
                      viewMode={viewMode}
                      isWalletConnected={!!account}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() => handleRemoveFromLibrary(story.id)}
                      title="Remove from saved library"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Created Stories Section */}
      {activeTab === 'created' && (
        <div className="space-y-4">
          {createdStories.length === 0 ? (
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader className="bg-yellow-400 dark:bg-yellow-600 border-b-4 border-black text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-black" />
                <CardTitle className="text-black">You Haven't Created Any Stories Yet</CardTitle>
                <CardDescription className="text-black dark:text-white">
                  Share your imagination with the world! Create your first story and it will appear here.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 text-center">
                <Link href="/create">
                  <Button className="theme-gradient-bg text-white border-0">
                    ✍️ Create Your First Story
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearCreated}
                >
                  Delete All Created Stories
                </Button>
              </div>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
                    : 'space-y-4'
                }
              >
                {createdStories.map(story => (
                  <div key={story.id} className="relative group">
                    <StoryCard
                      story={story}
                      viewMode={viewMode}
                      isWalletConnected={!!account}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() => handleRemoveCreatedStory(story.id)}
                      title="Delete created story"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default LibraryClient;
