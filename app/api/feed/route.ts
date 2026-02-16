import { NextResponse } from 'next/server';
import { getPersonalizedFeed } from '@/lib/feedService';
<<<<<<< HEAD
import { auth } from '@/auth/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
=======

let authFunction: any = null;

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
    
>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
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