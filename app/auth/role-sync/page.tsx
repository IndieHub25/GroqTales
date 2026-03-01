'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GlobalLoadingWrapper } from '@/components/global-loading-wrapper';

export default function RoleSyncPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function syncRole() {
      const preferredRole = localStorage.getItem('preferred_role');
      
      if (preferredRole) {
        // Update user metadata in Supabase
        const { error } = await supabase.auth.updateUser({
          data: { preferred_role: preferredRole }
        });
        
        if (error) {
          console.error("Failed to sync user role metadata", error);
          // Return early so we don't clear the local preference to try again later
          return;
        }

        // Clean up on success
        localStorage.removeItem('preferred_role');
      }

      // Re-route to home or dashboard after sync
      router.push('/');
      router.refresh();
    }

    syncRole();
  }, [router, supabase.auth]);

  return <GlobalLoadingWrapper>{null}</GlobalLoadingWrapper>;
}
