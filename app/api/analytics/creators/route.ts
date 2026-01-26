import type { Collection } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { getCollection } from '@/lib/db';

/**
 * Check if the request has admin privileges
 */
function isAdminRequest(request: NextRequest): boolean {
  const cookies = request.cookies;
  return cookies.get('adminSessionActive')?.value === 'true';
}

/**
 * GET /api/analytics/creators
 * Get analytics data for creators
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin privileges
    if (!isAdminRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d'; // 7d, 30d, 90d, all
    const limitParam = searchParams.get('limit') || '50';

    // Validate timeframe parameter
    const validTimeframes = ['7d', '30d', '90d', 'all'];
    if (!validTimeframes.includes(timeframe)) {
      return NextResponse.json(
        { error: 'Invalid timeframe. Must be one of: 7d, 30d, 90d, all' },
        { status: 400 }
      );
    }

    const parsedLimit = parseInt(limitParam, 10);
    if (Number.isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 1000) {
      return NextResponse.json(
        { error: 'Invalid limit. Must be a number between 1 and 1000' },
        { status: 400 }
      );
    }
    const limit = parsedLimit;

    // Calculate date filter based on timeframe
    const now = new Date();
    let dateFilter = {};
    if (timeframe !== 'all') {
      const timeframeMatch = timeframe.match(/^(\d+)d$/);
      if (timeframeMatch && timeframeMatch[1]) {
        const days = parseInt(timeframeMatch[1], 10);
        if (Number.isFinite(days) && days > 0) {
          const startDate = new Date(
            now.getTime() - days * 24 * 60 * 60 * 1000
          );
          dateFilter = { createdAt: { $gte: startDate } };
        }
      }
    }

    // Aggregate stories data by creator
    const storyCollection = await getCollection('stories');
    const storyAgg = await (storyCollection as Collection)
      .aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$authorId',
            creatorName: { $first: '$author.displayName' },
            avatarUrl: { $first: '$author.avatarUrl' },
            isVerified: { $first: '$author.isVerified' },
            totalStories: { $sum: 1 },
            totalViews: { $sum: '$stats.views' },
            totalLikes: { $sum: '$stats.likes' },
            totalComments: { $sum: '$stats.comments' },
            totalShares: { $sum: '$stats.shares' },
            totalBookmarks: { $sum: '$stats.bookmarks' },
            averageRating: { $avg: '$stats.rating' },
          },
        },
      ])
      .toArray();

    // Aggregate NFTs data by creator
    const nftCollection = await getCollection('nfts');
    const nftAgg = await (nftCollection as Collection)
      .aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$creatorAddress',
            totalNFTs: { $sum: 1 },
            totalNFTSales: {
              $sum: { $size: { $ifNull: ['$stats.priceHistory', []] } },
            },
            totalRevenue: {
              $sum: {
                $reduce: {
                  input: { $ifNull: ['$stats.priceHistory', []] },
                  initialValue: 0,
                  in: { $add: ['$$value', '$$this.price'] },
                },
              },
            },
          },
        },
      ])
      .toArray();

    // Aggregate data by creator
    const creatorAnalytics = new Map();

    // Process aggregated stories
    for (const agg of storyAgg) {
      const idStr = String(agg._id);
      creatorAnalytics.set(agg._id, {
        creatorId: idStr,
        creatorName: agg.creatorName || `Creator ${idStr.slice(-6)}`,
        avatarUrl: agg.avatarUrl,
        isVerified: agg.isVerified || false,
        totalStories: agg.totalStories,
        totalViews: agg.totalViews,
        totalLikes: agg.totalLikes,
        totalComments: agg.totalComments,
        totalShares: agg.totalShares,
        totalBookmarks: agg.totalBookmarks,
        averageRating: agg.averageRating || 0,
        totalNFTs: 0,
        totalNFTSales: 0,
        totalRevenue: 0,
      });
    }

    // Process aggregated NFTs
    for (const agg of nftAgg) {
      const idStr = String(agg._id);
      if (!creatorAnalytics.has(agg._id)) {
        creatorAnalytics.set(agg._id, {
          creatorId: idStr,
          creatorName: `Creator ${idStr.slice(-6)}`,
          avatarUrl: null,
          isVerified: false,
          totalStories: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalBookmarks: 0,
          averageRating: 0,
          totalNFTs: agg.totalNFTs,
          totalNFTSales: agg.totalNFTSales,
          totalRevenue: agg.totalRevenue,
        });
      } else {
        const creator = creatorAnalytics.get(agg._id);
        creator.totalNFTs = agg.totalNFTs;
        creator.totalNFTSales = agg.totalNFTSales;
        creator.totalRevenue = agg.totalRevenue;
      }
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
