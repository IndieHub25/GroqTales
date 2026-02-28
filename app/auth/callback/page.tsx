'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Extract the code from the URL search parameters
      const code = searchParams.get('code');
      // The `next` parameter defines where to redirect after successful login
      const next = searchParams.get('next') ?? '/dashboard';

      if (code) {
        const supabase = createClient();
        
        // Exchange the authorization code for a session token
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          console.error("Supabase Auth Code Exchange Error:", exchangeError);
          setError(exchangeError.message || "Failed to exchange authentication code.");
          // Redirect to sign in with error after a brief delay
          setTimeout(() => router.push('/sign-in?error=AuthFailed'), 3000);
          return;
        }

        console.log("Supabase Auth successful, redirecting to", next);
        // Successful login! Redirect the user
        router.push(next);
      } else {
        // No code was present in the URL, this shouldn't happen on a valid callback
        console.warn("No 'code' parameter found in auth callback URL.");
        router.push('/sign-in');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      {error ? (
        <div className="text-center p-8 border-4 border-[var(--comic-red)] bg-destructive/10 rounded-lg max-w-md shadow-[8px_8px_0px_0px_var(--comic-red)]">
          <h2 className="text-2xl font-black uppercase text-[var(--comic-red)] mb-4 font-display">
            Authentication Failed
          </h2>
          <p className="text-foreground font-bold">{error}</p>
          <p className="text-muted-foreground mt-4 text-sm mt-8">Redirecting back to login...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="h-16 w-16 animate-spin text-[var(--comic-blue)]" />
          <h2 className="text-3xl font-black uppercase tracking-wider text-foreground font-display">
            Authenticating...
          </h2>
          <p className="text-muted-foreground font-bold">Please wait while we log you into GroqTales.</p>
        </div>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--comic-blue)]" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
