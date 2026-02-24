'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EarningsOverview } from '@/components/royalty/earnings-overview';
import { RevenueChart } from '@/components/royalty/revenue-chart';
import { TransactionHistory } from '@/components/royalty/transaction-history';
import { RoyaltyConfigForm } from '@/components/royalty/royalty-config-form';
import { useWallet } from '@/hooks/use-wallet';
import { useCreatorTransactions } from '@/hooks/use-royalties';

export default function RoyaltiesDashboardPage() {
  const { address, connect } = useWallet();
  const [activeTab, setActiveTab] = useState('transactions');

  // Fetch transactions for chart (all completed, up to 100)
  const { transactions } = useCreatorTransactions(address || undefined, 1, 100);

  if (!address) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-lg mx-auto text-center py-24 space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Connect Your Wallet
          </h1>
          <p className="text-muted-foreground">
            Connect your wallet to view your royalty earnings and manage revenue
            settings.
          </p>
          <Button onClick={connect} size="lg">
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              Creator Revenue Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your royalty earnings, view transactions, and configure
              revenue settings.
            </p>
          </div>
          <div className="text-sm font-mono bg-muted px-3 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        </div>

        {/* Earnings Cards */}
        <EarningsOverview walletAddress={address} />

        {/* Revenue Chart */}
        <RevenueChart transactions={transactions} />

        {/* Tabs: Transactions / Settings */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            <TabsTrigger value="settings">Royalty Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions">
            <TransactionHistory walletAddress={address} />
          </TabsContent>
          <TabsContent value="settings">
            <RoyaltyConfigForm walletAddress={address} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
