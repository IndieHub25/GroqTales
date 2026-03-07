/**
 * Centralized API client for GroqTales frontend.
 *
 * Every fetch to the Express backend should go through `apiFetch` so
 * the base URL is set once via NEXT_PUBLIC_API_URL.
 */

export const API_BASE_URL: string =
    process.env.NEXT_PUBLIC_API_URL ?? 'https://groqtales-backend-api.onrender.com';

/**
 * Thin wrapper around `fetch` that automatically prefixes the backend
 * base URL and sets standard headers.
 *
 * @param path  — path starting with `/`, e.g. `/api/health`
 * @param init  — standard RequestInit options
 */
export async function apiFetch<T = unknown>(
    path: string,
    init?: RequestInit,
): Promise<{ ok: boolean; status: number; data: T }> {
    const url = `${API_BASE_URL}${path}`;

    const headers = new Headers(init?.headers);
    if (!headers.has('Content-Type') && !(init?.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(url, { ...init, headers });

    let data: T;
    try {
        data = await res.json();
    } catch {
        data = {} as T;
    }

    return { ok: res.ok, status: res.status, data };
}

/**
 * Convenience: attach a Bearer token from localStorage.
 */
export function authHeaders(): HeadersInit {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}
