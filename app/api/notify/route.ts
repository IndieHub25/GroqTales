import { NextResponse } from 'next/server';
// Make this file a module
export {};
// API route handler for sending notifications
export async function POST(req: Request) {
  try {
    // Temporarily return a static response to bypass notification logic
    return NextResponse.json(
      {
        success: true,
        message: 'Notification process skipped for build compatibility',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in notification route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process notification' },
      { status: 500 }
    );
  }
}
