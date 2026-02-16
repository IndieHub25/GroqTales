// Commented out due to missing module
// import { sendFrameNotification } from "@/lib/notification-client";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const notificationData = await request.json();

    // Placeholder response since the notification client call needs to be fixed
    console.log('Notification request received:', notificationData);
    return NextResponse.json({
      success: true,
      message: 'Notification functionality is currently disabled.',
    });
  } catch (error) {
    console.error('Error processing notification request:', error);
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    );
  }
}
