import { NextRequest, NextResponse } from 'next/server';

import { find, getCollection } from '@/lib/db';
import { Story } from '@/types/story';
import { NFT } from '@/types/nft';

/**
 * GET /api/analytics/creators
 * Get analytics data for creators
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d'; // 7d, 30d, 90d, all
    const limit = parseInt(searchParams.get('limit') || '50');

    // Calculate date filter based on timeframe
    const now = new Date();
    let dateFilter = {};
    if (timeframe !== 'all') {
      const days = parseInt(timeframe.replace('d', ''));
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: startDate } };
    }

    // Get all stories with their stats
    const stories = (await find('stories', dateFilter)) as Story[];

    // Get all NFTs
    const nfts = (await find('nfts', dateFilter)) as NFT[];

    // Aggregate data by creator
    const creatorAnalytics = new Map();

    // Process stories
    for (const story of stories) {
      const creatorId = story.authorId;
      if (!creatorAnalytics.has(creatorId)) {
        creatorAnalytics.set(creatorId, {
          creatorId,
          creatorName: story.author.displayName || story.author.username,
          avatarUrl: story.author.avatarUrl,
          isVerified: story.author.isVerified,
          totalStories: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalBookmarks: 0,
          averageRating: 0,
          totalNFTs: 0,
          totalNFTSales: 0,
          totalRevenue: 0,
          stories: [],
          nfts: [],
        });
      }

      const creator = creatorAnalytics.get(creatorId);
      creator.totalStories += 1;
      creator.totalViews += story.stats.views;
      creator.totalLikes += story.stats.likes;
      creator.totalComments += story.stats.comments;
      creator.totalShares += story.stats.shares;
      creator.totalBookmarks += story.stats.bookmarks;
      creator.averageRating = (creator.averageRating + story.stats.rating) / 2;

      creator.stories.push({
        id: (story as any)._id.toString(),
        title: story.title,
        views: story.stats.views,
        likes: story.stats.likes,
        comments: story.stats.comments,
        createdAt: story.createdAt,
        isNft: story.isNft,
      });
    }

    // Process NFTs
    for (const nft of nfts) {
      const creatorId = nft.creatorAddress;
      if (!creatorAnalytics.has(creatorId)) {
        // If creator not found in stories, create basic entry
        creatorAnalytics.set(creatorId, {
          creatorId,
          creatorName: `Creator ${creatorId.slice(-6)}`,
          avatarUrl: null,
          isVerified: false,
          totalStories: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalBookmarks: 0,
          averageRating: 0,
          totalNFTs: 0,
          totalNFTSales: 0,
          totalRevenue: 0,
          stories: [],
          nfts: [],
        });
      }

      const creator = creatorAnalytics.get(creatorId);
      creator.totalNFTs += 1;

      // Calculate sales from price history
      if (nft.stats.priceHistory && nft.stats.priceHistory.length > 0) {
        creator.totalNFTSales += nft.stats.priceHistory.length;
        const totalRevenue = nft.stats.priceHistory.reduce(
          (sum, sale) => sum + sale.price,
          0
        );
        creator.totalRevenue += totalRevenue;
      }

      creator.nfts.push({
        id: (nft as any)._id.toString(),
        name: nft.name,
        price: nft.price,
        isForSale: nft.isForSale,
        salesCount: nft.stats.priceHistory?.length || 0,
        lastSalePrice: nft.stats.lastSalePrice,
        createdAt: nft.createdAt,
      });
    }

    // Convert to array and sort by total engagement (views + likes + comments)
    const analytics = Array.from(creatorAnalytics.values())
      .map((creator) => ({
        ...creator,
        totalEngagement:
          creator.totalViews + creator.totalLikes + creator.totalComments,
      }))
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: analytics,
      timeframe,
      totalCreators: analytics.length,
    });
  } catch (error) {
    console.error('Error fetching creator analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
