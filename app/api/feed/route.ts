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

// Fallback stories when DB is unavailable
const FALLBACK_STORIES = [
  {
    _id: 'story-1',
    title: 'The Quantum Paradox',
    authorName: 'Alex Chen',
    genre: 'Sci-Fi',
    tags: ['quantum', 'paradox', 'sci-fi'],
    likesCount: 342,
    commentsCount: 89,
    viewsCount: 4521,
    coverImage: 'https://picsum.photos/seed/quantum/800/600',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'story-2',
    title: 'Echoes of the Forgotten Realm',
    authorName: 'Maya Patel',
    genre: 'Fantasy',
    tags: ['fantasy', 'magic', 'adventure'],
    likesCount: 287,
    commentsCount: 64,
    viewsCount: 3890,
    coverImage: 'https://picsum.photos/seed/echoes/800/600',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'story-3',
    title: 'Midnight at the Crossroads',
    authorName: 'Jordan Blake',
    genre: 'Mystery',
    tags: ['mystery', 'thriller', 'detective'],
    likesCount: 198,
    commentsCount: 45,
    viewsCount: 2750,
    coverImage: 'https://picsum.photos/seed/midnight/800/600',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'story-4',
    title: 'Starship Chronicles: Dawn',
    authorName: 'Sam Rivera',
    genre: 'Sci-Fi',
    tags: ['space', 'starship', 'exploration'],
    likesCount: 412,
    commentsCount: 102,
    viewsCount: 5200,
    coverImage: 'https://picsum.photos/seed/starship/800/600',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'story-5',
    title: 'The Dragon\'s Last Song',
    authorName: 'Luna Frost',
    genre: 'Fantasy',
    tags: ['dragon', 'epic', 'fantasy'],
    likesCount: 567,
    commentsCount: 134,
    viewsCount: 7100,
    coverImage: 'https://picsum.photos/seed/dragon/800/600',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'story-6',
    title: 'Neural Drift',
    authorName: 'Kai Tanaka',
    genre: 'Sci-Fi',
    tags: ['cyberpunk', 'ai', 'neural'],
    likesCount: 245,
    commentsCount: 78,
    viewsCount: 3400,
    coverImage: 'https://picsum.photos/seed/neural/800/600',
    createdAt: new Date().toISOString(),
  },
];

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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10));

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

    // Use fallback if no stories from DB
    if (!stories || !Array.isArray(stories) || stories.length === 0) {
      const start = (page - 1) * limit;
      stories = FALLBACK_STORIES.slice(start, start + limit);

      return NextResponse.json({
        data: stories,
        meta: { page, limit, type: 'fallback' }
      });
    }

    return NextResponse.json({
      data: stories,
      meta: { page, limit, type: userId ? 'personalized' : 'trending' }
    });

  } catch (error) {
    console.error('Feed Error:', error);
    // Even on total failure, return fallback data
    return NextResponse.json({
      data: FALLBACK_STORIES.slice(0, 6),
      meta: { page: 1, limit: 6, type: 'fallback' }
    });
  }
}