'use client';

import {
  Activity,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Eye,
  Github,
  Heart,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

import { AvatarSelector } from '@/components/profile/avatar-selector';
import { ProfileInfoForm } from '@/components/profile/profile-info-form';
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

// Sample user data (mimicking backend data for now)
const initialUserData = {
  name: 'Alex Thompson',
  username: 'alexstoryteller',
  avatar: '/avatars/alex.jpg', // Placeholder
  bio: 'Web3 storyteller exploring the intersection of AI and blockchain. Creating unique narrative experiences one story at a time.',
  website: 'https://groqtales.io',
  twitter: 'alex_web3',
  github: 'alex-dev',
  email: 'alex@example.com',
  joinDate: 'March 2024',
  isVerified: true,
  storiesCount: 0,
  followers: 1240,
  following: 384,
  walletAddress: '0x1234...5678',
  badges: ['Top Creator', 'Early Adopter', 'Story Master'],
  totalViews: 25600,
  totalLikes: 3200,
};

export default function ProfilePage() {
  const [userData, setUserData] = useState(initialUserData);
  const [isEditing, setIsEditing] = useState(false);

  // Handlers for profile updates
  const handleAvatarChange = (newAvatar: string) => {
    setUserData(prev => ({ ...prev, avatar: newAvatar }));
    // In a real app, you'd trigger a backend update here
  };

  const handleProfileSave = (updatedData: any) => {
    setUserData(prev => ({ ...prev, ...updatedData }));
    setIsEditing(false);
    // In a real app, you'd trigger a backend update here
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header / Cover Area */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 relative">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 relative -mt-24 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left Column: Profile Card & Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden">
              <div className="p-6 flex flex-col items-center text-center">
                <div className="relative mb-4 group">
                  <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback className="text-3xl font-bold bg-slate-100 dark:bg-slate-800">
                      {userData.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <AvatarSelector currentAvatar={userData.avatar} onAvatarChange={handleAvatarChange}>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-0 right-0 rounded-full shadow-lg border-2 border-background hover:scale-110 transition-transform"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </AvatarSelector>
                  )}
                </div>

                <h1 className="text-2xl font-black uppercase italic tracking-tight mb-1">{userData.name}</h1>
                <p className="text-muted-foreground font-mono text-sm mb-4">@{userData.username}</p>

                {userData.isVerified && (
                  <Badge variant="outline" className="mb-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Creator
                  </Badge>
                )}

                {!isEditing && (
                  <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="font-bold text-lg">{userData.storiesCount}</div>
                        <div className="text-xs text-muted-foreground uppercase font-bold">Stories</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg">{userData.followers}</div>
                        <div className="text-xs text-muted-foreground uppercase font-bold">Followers</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg">{userData.following}</div>
                        <div className="text-xs text-muted-foreground uppercase font-bold">Following</div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  variant={isEditing ? "destructive" : "outline"}
                  className="w-full mt-6 font-bold border-2"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel Editing" : "Edit Profile"}
                </Button>
              </div>
            </Card>

            {!isEditing && (
              <Card className="border-2 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed">{userData.bio}</p>

                  <div className="flex flex-wrap gap-2">
                    {userData.badges.map((badge) => (
                      <Badge key={badge} variant="secondary" className="font-mono text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Total Views</div>
                      <div className="font-mono font-bold">{userData.totalViews.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Total Likes</div>
                      <div className="font-mono font-bold">{userData.totalLikes.toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {isEditing ? (
              <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-none">
                <CardHeader>
                  <CardTitle className="text-2xl font-black uppercase italic">Edit Profile</CardTitle>
                  <CardDescription>Update your personal information and public profile.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileInfoForm
                    initialData={{
                      displayName: userData.name,
                      username: userData.username,
                      bio: userData.bio,
                      website: userData.website,
                      twitter: userData.twitter,
                      github: userData.github,
                      email: userData.email
                    }}
                    isEditing={true}
                    onSave={handleProfileSave}
                  />
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="stories" className="space-y-6">
                <TabsList className="bg-transparent p-0 border-b border-slate-200 dark:border-slate-800 w-full justify-start h-auto rounded-none">
                  <TabsTrigger
                    value="stories"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 font-bold uppercase tracking-wide"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Stories
                  </TabsTrigger>
                  <TabsTrigger
                    value="saved"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 font-bold uppercase tracking-wide"
                  >
                    <Bookmark className="w-4 h-4 mr-2" />
                    Saved
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 font-bold uppercase tracking-wide"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="stories" className="mt-6">
                  <div className="p-10 text-center text-muted-foreground border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No stories published yet.</p>
                  </div>
                </TabsContent>

                <TabsContent value="saved" className="mt-6">
                  <div className="p-10 text-center text-muted-foreground border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No saved stories yet.</p>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-6">
                  <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <Activity className="w-12 h-12 mb-4 opacity-20" />
                      <p className="font-medium">No recent activity</p>
                      <p className="text-sm">Your interactions will appear here soon.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}