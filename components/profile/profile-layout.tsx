'use client';
import {
    Activity,
    BookOpen,
    Bookmark,
    CheckCircle2,
    Settings,
    Wallet,
} from 'lucide-react';
import React from 'react';

import { AvatarSelector } from '@/components/profile/avatar-selector';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserProfileUI } from '@/types/profile';

interface ProfileLayoutProps {

    userData: UserProfileUI;
    isOwner: boolean;
    isEditing: boolean;
    onEditToggle: () => void;
    onAvatarChange: (newAvatar: string) => void;
    children: React.ReactNode;
}

export function ProfileLayout({
    userData,
    isOwner,
    isEditing,
    onEditToggle,
    onAvatarChange,
    children,
}: ProfileLayoutProps) {
    const initials = userData.name
        ? userData.name.slice(0, 2).toUpperCase()
        : 'AU';

    return (
        <div className="min-h-screen bg-background pb-12">
            <div className="h-48 md:h-64 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 relative">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
            </div>

            <div className="container mx-auto px-4 relative -mt-24 z-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden">
                            <div className="p-6 flex flex-col items-center text-center">


                                <div className="relative mb-6 group">
                                    {isOwner && isEditing ? (
                                        <AvatarSelector
                                            currentAvatar={userData.avatar}
                                            onAvatarChange={onAvatarChange}
                                        >
                                            <div className="relative cursor-pointer transition-opacity hover:opacity-90">
                                                <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                                                    <AvatarImage src={userData.avatar} alt={userData.name} />
                                                    <AvatarFallback className="text-3xl font-bold bg-slate-100 dark:bg-slate-800">
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                                                    <Settings className="w-8 h-8 text-white" />
                                                </div>
                                            </div>
                                        </AvatarSelector>
                                    ) : (
                                        <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                                            <AvatarImage src={userData.avatar} alt={userData.name} />
                                            <AvatarFallback className="text-3xl font-bold bg-slate-100 dark:bg-slate-800">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>


                                <h1 className="text-2xl font-black uppercase italic tracking-tight mb-1">
                                    {userData.name || 'Anonymous User'}
                                </h1>
                                <p className="text-muted-foreground font-mono text-sm mb-4">
                                    {userData.username.startsWith('0x')
                                        ? `${userData.username.slice(0, 6)}...${userData.username.slice(-4)}`
                                        : `@${userData.username}`}
                                </p>


                                {userData.walletAddress && (
                                    <Badge
                                        variant="outline"
                                        className="mb-2 bg-slate-100 dark:bg-slate-800 font-mono text-xs"
                                    >
                                        <Wallet className="w-3 h-3 mr-1" />
                                        {userData.walletAddress.slice(0, 6)}...{userData.walletAddress.slice(-4)}
                                    </Badge>
                                )}

                                {/* Verified Badge */}
                                {userData.isVerified && (
                                    <Badge
                                        variant="outline"
                                        className="mb-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                    >
                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Creator
                                    </Badge>
                                )}

                                {/* Stats */}
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

                                {/* Edit / Follow Button */}
                                {isOwner ? (
                                    <Button
                                        variant={isEditing ? 'destructive' : 'outline'}
                                        className="w-full mt-6 font-bold border-2"
                                        onClick={onEditToggle}
                                    >
                                        {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                                    </Button>
                                ) : (
                                    <Button className="w-full mt-6 font-bold bg-primary text-white shadow-lg hover:translate-y-[-2px] transition-transform">
                                        Follow
                                    </Button>
                                )}
                            </div>
                        </Card>

                        {!isEditing && (
                            <Card className="border-2 border-slate-200 dark:border-slate-800">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                        About
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm leading-relaxed">
                                        {userData.bio || 'No bio provided.'}
                                    </p>
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

                    {/* Right Column */}
                    <div className="lg:col-span-3 space-y-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ProfileContentTabs() {
    return (
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
    );
}
