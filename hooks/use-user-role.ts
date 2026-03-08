'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    type UserRole,
    getPrimaryRole,
    isAdmin as checkAdmin,
    isModerator as checkMod,
    isModOrAdmin as checkModOrAdmin,
    type RBACSession,
} from '@/lib/rbac';

const ROLE_OVERRIDE_KEY = 'comicraft_role_override';

interface UseUserRoleReturn {
    role: UserRole;
    isAdmin: boolean;
    isModerator: boolean;
    isModOrAdmin: boolean;
    loading: boolean;
    /** True when the user has toggled to a different view */
    isOverridden: boolean;
    /** Toggle between actual role and 'user' view */
    toggleViewMode: () => void;
    /** Reset override back to actual role */
    resetOverride: () => void;
}

/**
 * Hook that reads the current user's RBAC role from Supabase session.
 * Supports localStorage-based view switching so admins can see the UI as a regular user.
 */
export function useUserRole(): UseUserRoleReturn {
    const [session, setSession] = useState<RBACSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [override, setOverride] = useState<UserRole | null>(null);
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        // Restore override from localStorage
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(ROLE_OVERRIDE_KEY);
            if (saved === 'user') setOverride('user');
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session as RBACSession | null);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s as RBACSession | null);
            if (s?.access_token) {
                localStorage.setItem('accessToken', s.access_token);
            } else {
                localStorage.removeItem('accessToken');
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const actualRole = getPrimaryRole(session);
    const effectiveRole: UserRole = override ?? actualRole;
    const isOverridden = override !== null && override !== actualRole;

    const toggleViewMode = useCallback(() => {
        if (override) {
            // Remove override → back to actual role
            setOverride(null);
            localStorage.removeItem(ROLE_OVERRIDE_KEY);
        } else {
            // Switch to user view
            setOverride('user');
            localStorage.setItem(ROLE_OVERRIDE_KEY, 'user');
        }
    }, [override]);

    const resetOverride = useCallback(() => {
        setOverride(null);
        localStorage.removeItem(ROLE_OVERRIDE_KEY);
    }, []);

    return {
        role: effectiveRole,
        isAdmin: effectiveRole === 'admin',
        isModerator: effectiveRole === 'moderator',
        isModOrAdmin: effectiveRole === 'admin' || effectiveRole === 'moderator',
        loading,
        isOverridden,
        toggleViewMode,
        resetOverride,
    };
}
