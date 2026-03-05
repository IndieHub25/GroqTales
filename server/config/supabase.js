/**
 * Supabase Client Configuration
 * 
 * Provides two clients:
 * 1. supabaseAdmin — uses SERVICE_ROLE_KEY for server-side admin operations (bypasses RLS)
 * 2. createUserClient(token) — creates a per-request client scoped to the user's JWT
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
    console.warn('[Supabase] SUPABASE_URL not set — Supabase features will be unavailable');
}

// Admin client — bypasses RLS, used for server-side operations
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : null;

// Per-request client scoped to a user's JWT token
function createUserClient(accessToken) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
            headers: { Authorization: `Bearer ${accessToken}` },
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

// Health check — verifies connectivity
async function checkSupabaseHealth() {
    if (!supabaseAdmin) return { connected: false, note: 'Supabase not configured' };
    try {
        const { error } = await supabaseAdmin.from('profiles').select('id').limit(1);
        if (error && error.code !== 'PGRST116') {
            return { connected: false, error: error.message };
        }
        return { connected: true };
    } catch (err) {
        return { connected: false, error: err.message };
    }
}

module.exports = { supabaseAdmin, createUserClient, checkSupabaseHealth, SUPABASE_URL };
