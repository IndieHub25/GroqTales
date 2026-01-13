/**
 * Database Health Check Endpoint
 * Provides connection status and latency metrics for monitoring
 * Part of Issue #166: Database Connection Retries and Health Check Endpoint
 */

import { NextResponse } from 'next/server';

import {
  getConnectionStatus,
  getConnectionState,
  measureLatency,
} from '@/lib/db/connect';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  latencyMs?: number;
  details?: {
    connected: boolean;
    lastConnectionTime?: string;
    connectionAttempts?: number;
  };
  message?: string;
}

/**
 * GET /api/health/db
 * Returns database connection status and health metrics
 */
export async function GET(): Promise<NextResponse<HealthResponse>> {
  try {
    const isConnected = getConnectionStatus();
    const connectionState = getConnectionState();

    if (!isConnected) {
      return NextResponse.json(
        {
          status: 'down',
          timestamp: new Date().toISOString(),
          message: 'Database connection not established',
          details: {
            connected: false,
            connectionAttempts: connectionState.connectionAttempts,
          },
        },
        { status: 503 }
      );
    }

    // Measure latency with ping
    const latencyMs = await measureLatency();

    if (latencyMs === null) {
      return NextResponse.json(
        {
          status: 'degraded',
          timestamp: new Date().toISOString(),
          message: 'Database ping failed',
          details: {
            connected: true,
            lastConnectionTime:
              connectionState.lastConnectionTime?.toISOString(),
          },
        },
        { status: 503 }
      );
    }

    // Determine status based on latency
    const status = latencyMs > 1000 ? 'degraded' : 'ok';
    const statusCode = 200; // Always 200 if connected; monitoring tools check status field

    return NextResponse.json(
      {
        status,
        timestamp: new Date().toISOString(),
        latencyMs,
        details: {
          connected: true,
          lastConnectionTime: connectionState.lastConnectionTime?.toISOString(),
          connectionAttempts: connectionState.connectionAttempts,
        },
      },
      { status: statusCode }
    );
  } catch (error: any) {
    // Never expose stack traces or credentials in health endpoint
    console.error('[Health] Database health check error:', error.message);

    return NextResponse.json(
      {
        status: 'down',
        timestamp: new Date().toISOString(),
        message: 'Database health check failed',
      },
      { status: 503 }
    );
  }
}
