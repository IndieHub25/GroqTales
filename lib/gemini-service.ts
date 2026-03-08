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
        try {
            const { ok, status, data } = await apiFetch<{
                success?: boolean;
                data?: {
                    rawContent?: string;
                    chapters?: Array<{ title: string; content: string }>;
                    wordCount?: number;
                    metadata?: any;
                };
                content?: string;
                story?: string;
                tokensUsed?: number;
                model?: string;
                error?: string;
                details?: string;
            }>('/api/v1/ai', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    action: 'generate',
                    engine: 'vedascript',
                    streaming: false,
                    config: {
                        ...request.parameters,
                        genres: request.genres,
                        primaryGenre: request.genres?.[0] || 'fantasy',
                        panelIndex: request.panelIndex,
                        mode: 'story-only',
                    },
                    userInput: request.storySoFar,
                    storyMemory: request.storyMemory,
                }),
            });

            if (!ok) {
                if (status === 503 || (data.error && data.error.includes('unavailable'))) {
                    this.available = false;
                    throw new GeminiUnavailableError(
                        'AI service is temporarily unavailable. Please try again later.'
                    );
                }
                throw new Error(data.error || data.details || `Generation failed with status ${status}`);
            }

            // Handle both response formats: wrapped {success, data} and flat {content, story}
            let content = '';
            if (data.data) {
                // Wrapped response from batch mode
                content = data.data.rawContent
                    || data.data.chapters?.map(c => c.content).join('\n\n')
                    || '';
            }
            if (!content) {
                content = data.content || data.story || '';
            }

            return {
                content,
                tokensUsed: data.tokensUsed || data.data?.wordCount || 0,
                model: data.model || 'groq-vedascript',
            };
        } catch (error) {
            if (error instanceof GeminiUnavailableError) throw error;
            throw new Error(`AI prose generation failed: ${(error as Error).message}`);
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
