import { NextResponse } from 'next/server';

/**
 * Bot Health Check API Route
 * Proxies to the backend server bot health endpoint
 */
export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com';
  const controller = new AbortController();
  const timeoutMs = 5000; // 5 second timeout
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(`${backendUrl}/api/health/bot`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!response.ok) {
      return NextResponse.json(
        { 
          status: 'down',
          service: 'madhava-helpbot',
          error: 'Backend bot health check failed',
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    clearTimeout(timeout);
    return NextResponse.json(
      { 
        status: 'down',
        service: 'madhava-helpbot',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
