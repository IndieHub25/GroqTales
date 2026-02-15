'use client';

import {
  Settings,
  BookOpen,
  Bookmark,
  Activity,
  CheckCircle2,
  Users,
  Wallet,
  Trophy,
  Eye,
  Heart,
  Github,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState,useEffect } from 'react';
// Sample user data
// const userData = {
//   name: 'Alex Thompson',
//   username: '@alexstoryteller',
//   avatar: '/avatars/alex.jpg',
//   bio: 'Web3 storyteller exploring the intersection of AI and blockchain. Creating unique narrative experiences one story at a time.',
//   joinDate: 'March 2024',
//   isVerified: true,
//   storiesCount: 15,
//   followers: 1240,
//   following: 384,
//   walletAddress: '0x1234...5678',
//   badges: ['Top Creator', 'Early Adopter', 'Story Master'],
//   favoriteGenres: ['Science Fiction', 'Fantasy', 'Mystery'],
//   totalViews: 25600,
//   totalLikes: 3200,
// };

// Sample story data
// const userStories = [
//   {
//     id: 1,
//     title: 'The Last Algorithm',
//     excerpt: 'In a world where AI has evolved beyond human comprehension...',
//     coverImage: '/stories/algorithm-cover.jpg',
//     date: '2 days ago',
//     genre: 'Science Fiction',
//     likes: 342,
//     comments: 28,
//     isNFT: true,
//   },
//   // ... more stories
// ];

// const savedStories = [
//   {
//     id: 1,
//     title: 'Echoes of Tomorrow',
//     excerpt: 'The quantum resonance chamber hummed with possibility...',
//     coverImage: '/stories/echoes-cover.jpg',
//     date: '1 week ago',
//     genre: 'Science Fiction',
//     likes: 567,
//     comments: 45,
//     isNFT: true,
//   },
//   // ... more stories
// ];
const [profile, setProfile] = useState<any>(null);
const [stories,setStories] = useState<any[]>([]);
const [loading, setLoading] = useState<any>(null);
const [error, setError] = useState(false);

// Floating GitHub button component
const FloatingGithub = () => (
  <Link
    href="https://github.com/Drago-03/GroqTales.git"
    target="_blank"
    className="fixed bottom-24 right-6 p-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
  >
    <Github className="w-6 h-6 text-white" />
  </Link>
);

// Floating doodle elements
const FloatingDoodles = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full blur-3xl opacity-20 animate-float"></div>
    <div className="absolute bottom-40 right-20 w-40 h-40 bg-gradient-to-r from-blue-200 to-teal-200 rounded-full blur-3xl opacity-20 animate-float-delayed"></div>
    <div className="absolute top-1/2 left-1/3 w-36 h-36 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full blur-3xl opacity-20 animate-float-slow"></div>
  </div>
);

// Story card component
const StoryCard = ({ story }: any) => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
    <div className="aspect-video relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
      <img
        src={story.coverImage}
        alt={story.title}
        className="w-full h-full object-cover"
      />
      {story.isNFT && (
        <Badge className="absolute top-2 right-2 z-20">NFT</Badge>
      )}
    </div>
    <CardContent className="p-4">
      <h3 className="font-semibold text-lg mb-2">{story.title}</h3>
      <p className="text-muted-foreground text-sm mb-3">{story.excerpt}</p>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{story.date}</span>
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <Heart className="w-4 h-4 mr-1" /> {story.likes}
          </span>
          <span className="flex items-center">
            <MessageSquare className="w-4 h-4 mr-1" /> {story.comments}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);
useEffect(()=>{
  const controller = new AbortController();
  async function loadProfile() {
    try {
      setLoading(true);

      const res= await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/profile`,
          {credentials: 'include', signal: controller.signal}
      );
      if(!res.ok) throw new Error();
      const json = await res.json();
      setProfile(json.user);
      setStories(json.stories??[]);

    }catch(err){
      if((err as any).name!=='AbortError'){
        setError(true);
      }
    } finally{
      setLoading(false);
    }
  }
  loadProfile();
  return() => controller.abort();
},[]);
export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <FloatingDoodles />
      <FloatingGithub />

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Profile Info */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* <Avatar className="w-24 h-24 border-4 border-background">
                <AvatarImage src={profile?.avatar} alt={userData.name} />
                <AvatarFallback>AT</AvatarFallback>
              </Avatar> */}

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {/* <h1 className="text-2xl font-bold">{userData.name}</h1>
                  {profile?.isVerified && (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )} */}
                </div>
                <p className="text-muted-foreground mb-4">
                  {profile?.username}
                </p>
                <p className="text-sm mb-4">{profile?.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {/* {profile?.badges.map((badge) => (
                    <Badge key={badge} variant="secondary">
                      {badge}
                    </Badge> */}
                  {/* ))} */}
                </div>
              </div>

              <Button variant="outline" asChild>
                <Link href="/profile/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stories</p>
                  <p className="text-2xl font-bold">{profile?.storiesCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Followers</p>
                  <p className="text-2xl font-bold">{profile?.followers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{profile?.totalViews}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Likes</p>
                  <p className="text-2xl font-bold">{profile?.totalLikes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="stories" className="space-y-6">
          <TabsList>
            <TabsTrigger value="stories" className="space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Stories</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="space-x-2">
              <Bookmark className="w-4 h-4" />
              <span>Saved</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="space-x-2">
              <Activity className="w-4 h-4" />
              <span>Activity</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stories">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest interactions on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Activity feed would go here */}
                <p className="text-muted-foreground">Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
