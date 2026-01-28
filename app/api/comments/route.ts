import { NextRequest, NextResponse } from 'next/server';

/**
 * Check if the request has admin privileges
 */
function isAdminRequest(request: NextRequest): boolean {
  const cookies = request.cookies;
  return cookies.get('adminSessionActive')?.value === 'true';
}

/**
 * GET /api/comments?storyId=xxx
 * Fetch all comments for a specific story
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('storyId');

    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }

    // Mock response for now - will be replaced with actual DB query
    const mockComments = [
      {
        id: '1',
        storyId,
        authorId: 'user1',
        author: {
          name: 'Alice Johnson',
          username: 'alicej',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
          walletAddress: '0x1234...5678',
          isVerified: false,
        },
        content: 'This is an amazing story! I love the plot twist.',
        parentId: null,
        status: 'active',
        likes: 5,
        likedBy: [],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '2',
        storyId,
        authorId: 'user2',
        author: {
          name: 'Bob Smith',
          username: 'bobsmith',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
          walletAddress: '0x8765...4321',
          isVerified: true,
        },
        content: 'Great work! Looking forward to the next chapter.',
        parentId: null,
        status: 'active',
        likes: 3,
        likedBy: [],
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];

    return NextResponse.json({ comments: mockComments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/comments
 * Create a new comment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyId, content, author, parentId } = body;

    // Validation
    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (content.trim().length > 1000) {
      return NextResponse.json(
        { error: 'Comment cannot exceed 1000 characters' },
        { status: 400 }
      );
    }

    if (!author || !author.name || !author.username) {
      return NextResponse.json(
        { error: 'Author information is required' },
        { status: 400 }
      );
    }

    // Mock response - will be replaced with actual DB insert
    const newComment = {
      id: `comment-${Date.now()}`,
      storyId,
      authorId: author.walletAddress || author.username,
      author: {
        name: author.name,
        username: author.username,
        avatar:
          author.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.username}`,
        walletAddress: author.walletAddress,
        isVerified: author.isVerified || false,
      },
      content: content.trim(),
      parentId: parentId || null,
      status: 'active',
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/comments?commentId=xxx
 * Delete a comment (soft delete by setting status to 'deleted')
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check admin privileges (TODO: also allow comment owner)
    if (!isAdminRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    // Mock response - will be replaced with actual DB update
    return NextResponse.json(
      { message: 'Comment deleted successfully', commentId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
