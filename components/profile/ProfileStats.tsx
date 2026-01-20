'use client';

import { BookOpen, Eye, Heart, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  storiesCount?: number;
  followersCount?: number;
  totalViews?: number;
  totalLikes?: number;
}

export default function ProfileStats({
  storiesCount = 0,
  followersCount = 0,
  totalViews = 0,
  totalLikes = 0,
}: Props) {
  const stats = [
    { label: 'Stories', value: storiesCount, icon: BookOpen },
    { label: 'Followers', value: followersCount, icon: Users },
    { label: 'Total Views', value: totalViews, icon: Eye },
    { label: 'Total Likes', value: totalLikes, icon: Heart },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardContent className="p-6 flex items-center gap-4">
            <Icon className="w-6 h-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-xl font-bold">{value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
