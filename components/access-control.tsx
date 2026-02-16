'use client';

import { useEffect, useState } from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import { useToast } from '@/components/ui/use-toast';

// Define allowed wallet IDs for specific features
const ALLOWED_WALLETS = {
  history: [
    '0x1234567890abcdef1234567890abcdef12345678',
    '0xabcdef1234567890abcdef1234567890abcdef12',
  ],
  generation: [
    '0x1234567890abcdef1234567890abcdef12345678',
    '0xabcdef1234567890abcdef1234567890abcdef12',
  ],
  minting: ['0x1234567890abcdef1234567890abcdef12345678'],
};

export function AccessControl() {
  const { account } = useWeb3();
  const { toast } = useToast();
  const [access, setAccess] = useState({
    history: false,
    generation: false,
    minting: false,
  });

  useEffect(() => {
    if (account) {
      const lowerCaseAccount = account.toLowerCase();
      setAccess({
        history: ALLOWED_WALLETS.history.includes(lowerCaseAccount),
        generation: ALLOWED_WALLETS.generation.includes(lowerCaseAccount),
        minting: ALLOWED_WALLETS.minting.includes(lowerCaseAccount),
      });

      if (
        ALLOWED_WALLETS.history.includes(lowerCaseAccount) ||
        ALLOWED_WALLETS.generation.includes(lowerCaseAccount) ||
        ALLOWED_WALLETS.minting.includes(lowerCaseAccount)
      ) {
        toast({
          title: 'Access Granted',
          description:
            'You have access to special features based on your wallet ID.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Limited Access',
          description:
            'Your wallet does not have access to special features. Contact support for more information.',
          variant: 'destructive',
        });
      }
    } else {
      setAccess({
        history: false,
        generation: false,
        minting: false,
      });
    }
  }, [account, toast]);

  return {
    hasHistoryAccess: access.history,
    hasGenerationAccess: access.generation,
    hasMintingAccess: access.minting,
  };
}
