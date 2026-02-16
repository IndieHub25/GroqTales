import { NextRequest, NextResponse } from "next/server";

// Mock API route for Monad blockchain integration
// This is disabled to prevent deployment errors related to onchain functionality

export async function POST(request: NextRequest) {
  // Return disabled response for deployment compatibility
  return NextResponse.json(
    {
      error: "Monad blockchain functionality is disabled for this deployment",
      message: "This feature is not available in the current build",
    },
    { status: 503 },
  );
}

export async function GET(request: NextRequest) {
  // Return disabled response for deployment compatibility
  return NextResponse.json(
    {
      error: "Monad blockchain functionality is disabled for this deployment",
      message: "This feature is not available in the current build",
    },
    { status: 503 },
  );
}
