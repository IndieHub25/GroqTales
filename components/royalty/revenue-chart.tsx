'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RoyaltyTransaction } from '@/hooks/use-royalties';

interface RevenueChartProps {
  transactions: RoyaltyTransaction[];
}

export function RevenueChart({ transactions }: RevenueChartProps) {
  const chartData = useMemo(() => {
    if (!transactions.length) return [];

    // Aggregate earnings by date
    const byDate = new Map<string, number>();

    // Sort ascending by date for chart
    const sorted = [...transactions]
      .filter((tx) => tx.status === 'completed')
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    for (const tx of sorted) {
      const dateKey = format(parseISO(tx.createdAt), 'yyyy-MM-dd');
      byDate.set(dateKey, (byDate.get(dateKey) || 0) + tx.royaltyAmount);
    }

    // Build cumulative data
    let cumulative = 0;
    return Array.from(byDate.entries()).map(([date, amount]) => {
      cumulative += amount;
      return {
        date,
        dailyEarnings: Number(amount.toFixed(4)),
        totalEarnings: Number(cumulative.toFixed(4)),
      };
    });
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground font-bold">
            No revenue data yet. Earnings will appear here after your first sale.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={(val) => format(parseISO(val), 'MMM d')}
                className="text-xs"
              />
              <YAxis
                className="text-xs"
                tickFormatter={(val) => `${val} ETH`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="border-2 border-black bg-background p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-sm font-bold">
                        {format(parseISO(data.date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Daily: {data.dailyEarnings} ETH
                      </p>
                      <p className="text-sm font-bold text-primary">
                        Total: {data.totalEarnings} ETH
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="totalEarnings"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorEarnings)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
