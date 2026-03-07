/**
 * RBAC (Role-Based Access Control) helpers for GroqTales.
 *
 * Roles are stored in Supabase `user_metadata.roles` as a string array.
 * Valid roles: 'admin', 'moderator', 'user'
 */

export type UserRole = 'admin' | 'moderator' | 'user';

export interface RBACSession {
    user?: {
        id?: string;
        user_metadata?: {
            roles?: string[];
            [key: string]: unknown;
        };
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

/**
 * Extract roles from a Supabase session.
 * Falls back to `['user']` if none set.
 */
export function getUserRoles(session: RBACSession | null): UserRole[] {
    const raw = session?.user?.user_metadata?.roles;
    if (!Array.isArray(raw) || raw.length === 0) return ['user'];
    return raw.filter((r): r is UserRole =>
        ['admin', 'moderator', 'user'].includes(r),
    );
}

/** Highest-priority role for display purposes. */
export function getPrimaryRole(session: RBACSession | null): UserRole {
    const roles = getUserRoles(session);
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('moderator')) return 'moderator';
    return 'user';
}

export function isAdmin(session: RBACSession | null): boolean {
    return getUserRoles(session).includes('admin');
}

export function isModerator(session: RBACSession | null): boolean {
    return getUserRoles(session).includes('moderator');
}

export function isModOrAdmin(session: RBACSession | null): boolean {
    const roles = getUserRoles(session);
    return roles.includes('admin') || roles.includes('moderator');
}

/** Role badge styling */
export const roleBadgeStyles: Record<UserRole, { label: string; className: string }> = {
    admin: {
        label: 'Admin',
        className: 'bg-red-500/15 text-red-400 border-red-500/30',
    },
    moderator: {
        label: 'Moderator',
        className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    },
    user: {
        label: 'User',
        className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    },
};
