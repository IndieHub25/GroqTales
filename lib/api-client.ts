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

// ─────────────────────────────────────────────────────────────────────────
// Retry helper
// ─────────────────────────────────────────────────────────────────────────

const MAX_RETRIES = 2;
const RETRY_BACKOFF_MS = 1000;

async function withRetry<T>(
    fn: () => Promise<{ ok: boolean; status: number; data: T }>,
    retries = MAX_RETRIES,
): Promise<{ ok: boolean; status: number; data: T }> {
    let lastResult: { ok: boolean; status: number; data: T } | undefined;
    for (let attempt = 0; attempt <= retries; attempt++) {
        lastResult = await fn();
        if (lastResult.ok || lastResult.status < 500) return lastResult;
        if (attempt < retries) {
            await new Promise((r) => setTimeout(r, RETRY_BACKOFF_MS * (attempt + 1)));
        }
    }
    return lastResult!;
}

// ─────────────────────────────────────────────────────────────────────────
// Story Management  (Requirements: 6.1, 6.2)
// ─────────────────────────────────────────────────────────────────────────

export interface StoryCreationPayload {
    title: string;
    genres: string[];
    panels?: unknown[];
    metadata?: Record<string, unknown>;
}

export async function createStory(payload: StoryCreationPayload) {
    return withRetry(() =>
        apiFetch('/api/v1/stories', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(payload),
        }),
    );
}

export async function updateStory(storyId: string, updates: Partial<StoryCreationPayload>) {
    return withRetry(() =>
        apiFetch(`/api/v1/stories/${storyId}`, {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify(updates),
        }),
    );
}

export async function getStory(storyId: string) {
    return apiFetch(`/api/v1/stories/${storyId}`, {
        method: 'GET',
        headers: authHeaders(),
    });
}

// ─────────────────────────────────────────────────────────────────────────
// Draft Management  (Requirement: 6.4)
// ─────────────────────────────────────────────────────────────────────────

export async function saveDraft(draftData: Record<string, unknown>) {
    return withRetry(() =>
        apiFetch('/api/v1/drafts', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(draftData),
        }),
    );
}

export async function loadDraft(draftId: string) {
    return apiFetch(`/api/v1/drafts/${draftId}`, {
        method: 'GET',
        headers: authHeaders(),
    });
}

export async function updateDraft(draftId: string, updates: Record<string, unknown>) {
    return withRetry(() =>
        apiFetch(`/api/v1/drafts/${draftId}`, {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify(updates),
        }),
    );
}

// ─────────────────────────────────────────────────────────────────────────
// AI Processing  (Requirement: 6.3)
// ─────────────────────────────────────────────────────────────────────────

export interface AIProcessingRequest {
    action: string;
    engine?: string;
    config?: Record<string, unknown>;
    userInput?: string;
    storyMemory?: Record<string, unknown>;
}

export async function processAI(request: AIProcessingRequest) {
    return withRetry(() =>
        apiFetch('/api/v1/ai', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(request),
        }),
    );
}

// ─────────────────────────────────────────────────────────────────────────
// Comic Generation  (Panelra Engine)
// ─────────────────────────────────────────────────────────────────────────

export async function generateComicFromSketches(formData: FormData) {
    return withRetry(() =>
        apiFetch('/api/v1/comics/generate-from-sketches', {
            method: 'POST',
            headers: authHeaders(),
            body: formData,
        }),
    );
}

export async function getUserComics(page = 1, limit = 20) {
    return apiFetch(`/api/v1/comics?page=${page}&limit=${limit}&creator=me`, {
        method: 'GET',
        headers: authHeaders(),
    });
}

// ─────────────────────────────────────────────────────────────────────────
// Dashboard Data  (User command center)
// ─────────────────────────────────────────────────────────────────────────

export async function getUserDrafts(page = 1, limit = 20) {
    return apiFetch(`/api/v1/drafts?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: authHeaders(),
    });
}

export async function getUserNFTs() {
    return apiFetch('/api/v1/nft/user', {
        method: 'GET',
        headers: authHeaders(),
    });
}

export async function getUserFeed(page = 1, limit = 20) {
    return apiFetch(`/api/feed?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: authHeaders(),
    });
}

export async function getUserSettings() {
    return apiFetch('/api/v1/settings/profile', {
        method: 'GET',
        headers: authHeaders(),
    });
}

export async function updateUserSettings(data: Record<string, unknown>) {
    return withRetry(() =>
        apiFetch('/api/v1/settings/profile', {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify(data),
        }),
    );
}

export async function getUserProfile() {
    return apiFetch('/api/v1/users/profile', {
        method: 'GET',
        headers: authHeaders(),
    });
}

// ─────────────────────────────────────────────────────────────────────────
// NFT Minting  (Requirements: 6.5, 8.6)
// ─────────────────────────────────────────────────────────────────────────

export interface NFTMintRequest {
    storyId: string;
    metadata: {
        title: string;
        genres: string[];
        panelCount: number;
        wordCount: number;
    };
    chain?: string; // defaults to Monad Testnet
}

export async function mintNFT(request: NFTMintRequest) {
    return withRetry(() =>
        apiFetch('/api/v1/nft', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(request),
        }),
    );
}
