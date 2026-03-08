/**
 * AI Orchestration Service — Coordinates Groq + Gemini + StoryMemory
 *
 * This is the main entry-point for generating a panel. It:
 * 1. Validates parameters via Groq helpers
 * 2. Builds the "Story So Far" context
 * 3. Calls Gemini for prose generation
 * 4. Constructs the backend payload
 *
 * Requirements: 5.1-5.6, 7.1-7.4
 */

import {
    PanelData,
    PanelParameters,
    StoryMemory,
    BackendPayload,
    ValidationResult,
    ValidationError,
    ValidationWarning,
} from '@/lib/types/story-session';
import { StoryMemoryManager } from '@/lib/services/story-memory-manager';
import { GeminiService, GeminiUnavailableError } from '@/lib/gemini-service';
import { ALL_PARAMETERS } from '@/lib/ai-story-parameters';

export interface GeneratedPanel {
    content: string;
    wordCount: number;
    tokensUsed: {
        groq: number;
        gemini: number;
    };
    generationTime: number;
}

export class AIOrchestrationService {
    private memoryManager: StoryMemoryManager;
    private geminiService: GeminiService;

    constructor(
        memoryManager?: StoryMemoryManager,
        geminiService?: GeminiService
    ) {
        this.memoryManager = memoryManager || new StoryMemoryManager();
        this.geminiService = geminiService || new GeminiService();
    }

    /**
     * Generate a complete panel. This is the main orchestration method.
     *
     * Requirements: 5.1-5.6, 7.1-7.4
     *
     * @param panelIndex - The panel number (1-7)
     * @param parameters - User-configured parameters (70+)
     * @param storyMemory - Current story memory from previous panels
     * @param genres - Locked genres
     * @param previousPanels - All previous panels for context
     * @returns Generated panel data
     */
    async generatePanel(
        panelIndex: number,
        parameters: PanelParameters,
        storyMemory: StoryMemory,
        genres: string[],
        previousPanels: PanelData[]
    ): Promise<GeneratedPanel> {
        const startTime = Date.now();

        // 1. Validate parameters
        const validation = this.validateParameters(parameters);
        if (!validation.isValid) {
            throw new ParameterValidationError(
                'Parameter validation failed',
                validation.errors
            );
        }

        // 2. Build "Story So Far" context
        let storySoFar = this.generateStorySoFar(previousPanels, storyMemory);

        // CRITICAL: For first generation, storySoFar is empty.
        // Use the customPremise from parameters so the user's concept reaches the AI.
        if (!storySoFar && (parameters as Record<string, unknown>).customPremise) {
            storySoFar = String((parameters as Record<string, unknown>).customPremise);
        }

        // 3. Generate prose via backend AI
        const proseResult = await this.geminiService.generateProse({
            parameters,
            storySoFar,
            storyMemory,
            genres,
            panelIndex,
        });

        const generationTime = Date.now() - startTime;

        return {
            content: proseResult.content,
            wordCount: proseResult.content
                .split(/\s+/)
                .filter((w) => w.length > 0).length,
            tokensUsed: {
                groq: 0, // Groq used only for validation in this flow
                gemini: proseResult.tokensUsed,
            },
            generationTime,
        };
    }

    /**
     * Validate parameters against schema constraints.
     *
     * Requirements: 3.11, 10.3
     */
    validateParameters(parameters: PanelParameters): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Validate numeric range constraints
        for (const param of ALL_PARAMETERS) {
            const value = (parameters as Record<string, unknown>)[param.key];
            if (value === undefined || value === null) continue;

            if (param.type === 'slider' && typeof value === 'number') {
                const min = param.constraints?.min ?? 0;
                const max = param.constraints?.max ?? 10;
                if (value < min || value > max) {
                    errors.push({
                        field: param.key,
                        message: `${param.label} must be between ${min} and ${max}. Got ${value}.`,
                        code: 'OUT_OF_RANGE',
                    });
                }
            }

            if (param.type === 'select' && typeof value === 'string') {
                const validOptions = param.constraints?.options?.map(
                    (o: { value: string | number }) => String(o.value)
                );
                if (validOptions && !validOptions.includes(value)) {
                    errors.push({
                        field: param.key,
                        message: `${param.label} must be one of: ${validOptions.join(', ')}`,
                        code: 'INVALID_OPTION',
                    });
                }
            }
        }

        // Warn on extreme values
        const targetWordCount = parameters.targetWordCount;
        if (targetWordCount !== undefined) {
            if (targetWordCount < 200) {
                warnings.push({
                    field: 'targetWordCount',
                    message: 'Very short word count may limit story depth',
                    suggestion: 'Consider at least 500 words per chapter',
                });
            }
            if (targetWordCount > 5000) {
                warnings.push({
                    field: 'targetWordCount',
                    message: 'Very high word count may increase generation time',
                    suggestion: 'Consider 1000-3000 words for optimal results',
                });
            }
        }

        return { isValid: errors.length === 0, errors, warnings };
    }

    /**
     * Generate "Story So Far" text from previous panels and memory.
     *
     * Requirements: 4.3, 4.4, 10.6
     */
    generateStorySoFar(
        previousPanels: PanelData[],
        storyMemory: StoryMemory
    ): string {
        if (previousPanels.length === 0) {
            return '';
        }

        try {
            // Use StoryMemoryManager's comprehensive summary
            const summary = this.memoryManager.generateSummary(previousPanels);

            // Also include the memory-based summary for quick context
            const memorySummary = this.memoryManager.getSummary(storyMemory);

            if (memorySummary) {
                return `${summary}\n\n--- CURRENT STORY STATE ---\n${memorySummary}`;
            }

            return summary;
        } catch (error) {
            throw new StorySummaryError(
                `Failed to generate "Story So Far" summary: ${(error as Error).message}`
            );
        }
    }

    /**
     * Build the backend payload for persistence.
     *
     * Requirements: 6.9
     */
    buildBackendPayload(
        panelData: PanelData,
        storyMemory: StoryMemory,
        genres: string[],
        storyId?: string,
        userId?: string
    ): BackendPayload {
        const storySoFar = this.memoryManager.getSummary(storyMemory);

        return {
            storyId,
            userId,
            panelIndex: panelData.panelIndex,
            genres,
            parameters: panelData.parameters,
            storySoFar,
            storyMemory,
            generatedContent: panelData.generatedContent,
            metadata: {
                tokensUsed: panelData.metadata.tokensUsed || { groq: 0, gemini: 0 },
                generationTime: 0,
                timestamp: new Date(),
            },
        };
    }

    /**
     * Update story memory after a panel is generated.
     */
    updateStoryMemory(
        panel: PanelData,
        currentMemory?: StoryMemory
    ): StoryMemory {
        return this.memoryManager.updateMemory(panel, currentMemory);
    }
}

/**
 * Error for parameter validation failures.
 * Requirement: 10.3
 */
export class ParameterValidationError extends Error {
    public readonly validationErrors: ValidationError[];

    constructor(message: string, errors: ValidationError[]) {
        super(message);
        this.name = 'ParameterValidationError';
        this.validationErrors = errors;
    }
}

/**
 * Error for story summary generation failures.
 * Requirement: 10.6
 */
export class StorySummaryError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'StorySummaryError';
    }
}
