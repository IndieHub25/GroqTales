'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceHealth {
  status: 'ok' | 'degraded' | 'error';
  latency_ms?: number;
  message?: string;
}

interface HealthData {
  status: 'operational' | 'degraded' | 'offline';
  timestamp: string;
  uptime: string;
  services: {
    database: ServiceHealth;
    ai_generation: ServiceHealth;
    feed_gallery: ServiceHealth;
  };
  ai_services: {
    gemini: { status: string; configured: boolean };
    groq: { status: string; configured: boolean };
  };
}

const StatusIndicator = ({ status }: { status: 'ok' | 'degraded' | 'error' }) => {
  const colors = {
    ok: 'bg-green-500',
    degraded: 'bg-yellow-500',
    error: 'bg-red-500',
  };
  return <div className={`w-3 h-3 rounded-full ${colors[status]} animate-pulse`} />;
};

const StatusBadge = ({ status }: { status: 'operational' | 'degraded' | 'offline' }) => {
  const styles = {
    operational: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    degraded: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    offline: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  };

  const icons = {
    operational: <CheckCircle2 className="w-5 h-5" />,
    degraded: <AlertTriangle className="w-5 h-5" />,
    offline: <AlertCircle className="w-5 h-5" />,
  };

  const labels = {
    operational: '✓ System Operational',
    degraded: '⚠ Degraded Performance',
    offline: '✗ System Offline',
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold ${styles[status]}`}>
      {icons[status]}
      {labels[status]}
    </div>
  );
};

export default function StatusPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/health', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setHealth(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold">System Status</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time monitoring of GroqTales platform services
          </p>
        </div>

        {/* Main Status Card */}
        {health && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall Status</span>
                <Button
                  onClick={fetchHealth}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Badge */}
              <StatusBadge status={health.status} />

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase">Uptime</p>
                  <p className="text-lg font-bold mt-1">{health.uptime}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase">Last Updated</p>
                  <p className="text-sm font-mono mt-1">
                    {lastRefresh?.toLocaleTimeString() || 'Just now'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase">Environment</p>
                  <p className="text-lg font-bold mt-1 capitalize">{health?.timestamp?.split('T')?.[0]?.split('-')?.pop() || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && !health && (
          <Card className="border-2">
            <CardContent className="py-8">
              <div className="flex items-center justify-center gap-3">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">Fetching status...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="border-2 border-red-200 dark:border-red-900">
            <CardContent className="py-6">
              <div className="flex items-center gap-3 text-red-700 dark:text-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Unable to fetch health data</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services Section */}
        {health && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Core Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Core Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ServiceRow
                  name="Database (Supabase)"
                  status={health.services.database.status}
                  latency={health.services.database.latency_ms}
                />
                <ServiceRow
                  name="Feed & Gallery"
                  status={health.services.feed_gallery.status}
                  latency={health.services.feed_gallery.latency_ms}
                />
                <ServiceRow
                  name="AI Generation"
                  status={health.services.ai_generation.status}
                  latency={health.services.ai_generation.latency_ms}
                />
              </CardContent>
            </Card>

            {/* AI Models */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Models</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AIModelRow
                  name="Gemini"
                  status={health.ai_services.gemini.status}
                  configured={health.ai_services.gemini.configured}
                />
                <AIModelRow
                  name="Groq"
                  status={health.ai_services.groq.status}
                  configured={health.ai_services.groq.configured}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-500">
          <p>
            Auto-refreshing every 10 seconds •{' '}
            <a href="/" className="text-blue-600 hover:underline">
              Back to Home
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function ServiceRow({
  name,
  status,
  latency,
}: {
  name: string;
  status: string;
  latency?: number;
}) {
  const statusMap: Record<string, 'ok' | 'degraded' | 'error'> = {
    online: 'ok',
    offline: 'error',
    'not configured': 'degraded',
  };

  const displayStatus = statusMap[status] || 'error';

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <StatusIndicator status={displayStatus} />
        <span className="text-sm font-medium">{name}</span>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{status}</p>
        {latency && <p className="text-xs font-mono text-gray-500">{latency}ms</p>}
      </div>
    </div>
  );
}

function AIModelRow({
  name,
  status,
  configured,
}: {
  name: string;
  status: string;
  configured: boolean;
}) {
  const displayStatus = configured && status === 'available' ? 'ok' : 'degraded';

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <StatusIndicator status={displayStatus} />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{name}</span>
          {configured && <Zap className="w-3 h-3 text-blue-600" />}
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
          {configured ? 'Configured' : 'Not configured'}
        </p>
      </div>
    </div>
  );
}
