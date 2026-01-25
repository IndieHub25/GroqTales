'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageSquare,
  DollarSign,
  Trophy,
  Calendar,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VerifiedBadge } from '@/components/verified-badge';

interface CreatorAnalytics {
  creatorId: string;
  creatorName: string;
  avatarUrl?: string | null;
  isVerified: boolean;
  totalStories: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalBookmarks: number;
  averageRating: number;
  totalNFTs: number;
  totalNFTSales: number;
  totalRevenue: number;
  totalEngagement: number;
  stories: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
    createdAt: string;
    isNft: boolean;
  }>;
  nfts: Array<{
    id: string;
    name: string;
    price: number;
    isForSale: boolean;
    salesCount: number;
    lastSalePrice?: number;
    createdAt: string;
  }>;
}

export function CreatorAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<CreatorAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/analytics/creators?timeframe=${timeframe}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
      } else {
        setError(data.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching creator analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ETH`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p className="font-medium">Error loading analytics</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={fetchAnalytics}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with timeframe selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Creator Analytics</h2>
          <p className="text-muted-foreground">
            Performance insights for top creators
          </p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Top Creators List */}
      <div className="grid gap-4">
        {analytics.map((creator, index) => (
          <Card key={creator.creatorId} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Rank */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {index === 0 ? (
                      <Trophy className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <span className="text-sm font-bold text-primary">
                        #{index + 1}
                      </span>
                    )}
                  </div>
                </div>

                {/* Creator Info */}
                <div className="flex-shrink-0">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={creator.avatarUrl || undefined} />
                    <AvatarFallback>
                      {creator.creatorName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Creator Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold truncate">
                      {creator.creatorName}
                    </h3>
                    {creator.isVerified && <VerifiedBadge size="sm" />}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Views</p>
                        <p className="font-semibold">
                          {formatNumber(creator.totalViews)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Likes</p>
                        <p className="font-semibold">
                          {formatNumber(creator.totalLikes)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Comments
                        </p>
                        <p className="font-semibold">
                          {formatNumber(creator.totalComments)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="font-semibold">
                          {formatCurrency(creator.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary">
                      {creator.totalStories} Stories
                    </Badge>
                    <Badge variant="secondary">{creator.totalNFTs} NFTs</Badge>
                    <Badge variant="secondary">
                      {creator.totalNFTSales} Sales
                    </Badge>
                    {creator.averageRating > 0 && (
                      <Badge variant="secondary">
                        ⭐ {creator.averageRating.toFixed(1)}
                      </Badge>
                    )}
                  </div>

                  {/* Top Stories */}
                  {creator.stories.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium mb-2">Top Stories</p>
                      <div className="space-y-1">
                        {creator.stories
                          .sort((a, b) => b.views - a.views)
                          .slice(0, 3)
                          .map((story) => (
                            <div
                              key={story.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="truncate flex-1 mr-2">
                                {story.title}
                              </span>
                              <div className="flex items-center gap-3 text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {formatNumber(story.views)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  {story.likes}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {analytics.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Analytics Data</h3>
            <p className="text-muted-foreground">
              No creator analytics available for the selected timeframe.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
