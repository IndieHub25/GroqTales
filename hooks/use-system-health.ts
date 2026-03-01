'use client';

import { useState, useEffect } from 'react';

interface HealthStatus {
  api: boolean;
  db: boolean;
  bot: boolean;
  loading: boolean;
  allHealthy: boolean;
}

/**
 * Polls the backend health endpoints on mount and returns system status.
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

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (!baseUrl) {
      setStatus((s) => ({ ...s, loading: false }));
      return;
    }

    const controller = new AbortController();

    async function check() {
      let api = false;
      let db = false;
      let bot = false;

      try {
        const res = await fetch(`${baseUrl}/api/health`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          api = data.status === 'healthy' || data.status === 'degraded';
        }
      } catch {
        // API unreachable
      }

      try {
        const res = await fetch(`${baseUrl}/api/health/db`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          db = data.connected === true;
        }
      } catch {
        // DB check failed
      }

      try {
        const res = await fetch(`${baseUrl}/api/health/bot`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          bot = data.available === true || data.status === 'online';
        }
      } catch {
        // Bot check failed
      }

      if (!controller.signal.aborted) {
        setStatus({
          api,
          db,
          bot,
          loading: false,
          allHealthy: api && db,
        });
      }
    }

    check();
    return () => controller.abort();
  }, []);

  return status;
}
