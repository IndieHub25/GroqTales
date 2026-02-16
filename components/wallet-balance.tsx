'use client';

import { Wallet } from 'lucide-react';
import React from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { truncateAddress } from '@/lib/utils';

export function WalletBalance() {
  const { account, connected } = useWeb3();

  if (!connected || !account) {
    return null;
  }
  // Placeholder balance - replace with actual API call in future
  const mockBalance = '0.00 ETH';

  return (
    <Card className="nft-pulse w-full max-w-xs mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-4 w-4" />
          Wallet Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-center">{mockBalance}</p>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Connected: {truncateAddress(account)}
        </p>
      </CardContent>
    </Card>
  );
}
