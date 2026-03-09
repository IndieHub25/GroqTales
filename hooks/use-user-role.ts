/**
 * User role hook — Backend API (BFF pattern)
 * Fetches user role from the backend API instead of calling Supabase directly.
 */

import { useState, useEffect } from 'react';

type UserRole = 'user' | 'admin' | 'moderator' | null;

export function useUserRole() {
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRole() {
            setLoading(true);
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
                if (!token) {
                    setRole(null);
                    setLoading(false);
                    return;
                }

                const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
                const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    setRole(null);
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                setRole((data.role as UserRole) || 'user');
            } catch {
                setRole(null);
            }
            setLoading(false);
        }

        fetchRole();

        // Listen for storage changes (e.g., login/logout in another tab)
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'accessToken') {
                fetchRole();
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const [isOverridden, setIsOverridden] = useState(false);
    const toggleViewMode = () => setIsOverridden(prev => !prev);

    const isAdmin = role === 'admin';
    const isModerator = role === 'moderator';
    const isModOrAdmin = isAdmin || isModerator;

    return {
        role,
        loading,
        isAdmin,
        isModerator,
        isModOrAdmin,
        isOverridden,
        toggleViewMode
    };
}
