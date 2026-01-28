import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/comments/like
 * Toggle like on a comment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commentId, userId } = body;

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Mock response - will be replaced with actual DB update
    const mockResponse = {
      commentId,
      liked: true,
      likes: 6,
    };

    return NextResponse.json(mockResponse, { status: 200 });
  } catch (error) {
    console.error('Error liking comment:', error);
    return NextResponse.json(
      { error: 'Failed to like comment' },
      { status: 500 }
    );
  }
}
