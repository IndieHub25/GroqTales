/**
 * Gemini AI Service — Google's Advanced AI Engine for GroqTales Backend
 *
 * Primary AI service for story generation with fine-grained config.
 * Features:
 *  - Full API integration with Google Generative AI
 *  - Token-based response control
 *  - Streaming support for real-time output
 *  - Structured output parsing
 *  - Fallback to Groq if needed
 */

const DEFAULT_MODEL = 'gemini-2.5-pro';

let logger;
try {
    logger = require('../utils/logger');
} catch {
    logger = { info: console.log, warn: console.warn, error: console.error, debug: () => { } };
}

// ─────────────────────────────────────────────────────────────────────────
// Gemini Configuration
// ─────────────────────────────────────────────────────────────────────────

const GEMINI_CONFIG = {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
};

// ─────────────────────────────────────────────────────────────────────────
// Timeout & Retry Configuration
// ─────────────────────────────────────────────────────────────────────────

const TIMEOUT_MS = 60000; // 60 second timeout for generation
const MAX_RETRIES = 2;
const RETRY_BACKOFF_MS = 1000;

// ─────────────────────────────────────────────────────────────────────────
// API Health Check
// ─────────────────────────────────────────────────────────────────────────

async function checkGeminiHealth() {
    if (!GEMINI_CONFIG.apiKey) {
        return { available: false, reason: 'GEMINI_API_KEY not configured' };
    }

    try {
        const response = await fetch(
            `${GEMINI_CONFIG.baseUrl}/${GEMINI_CONFIG.model}:generateContent?key=${GEMINI_CONFIG.apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'ping' }] }],
                    generationConfig: { maxOutputTokens: 10 },
                }),
                signal: AbortSignal.timeout(5000),
            }
        );

        if (response.ok) {
            return { available: true, model: GEMINI_CONFIG.model };
        } else if (response.status === 429) {
            return { available: false, reason: 'Rate limited', retryAfter: response.headers.get('retry-after') };
        } else {
            return { available: false, reason: `HTTP ${response.status}`, error: await response.text() };
        }
    } catch (error) {
        logger.error(`Gemini health check failed: ${error.message}`);
        return { available: false, reason: error.message };
    }
}

// ─────────────────────────────────────────────────────────────────────────
// Main Generate Function — Stream or Batch
// ─────────────────────────────────────────────────────────────────────────

/**
 * Generate content using Gemini API
 * @param {Object} params - Generation parameters
 * @param {string} params.prompt - Main prompt text
 * @param {Object} params.config - AI config object with all parameters
 * @param {boolean} params.stream - Enable streaming
 * @param {Function} params.onChunk - Callback for stream chunks
 * @returns {Promise<string>} Generated content or stream started
 */
async function generateContent({ prompt, config = {}, stream = false, onChunk = null, correlationId = null }) {
    const requestId = correlationId || `gen-${Date.now()}`;
    const startTime = Date.now();

    if (!GEMINI_CONFIG.apiKey) {
        throw new Error('Gemini API key not configured');
    }

    const generationConfig = {
        maxOutputTokens: config.maxTokensPerResponse || 2000,
        temperature: config.temperature !== undefined ? config.temperature : 0.7,
        topP: config.topP !== undefined ? config.topP : 0.9,
        ...(config.topK && { topK: config.topK }),
    };

    const safetySettings = buildSafetySettings(config);

    const requestBody = {
        contents: [
            {
                parts: [{ text: prompt }],
            },
        ],
        generationConfig,
        ...(safetySettings.length > 0 && { safetySettings }),
    };

    logger.info(`[${requestId}] Generating with Gemini ${GEMINI_CONFIG.model}`, {
        tokens: generationConfig.maxOutputTokens,
        temp: generationConfig.temperature,
    });

    let lastError;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(
                `${GEMINI_CONFIG.baseUrl}/${GEMINI_CONFIG.model}:${stream ? 'streamGenerateContent' : 'generateContent'}?key=${GEMINI_CONFIG.apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                    signal: AbortSignal.timeout(TIMEOUT_MS),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 429) {
                    // Rate limited — exponential backoff
                    if (attempt < MAX_RETRIES - 1) {
                        const backoffMs = RETRY_BACKOFF_MS * Math.pow(2, attempt);
                        logger.warn(`[${requestId}] Rate limited, retrying in ${backoffMs}ms`);
                        await new Promise((r) => setTimeout(r, backoffMs));
                        continue;
                    }
                }
                lastError = new Error(`Gemini API error ${response.status}: ${errorText}`);
                throw lastError;
            }

            if (stream && onChunk) {
                // Streaming response handling
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullText = '';

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value);
                        fullText += chunk;

                        // Parse NDJSON (newline-delimited JSON)
                        const lines = fullText.split('\n');
                        for (let i = 0; i < lines.length - 1; i++) {
                            try {
                                const parsed = JSON.parse(lines[i]);
                                if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
                                    const text = parsed.candidates[0].content.parts[0].text;
                                    onChunk({ text, done: false });
                                }
                            } catch (e) {
                                // Parse error on this line, continue
                            }
                        }
                        fullText = lines[lines.length - 1];
                    }

                    if (fullText) {
                        try {
                            const parsed = JSON.parse(fullText);
                            if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
                                const text = parsed.candidates[0].content.parts[0].text;
                                onChunk({ text, done: true });
                            }
                        } catch (e) {
                            // Last line parse error
                        }
                    }

                    const duration = Date.now() - startTime;
                    logger.info(`[${requestId}] Streaming completed in ${duration}ms`);
                    return fullText;
                } catch (streamError) {
                    logger.error(`[${requestId}] Stream error: ${streamError.message}`);
                    throw streamError;
                }
            } else {
                // Batch response handling
                const json = await response.json();
                const text = json.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!text) {
                    throw new Error('No text in Gemini response');
                }

                const duration = Date.now() - startTime;
                logger.info(`[${requestId}] Generated ${text.length} chars in ${duration}ms`);
                return text;
            }
        } catch (error) {
            lastError = error;
            if (attempt < MAX_RETRIES - 1 && error.message.includes('timeout')) {
                const backoffMs = RETRY_BACKOFF_MS * Math.pow(2, attempt);
                logger.warn(`[${requestId}] Timeout, retrying in ${backoffMs}ms`);
                await new Promise((r) => setTimeout(r, backoffMs));
                continue;
            }
            throw error;
        }
    }

    throw lastError || new Error('Failed after max retries');
}

// ─────────────────────────────────────────────────────────────────────────
// Safety Settings Builder
// ─────────────────────────────────────────────────────────────────────────

function buildSafetySettings(config) {
    const settings = [];

    // HARM_CATEGORY_UNSPECIFIED
    // HARM_CATEGORY_DEROGATORY_CONTENT
    // HARM_CATEGORY_GRAPHIC_CONTENT
    // HARM_CATEGORY_HARASSMENT
    // HARM_CATEGORY_ILLEGAL_CONTENT
    // HARM_CATEGORY_SELF_INJURY
    // HARM_CATEGORY_SEXUAL_CONTENT

    const nsfwLevel = config.nsfwToggle || 'standard';
    const blockMap = {
        strict: 'BLOCK_LOW_AND_ABOVE',
        standard: 'BLOCK_MEDIUM_AND_ABOVE',
        relaxed: 'BLOCK_ONLY_HIGH',
    };

    const threshold = blockMap[nsfwLevel] || 'BLOCK_MEDIUM_AND_ABOVE';

    // Apply filters based on config.contentFilters
    const filters = config.contentFilters || {};
    const harmCategories = [
        'HARM_CATEGORY_GRAPHIC_CONTENT',
        'HARM_CATEGORY_HARASSMENT',
        'HARM_CATEGORY_ILLEGAL_CONTENT',
        'HARM_CATEGORY_SELF_INJURY',
        'HARM_CATEGORY_SEXUAL_CONTENT',
    ];

    harmCategories.forEach((category) => {
        settings.push({
            category,
            threshold,
        });
    });

    return settings;
}

// ─────────────────────────────────────────────────────────────────────────
// Specialized Task Functions (narrow scope, fast)
// ─────────────────────────────────────────────────────────────────────────

async function extractOutlineFromPremise(premise, config = {}) {
    const prompt = `
Given this story premise: "${premise}"

Generate a brief 3-5 point outline for a ${config.targetLength || 'short'} story.
Format as JSON:
{"outline": ["point1", "point2", "point3"]}
    `.trim();

    const response = await generateContent({
        prompt,
        config: { maxTokensPerResponse: 300, temperature: 0.8 },
    });

    try {
        const json = JSON.parse(response);
        return json.outline || [];
    } catch {
        return response.split('\n').filter((line) => line.trim().length > 0);
    }
}

async function extractMetadata(content, config = {}) {
    const prompt = `
Analyze this story and extract metadata as JSON:
${content.substring(0, 2000)}

Return JSON ONLY (no markdown):
{"title":"","genres":[],"themes":[],"tone":"","estimatedWordCount":0}
    `.trim();

    const response = await generateContent({
        prompt,
        config: { maxTokensPerResponse: 200, temperature: 0.3 },
    });

    try {
        return JSON.parse(response);
    } catch {
        return {
            genres: [],
            themes: [],
            tone: 'unknown',
            estimatedWordCount: content.length / 4.5,
        };
    }
}

module.exports = {
    generateContent,
    checkGeminiHealth,
    extractOutlineFromPremise,
    extractMetadata,
    GEMINI_CONFIG,
};
