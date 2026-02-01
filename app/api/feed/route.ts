import { NextResponse } from 'next/server';
import { getPersonalizedFeed } from '@/lib/feedService';
import { auth } from '@/auth/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

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