import { NextResponse } from 'next/server';
import { getPersonalizedFeed } from '@/lib/feedService';
import { auth } from '@/auth/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10));

    const userId = session?.user?.id;
    
    const stories = await getPersonalizedFeed(userId, page, limit);

    return NextResponse.json({ 
      data: stories,
      meta: { page, limit, type: userId ? 'personalized' : 'trending' }
    });

  } catch (error) {
    console.error('Feed Error:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}