export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

let feedService: any = null;
let authFunction: any = null;

// Safely import feedService
try {
  feedService = require('@/lib/feedService');
} catch (err) {
  console.warn('Could not load feedService:', err);
}

// Safely import auth with error handling
try {
  const authModule = require('@/auth/auth');
  authFunction = authModule?.auth || authModule?.default?.auth;
} catch (err) {
  console.warn('Could not load auth module:', err);
}

export async function GET(req: Request) {
  try {
    let session = null;

    // Safely call auth if available
    if (typeof authFunction === 'function') {
      try {
        session = await authFunction();
      } catch (authErr) {
        console.warn('Auth call failed, using public feed:', authErr);
      }
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10)
    );

    const parsedPage = parseInt(searchParams.get('page') || '1', 10) || 1;
    const hardCap = 1000000;
    const maxByOverflow = Math.floor(Number.MAX_SAFE_INTEGER / limit);
    const page = Math.max(1, Math.min(parsedPage, hardCap, maxByOverflow));

    const userId = session?.user?.id;

    // Try to get stories from DB, fall back to mock data
    let stories;
    try {
      if (feedService?.getPersonalizedFeed) {
        stories = await feedService.getPersonalizedFeed(userId, page, limit);
      }
    } catch (dbErr) {
      console.warn('DB feed fetch failed, using fallback:', dbErr);
    }

    // Use empty array if no stories from DB
    if (!stories || !Array.isArray(stories) || stories.length === 0) {
      return NextResponse.json({
        data: [],
        meta: { page, limit, type: 'empty' }
      });
    }

    return NextResponse.json({
      data: stories,
      meta: { page, limit, type: userId ? 'personalized' : 'trending' },
    });
  } catch (error: any) {
    console.error('Feed Error:', error);
    return NextResponse.json({
      data: [],
      meta: { page: 1, limit: 6, type: 'error', message: error?.message || 'Internal Server Error' }
    }, { status: 500 });
  }
}
