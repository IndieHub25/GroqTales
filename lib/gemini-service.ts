/**
 * GeminiService — Frontend client for Gemini prose generation
 *
 * Calls the backend API to generate prose using Google Gemini.
 * This service does NOT fall back to any other model.
 *
 * Requirements: 5.6, 5.7, 5.8
 */

import { apiFetch, authHeaders } from '@/lib/api-client';
import { PanelParameters, StoryMemory } from '@/lib/types/story-session';

export interface GeminiProseRequest {
    parameters: PanelParameters;
    storySoFar: string;
    storyMemory: StoryMemory;
    genres: string[];
    panelIndex: number;
}

export interface GeminiProseResponse {
    content: string;
    tokensUsed: number;
    model: string;
}

export class GeminiService {
    private available = true;
    private lastHealthCheck: number = 0;
    private readonly HEALTH_CHECK_INTERVAL_MS = 60_000; // 1 minute

    /**
     * Generate prose using Gemini via backend.
     *
     * Requirements: 5.6
     *
     * @param request - The prose generation request
     * @returns Generated prose string
     * @throws Error when Gemini is unavailable (Requirement 5.7, 5.8)
     */
    async generateProse(request: GeminiProseRequest): Promise<GeminiProseResponse> {
        if (!this.available) {
            throw new GeminiUnavailableError(
                'Gemini prose generation is currently unavailable. No fallback model will be used. Please try again later.'
            );
        }

        try {
            const { ok, status, data } = await apiFetch<{
                content?: string;
                story?: string;
                tokensUsed?: number;
                model?: string;
                error?: string;
            }>('/api/v1/ai', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    action: 'generate',
                    engine: 'gemini',
                    config: {
                        ...request.parameters,
                        genres: request.genres,
                        panelIndex: request.panelIndex,
                    },
                    userInput: request.storySoFar,
                    storyMemory: request.storyMemory,
                }),
            });

            if (!ok) {
                if (status === 503 || (data.error && data.error.includes('unavailable'))) {
                    this.available = false;
                    throw new GeminiUnavailableError(
                        'Gemini service is temporarily unavailable. Prose generation cannot proceed. Please try again later.'
                    );
                }
                throw new Error(data.error || `Gemini generation failed with status ${status}`);
            }

            return {
                content: data.content || data.story || '',
                tokensUsed: data.tokensUsed || 0,
                model: data.model || 'gemini',
            };
        } catch (error) {
            if (error instanceof GeminiUnavailableError) throw error;
            throw new Error(`Gemini prose generation failed: ${(error as Error).message}`);
        }
    }

    /**
     * Test Gemini connection via backend health endpoint.
     *
     * Requirements: 5.8
     */
    async testConnection(): Promise<boolean> {
        try {
            const { ok } = await apiFetch<{ status?: string }>('/api/health', {
                method: 'GET',
            });
            this.available = ok;
            this.lastHealthCheck = Date.now();
            return ok;
        } catch {
            this.available = false;
            this.lastHealthCheck = Date.now();
            return false;
        }
    }

    /**
     * Check if the service is available.
     *
     * Requirements: 5.8
     */
    isAvailable(): boolean {
        // Re-check if the health check is stale
        if (Date.now() - this.lastHealthCheck > this.HEALTH_CHECK_INTERVAL_MS) {
            // Don't block — fire-and-forget health check
            this.testConnection().catch(() => { });
        }
        return this.available;
    }

    /**
     * Reset availability status (for retry scenarios).
     */
    resetAvailability(): void {
        this.available = true;
        this.lastHealthCheck = 0;
    }
}

/**
 * Specific error class for Gemini unavailability.
 * Requirement: 5.7, 10.1
 */
export class GeminiUnavailableError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GeminiUnavailableError';
    }
}
