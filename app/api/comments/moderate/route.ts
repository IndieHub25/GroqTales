import { NextRequest, NextResponse } from 'next/server';

/**
 * Check if the request has admin privileges
 */
function isAdminRequest(request: NextRequest): boolean {
  const cookies = request.cookies;
  return cookies.get('adminSessionActive')?.value === 'true';
}

/**
 * PATCH /api/comments/moderate
 * Moderate a comment (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check admin privileges server-side
    if (!isAdminRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { commentId, action } = body;

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    if (!action || !['approve', 'moderate', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: approve, moderate, or delete' },
        { status: 400 }
      );
    }

    // Map action to status
    const statusMap: Record<string, string> = {
      approve: 'active',
      moderate: 'moderated',
      delete: 'deleted',
    };

    const newStatus = statusMap[action];

    // Mock response - will be replaced with actual DB update
    const mockResponse = {
      commentId,
      status: newStatus,
      message: `Comment ${action}d successfully`,
    };

    return NextResponse.json(mockResponse, { status: 200 });
  } catch (error) {
    console.error('Error moderating comment:', error);
    return NextResponse.json(
      { error: 'Failed to moderate comment' },
      { status: 500 }
    );
  }
}
