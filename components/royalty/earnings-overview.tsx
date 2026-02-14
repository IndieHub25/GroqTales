'use client';

import { DollarSign, Clock, CheckCircle, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreatorEarnings } from '@/hooks/use-royalties';

function formatEth(value: number): string {
  return `${value.toFixed(4)} ETH`;
}

interface EarningsOverviewProps {
  walletAddress: string;
}

export function EarningsOverview({ walletAddress }: EarningsOverviewProps) {
  const { earnings, isLoading, error } = useCreatorEarnings(walletAddress);

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border-4 border-destructive bg-destructive/10 text-destructive font-bold">
        Failed to load earnings: {error}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Earned',
      value: formatEth(earnings?.totalEarned ?? 0),
      icon: DollarSign,
      description: 'Lifetime royalty earnings',
    },
    {
      title: 'Pending Payout',
      value: formatEth(earnings?.pendingPayout ?? 0),
      icon: Clock,
      description: 'Awaiting withdrawal',
    },
    {
      title: 'Paid Out',
      value: formatEth(earnings?.paidOut ?? 0),
      icon: CheckCircle,
      description: 'Successfully withdrawn',
    },
    {
      title: 'Total Sales',
      value: String(earnings?.totalSales ?? 0),
      icon: TrendingUp,
      description: 'Secondary market sales',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
