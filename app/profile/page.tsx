'use client';

import { useParams } from 'next/navigation';

import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import ProfileError from '@/components/profile/ProfileError';

import { useProfile } from '@/lib/hooks/useProfile';
import { useProfileStories } from '@/lib/hooks/useProfileStories';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const loggedInUsername = 'amangp';

  const isSelf = username === loggedInUsername;

  const { profile, loading, error } = useProfile(username);
  const { stories, saved } = useProfileStories(username);

  if (loading) return <ProfileSkeleton />;
  if (error || !profile) return <ProfileError />;

  return (
    <main className="container mx-auto px-4 py-12">
      <ProfileHeader profile={profile} isSelf={isSelf} />

      <ProfileStats
        storiesCount={profile.stats.storiesCount}
        followersCount={profile.stats.followers}
        totalViews={profile.stats.totalViews}
        totalLikes={profile.stats.totalLikes}
      />

      <ProfileTabs stories={stories} saved={saved} />

      <section className="mt-12">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <p className="text-muted-foreground">No recent activity yet.</p>
      </section>
    </main>
  );
}
