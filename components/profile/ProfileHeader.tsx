'use client';

import Link from 'next/link';
import { CheckCircle2, Share2, UserPlus, Settings } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserProfile } from '@/types/profile';

interface Props {
  profile: UserProfile;
  isSelf: boolean;
}

export default function ProfileHeader({ profile, isSelf }: Props) {
  return (
    <Card className="mb-8">
      <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
        <Avatar className="w-24 h-24">
          <AvatarImage
            src={profile.avatarUrl ?? ''}
            alt={profile.displayName}
          />
          <AvatarFallback>
            {profile.displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {profile.displayName}
            {profile.isVerified && (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            )}
          </h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-primary/10">
            {profile.primaryGenre}
          </span>
          {profile.bio && (
            <p className="mt-3 text-sm text-muted-foreground max-w-xl">
              {profile.bio}
            </p>
          )}
        </div>

        {isSelf ? (
          <Button asChild variant="outline">
            <Link href="/profile/settings">
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Link>
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline">
              <UserPlus className="w-4 h-4 mr-2" />
              Follow
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
