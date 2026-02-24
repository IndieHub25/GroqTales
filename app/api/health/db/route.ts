import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const t0 = Date.now();
  try {
    const supabase = createClient();

    // Attempt a lightweight query to test DB auth and access
    const { error } = await supabase.from('profiles').select('id').limit(1);

    if (error) throw error;

    const latencyMs = Date.now() - t0;
    const status = latencyMs > 1000 ? 'degraded' : 'ok';

    return NextResponse.json(
      {
        status,
        timestamp: new Date().toISOString(),
        latencyMs,
        details: {
          connected: true,
          connectionAttempts: 1,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Health] Database health check error:', error.message);

    return NextResponse.json(
      {
        status: 'down',
        timestamp: new Date().toISOString(),
        message: 'Database connection failed',
        details: {
          connected: false,
        }
      },
      { status: 503 }
    );
  }
}
