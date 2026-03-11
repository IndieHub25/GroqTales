import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// server.ts handles setup of the Supabase client on the server side.  It
// mirrors the logic in `client.ts` by returning a safe noop client during
// static export builds when the public keys may not yet be injected.  The
// noop implementation is intentionally minimal: any method invoked resolves
// to `{ data: null, error: null }`.

function createNoopClient() {
    const handler: ProxyHandler<any> = {
        get(_target, prop) {
            if (prop === 'auth') {
                return {
                    getSession: async () => ({ data: { session: null } }),
                    getUser: async () => ({ data: null }),
                };
            }
            return new Proxy(async () => ({ data: null, error: null }), handler);
        },
        apply(_target, _thisArg, _args) {
            return Promise.resolve({ data: null, error: null });
        },
    };
    return new Proxy({}, handler) as any;
}

export async function createClient() {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        if (process.env.NEXT_PUBLIC_BUILD_MODE === 'true' || process.env.CF_PAGES === '1') {
            console.warn(
                '[supabase] missing server env vars during build – returning noop client'
            );
            return createNoopClient();
        }
        throw new Error('Supabase configuration is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
    }

    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch (error) {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}
