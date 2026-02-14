import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Story from '../../../../models/Story';
import { UserInteraction } from '../../../../models/UserInteraction';
import { VALIDATION_PATTERNS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = (searchParams.get('wallet') || '').trim().toLowerCase();

    if (!wallet || !VALIDATION_PATTERNS.walletAddress.test(wallet)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    await dbConnect();

    const stories = await Story.find({ authorWallet: wallet })
      .select({ _id: 1, title: 1, status: 1, updatedAt: 1, nftTokenId: 1, nftTxHash: 1 })
      .sort({ updatedAt: -1 })
      .lean();

    if (stories.length === 0) {
      return NextResponse.json({
        totals: { views: 0, likes: 0, bookmarks: 0, mints: 0 },
        stories: [],
      });
    }

    const storyIds = stories.map((story: any) => story._id);

    const aggregation = await UserInteraction.aggregate([
      {
        $match: {
          storyId: { $in: storyIds },
          type: { $in: ['VIEW', 'LIKE', 'BOOKMARK'] },
        },
      },
      {
        $group: {
          _id: { storyId: '$storyId', type: '$type' },
          value: { $sum: '$value' },
        },
      },
    ]);

    const metricsByStoryId = new Map<
      string,
      { views: number; likes: number; bookmarks: number }
    >();

    for (const row of aggregation) {
      const storyId = row?._id?.storyId?.toString?.() || '';
      const type = row?._id?.type as 'VIEW' | 'LIKE' | 'BOOKMARK';
      const value = Number(row?.value) || 0;
      if (!storyId || !type) {
        continue;
      }
      const existing = metricsByStoryId.get(storyId) || { views: 0, likes: 0, bookmarks: 0 };
      if (type === 'VIEW') existing.views += value;
      if (type === 'LIKE') existing.likes += value;
      if (type === 'BOOKMARK') existing.bookmarks += value;
      metricsByStoryId.set(storyId, existing);
    }

    const storyRows = stories.map((story: any) => {
      const storyId = story._id.toString();
      const engagement = metricsByStoryId.get(storyId) || { views: 0, likes: 0, bookmarks: 0 };
      const minted = story.nftTokenId ? 1 : 0;
      return {
        storyId,
        title: story.title || 'Untitled',
        status: story.status || 'draft',
        updatedAt: story.updatedAt ? new Date(story.updatedAt).getTime() : Date.now(),
        views: engagement.views,
        likes: engagement.likes,
        bookmarks: engagement.bookmarks,
        mints: minted,
      };
    });

    const totals = storyRows.reduce(
      (acc, row) => {
        acc.views += row.views;
        acc.likes += row.likes;
        acc.bookmarks += row.bookmarks;
        acc.mints += row.mints;
        return acc;
      },
      { views: 0, likes: 0, bookmarks: 0, mints: 0 }
    );

    return NextResponse.json({
      totals,
      stories: storyRows,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

