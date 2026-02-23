'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GlobalLoadingWrapper } from '@/components/global-loading-wrapper';

export default function RoleSyncPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function syncRole() {
      const preferredRole = localStorage.getItem('preferred_role');
      
      if (preferredRole) {
        // Update user metadata in Supabase
        await supabase.auth.updateUser({
          data: { preferred_role: preferredRole }
        });
        
        // Clean up
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
