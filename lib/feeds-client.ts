/**
 * Feeds client — fetches trending stories and notifications from
 * the CF Worker D1 API. Falls back to the main Express backend.
 */

const CF_WORKER_URL = process.env.NEXT_PUBLIC_CF_WORKER_URL || '';
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function feedsBase(): string {
    return CF_WORKER_URL || API_URL;
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

export async function fetchNotifications(
    userId: string,
    token: string,
    unreadOnly = false,
    limit = 30,
): Promise<Notification[]> {
    try {
        const res = await fetch(
            `${feedsBase()}/api/feeds/notifications/${userId}?unread=${unreadOnly}&limit=${limit}`,
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

export async function markNotificationRead(id: string, token: string): Promise<boolean> {
    if (!token) throw new Error('Authentication token required');
    try {
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

export async function markAllNotificationsRead(token: string): Promise<boolean> {
    if (!token) throw new Error('Authentication token required');
    try {
        const res = await fetch(`${feedsBase()}/api/feeds/notifications/mark-all-read`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({}), // Empty body, the user is identified via the backend's token validation
        });
        return res.ok;
    } catch {
        return false;
    }
}
