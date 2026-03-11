import { createBrowserClient } from '@supabase/ssr';

// During a Cloudflare static build we may not have access to the usual
// runtime environment variables.  Throwing synchronously in that scenario
// causes every page import that calls `createClient()` (directly or via a
// service) to crash the whole build.  To make the export process more
// resilient we provide a lightweight noop client when the vars are missing
// **and** we're in build mode.  All callers should be prepared to receive
// back a client whose methods simply resolve to `{ data: null, error: null }`.

function createNoopClient() {
    const handler: ProxyHandler<any> = {
        get(_target, prop) {
            if (prop === 'auth') {
                return {
                    getSession: async () => ({ data: { session: null } }),
                    getUser: async () => ({ data: null }),
                };
            }
            // every method call returns a promise resolving to a harmless
            // result object; chained calls are also proxied
            return new Proxy(async () => ({ data: null, error: null }), handler);
        },
        apply(_target, _thisArg, _args) {
            // support invoking the proxy as a function
            return Promise.resolve({ data: null, error: null });
        },
    };
    return new Proxy({}, handler) as any;
}

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        // if we're performing a static export, return noop client instead of
        // throwing; this keeps the build alive and results in empty data.
        if (process.env.NEXT_PUBLIC_BUILD_MODE === 'true' || process.env.CF_PAGES === '1') {
            console.warn(
                '[supabase] missing env vars during build – returning noop client'
            );
            return createNoopClient();
        }
        throw new Error('Supabase configuration is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

