'use client';

import { useState, useEffect, useRef } from 'react';

interface HealthStatus {
    api: boolean;
    db: boolean;
    bot: boolean;
    loading: boolean;
    allHealthy: boolean;
}

const HEALTH_POLL_INTERVAL_MS = 30_000; // 30 seconds

/**
 * Polls the backend health endpoints on mount and at regular intervals.
 * Used to show/hide the "SYSTEM OFFLINE" banner.
 */
export function useSystemHealth(): HealthStatus {
    const [status, setStatus] = useState<HealthStatus>({
        api: false,
        db: false,
        bot: false,
        loading: true,
        allHealthy: false,
    });

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com';
        if (!baseUrl) {
            setStatus((s) => ({ ...s, loading: false }));
            return;
        }

        let aborted = false;

        async function check() {
            let api = false;
            let db = false;
            let bot = false;

            try {
                const res = await fetch(`${baseUrl}/api/health`, {
                    signal: AbortSignal.timeout(8000),
                });
                if (res.ok) {
                    const data = await res.json();
                    api = data.status === 'healthy' || data.status === 'degraded';
                    // The backend returns database info nested under data.database
                    db = data.database?.connected === true;
                }
            } catch {
                // API unreachable
            }

            try {
                const res = await fetch(`${baseUrl}/api/health/bot`, {
                    signal: AbortSignal.timeout(8000),
                });
                if (res.ok) {
                    const data = await res.json();
                    bot = data.status === 'healthy';
                }
            } catch {
                // Bot check failed
            }

            if (!aborted) {
                setStatus({
                    api,
                    db,
                    bot,
                    loading: false,
                    allHealthy: api && db,
                });
            }
        }

        // Initial check
        check();

        // Poll at interval
        intervalRef.current = setInterval(check, HEALTH_POLL_INTERVAL_MS);

        return () => {
            aborted = true;
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return status;
}
