import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        (process.env.NEXT_PUBLIC_BUILD_MODE === 'true' ? 'https://dummy.supabase.co' : ''),
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        (process.env.NEXT_PUBLIC_BUILD_MODE === 'true' ? 'dummy_key' : '')
    );
}
