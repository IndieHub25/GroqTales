'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /profile → redirect to /profile/me
 */
export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile/me');
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-slate-400 animate-pulse">Redirecting to your profile…</p>
    </main>
  );
}
