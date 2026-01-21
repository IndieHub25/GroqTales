'use client';
import { CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import ProfileError from '@/components/profile/ProfileError';
import { useProfile } from '@/lib/hooks/useProfile';
import { useProfileStories } from '@/lib/hooks/useProfileStories';

/* ---------------------------------------------------------
   MOCK-ONLY DATA (BADGES)
--------------------------------------------------------- */
const mockBadges = ['Top Creator', 'Early Adopter', 'Story Master'];

export default function ProfilePage() {
  const loggedInUsername = 'amangp';

  const { profile, loading, error } = useProfile(loggedInUsername);
  const { stories, saved } = useProfileStories(loggedInUsername);

  if (loading) return <ProfileSkeleton />;
  if (error || !profile) return <ProfileError />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-12">
        {/* ================= PROFILE HEADER ================= */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-background">
                <AvatarImage
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                />
                <AvatarFallback>{profile.displayName.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                  {profile.isVerified && (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>

                <p className="text-muted-foreground mb-4">
                  @{profile.username}
                </p>

                {profile.bio && <p className="text-sm mb-4">{profile.bio}</p>}

                {/* Mock-only badges */}
                <div className="flex flex-wrap gap-2">
                  {mockBadges.map((badge) => (
                    <Badge key={badge} variant="secondary">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ================= STATS ================= */}
        <ProfileStats
          storiesCount={profile.stats.storiesCount}
          followersCount={profile.stats.followersCount}
          totalViews={profile.stats.totalViews}
          totalLikes={profile.stats.totalLikes}
        />

        {/* ================= TABS ================= */}
        <ProfileTabs stories={stories} savedStories={saved} isSelf={true} />
      </div>
    </div>
  );
}
