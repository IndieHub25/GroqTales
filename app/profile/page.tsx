'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import ProfileError from '@/components/profile/ProfileError';
import { CheckCircle2 } from 'lucide-react';

import { useProfile } from '@/lib/hooks/useProfile';
import { useProfileStories } from '@/lib/hooks/useProfileStories';

/* -------------------------------------------------------------------------- */
/*                               MOCK USER DATA                               */
/* -------------------------------------------------------------------------- */

const userData = {
  name: 'Alex Thompson',
  username: '@alexstoryteller',
  avatar: '/avatars/alex.jpg',
  bio: 'Web3 storyteller exploring the intersection of AI and blockchain.',
  joinDate: 'March 2024',
  isVerified: true,
  badges: ['Top Creator', 'Early Adopter', 'Story Master'],
};

/* -------------------------------------------------------------------------- */
/*                               PAGE COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function ProfilePage() {
  // Static profile page → logged-in user only
  const loggedInUsername = 'amangp';
  const isSelf = true;

  const { profile, loading, error } = useProfile(loggedInUsername);
  const { stories, saved } = useProfileStories(loggedInUsername);

  if (loading) return <ProfileSkeleton />;
  if (error || !profile) return <ProfileError />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-12">
        {/* PROFILE CARD */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userData.avatar} alt={userData.name} />
                <AvatarFallback>AT</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{userData.name}</h1>
                  {userData.isVerified && (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>

                <p className="text-muted-foreground mb-3">
                  {userData.username}
                </p>

                <p className="text-sm mb-4">{userData.bio}</p>

                <div className="flex flex-wrap gap-2">
                  {userData.badges.map((badge) => (
                    <Badge key={badge} variant="secondary">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* STATS */}
        <ProfileStats
          storiesCount={profile.stats.storiesCount}
          followersCount={profile.stats.followersCount}
          totalViews={profile.stats.totalViews}
          totalLikes={profile.stats.totalLikes}
        />

        {/* TABS */}
        <ProfileTabs stories={stories} savedStories={saved} isSelf={isSelf} />
      </div>
    </div>
  );
}
