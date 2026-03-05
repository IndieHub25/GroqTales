'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { LoadingAnimation } from '@/components/loading-animation';
import { useWeb3 } from '@/components/providers/web3-provider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CreationWizard } from '@/components/wizard';
import { createClient } from '@/lib/supabase/server';

export default function CreateStoryPage() {
  const router = useRouter();
  const { account } = useWeb3();
  const { toast } = useToast();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorised, setIsAuthorised] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifyAccess() {
      // Wallet-connected users are always authorised
      if (account) {
        if (!cancelled) {
          setIsAuthorised(true);
          setIsLoading(false);
        }
        return;
      }

      // For non-wallet users, verify admin status via the server
      try {
        const res = await fetch('/api/auth/admin-status', {
          credentials: 'include', // send cookies
        });
        const data: { isAdmin?: boolean } = res.ok
          ? await res.json()
          : { isAdmin: false };

        if (!cancelled && data.isAdmin) {
          setIsAuthorised(true);
          setIsLoading(false);
          return;
        }
      } catch {
        // Server unreachable – fall through to denial
      }

      if (!cancelled) {
        toast({
          title: 'Access Denied',
          description:
            'Please connect your wallet or login as admin to create stories.',
          variant: 'destructive',
        });
        setIsAuthorised(false);
        setIsLoading(false);
        router.push('/');
      }
    }

    verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [account, router, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingAnimation message="Loading Story Creator" />
      </div>
    );
  }

  if (!isAuthorised) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-md mx-auto p-8 border rounded-lg bg-muted/20">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-6 text-muted-foreground text-sm">
            Please connect your wallet or log in as admin to create stories.
          </p>
          <Button
            onClick={() => router.push('/')}
            className="theme-gradient-bg"
            type="button"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return <CreationWizard account={account} />;
}
