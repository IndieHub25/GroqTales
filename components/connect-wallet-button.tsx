'use client';

import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/use-wallet';

export function ConnectWalletButton() {
  const { connect } = useWallet();

  const handleClick = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Wallet connection failed', error);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
    >
      Connect Wallet
    </Button>
  );
}
