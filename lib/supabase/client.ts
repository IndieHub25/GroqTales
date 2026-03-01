import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (process.env.NEXT_PUBLIC_BUILD_MODE === 'true'
        ? 'https://dummy.supabase.co'
        : 'https://placeholder.supabase.co');

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (process.env.NEXT_PUBLIC_BUILD_MODE === 'true'
        ? 'dummy_key'
        : 'placeholder_anon_key');

export function createClient() {
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
