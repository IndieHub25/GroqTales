/**
 * Feeds client — fetches trending stories and notifications from
 * the backend API (which proxies to CF Worker D1). Falls back gracefully.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com';

function feedsBase(): string {
    return API_URL;
}

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
}

export interface TrendingStory {
    story_id: string;
    score: number;
    period: string;
    title?: string;
    content?: string;
    genre?: string;
    cover_image_url?: string;
    likes_count?: number;
    views_count?: number;
    author_username?: string;
    author_avatar?: string;
}

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    body: string;
    read: number;
    metadata: string;
    created_at: string;
}

export async function fetchTrending(
    period: 'daily' | 'weekly' | 'alltime' = 'daily',
    limit = 20,
): Promise<TrendingStory[]> {
    try {
        const res = await fetch(
            `${feedsBase()}/api/feeds/trending?period=${period}&limit=${limit}`,
        );
        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
    } catch {
        return [];
    }
}

/**
 * Fetch notifications for the current authenticated user.
 * Uses the /api/feeds/notifications/me endpoint which handles
 * user identification via the JWT token.
 */
export async function fetchNotifications(
    unreadOnly = false,
    limit = 30,
): Promise<Notification[]> {
    try {
        const token = getAuthToken();
        const res = await fetch(
            `${feedsBase()}/api/feeds/notifications/me?unread=${unreadOnly ? 50 : 0}&limit=${limit}`,
            {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            }
        );
        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
    } catch {
        return [];
    }
}

export async function markNotificationRead(id: string): Promise<boolean> {
    try {
        const token = getAuthToken();
        if (!token) return false;
        const res = await fetch(`${feedsBase()}/api/feeds/notifications/${id}/read`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.ok;
    } catch {
        return false;
    }
}

export async function markAllNotificationsRead(): Promise<boolean> {
    try {
        const token = getAuthToken();
        if (!token) return false;
        const res = await fetch(`${feedsBase()}/api/feeds/notifications/mark-all-read`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({}),
        });
        return res.ok;
    } catch {
        return false;
    }
}
