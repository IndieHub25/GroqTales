/**
 * Groq AI Service — Centralized AI Engine for GroqTales Backend
 *
 * All Groq API interactions flow through this service.
 * Features:
 *  - Token-efficient prompt engineering per content type
 *  - Valid Groq model selection
 *  - Retry logic with exponential backoff
 *  - Structured JSON output for analysis endpoints
 */

let logger;
try {
    logger = require('../utils/logger');
} catch {
    logger = { info: console.log, warn: console.warn, error: console.error, debug: () => { } };
}

// ---------------------------------------------------------------------------
// Valid Groq Models
// ---------------------------------------------------------------------------
const MODELS = {
    PRIMARY: 'llama-3.3-70b-versatile',    // Best quality — stories, novels
    FAST: 'llama-3.1-8b-instant',          // Fast — analysis, ideas, synopsis
    LONG_CONTEXT: 'mistral-saba-24b',       // Mistral Saba — content improvement
};

const MODEL_DISPLAY_NAMES = {
    [MODELS.PRIMARY]: 'Llama 3.3 70B Versatile',
    [MODELS.FAST]: 'Llama 3.1 8B Instant',
    [MODELS.LONG_CONTEXT]: 'Mistral Saba 24B',
};

// ---------------------------------------------------------------------------
// Token budgets per content length
// ---------------------------------------------------------------------------
const TOKEN_BUDGETS = {
    short: 512,
    medium: 1200,
    long: 2800,
    synopsis: 150,
    analysis: 400,
    ideas: 600,
    improvement: 2000,
};

// ---------------------------------------------------------------------------
// Prompt Templates — Token-Efficient
// ---------------------------------------------------------------------------

function buildStoryPrompt({ genre, theme, length, tone, characters, setting, formatType }) {
    const parts = [`Write a ${length || 'medium'}-length ${formatType || 'story'}`];
    if (genre) parts.push(`in the ${genre} genre`);
    if (theme) parts.push(`themed around "${theme}"`);
    if (tone) parts.push(`with a ${tone} tone`);
    if (characters) parts.push(`featuring: ${characters}`);
    if (setting) parts.push(`set in: ${setting}`);
    parts.push('. Include vivid descriptions, dialogue, and a satisfying arc. Start immediately with the narrative — no preamble.');
    return parts.join(' ');
}

function buildComicPrompt({ genre, theme, pages = 6, characters, setting, style }) {
    return [
        `Create a ${pages}-page comic script in the ${genre || 'adventure'} genre`,
        theme ? ` themed "${theme}"` : '',
        characters ? ` with characters: ${characters}` : '',
        setting ? ` set in: ${setting}` : '',
        style ? `. Art style: ${style}` : '',
        `. For each page output: PAGE N: [panel descriptions with dialogue in quotes].`,
        ' Keep descriptions visual and concise. No prose — panel format only.',
    ].join('');
}

function buildNovelPrompt({ genre, theme, chapters = 3, characters, setting, tone }) {
    return [
        `Write ${chapters} chapters of a ${genre || 'literary fiction'} novel`,
        theme ? ` about "${theme}"` : '',
        tone ? ` in a ${tone} tone` : '',
        characters ? `. Key characters: ${characters}` : '',
        setting ? `. Setting: ${setting}` : '',
        `. Format: "CHAPTER N: [Title]" then prose. Each chapter ~500 words with strong narrative hooks.`,
        ' No meta-commentary — start directly with Chapter 1.',
    ].join('');
}

function buildAnalysisPrompt(content) {
    // Truncate to avoid blowing token budgets on input
    const truncated = content.length > 3000 ? content.substring(0, 3000) + '…' : content;
    return [
        'Analyze this text and return ONLY a JSON object (no markdown, no explanation):',
        '{"sentiment":"positive|negative|neutral|mixed",',
        '"themes":["theme1","theme2"],',
        '"genres":["genre1"],',
        '"readabilityScore":1-10,',
        '"wordCount":<number>,',
        '"estimatedReadingTime":<minutes>,',
        '"complexity":"simple|medium|complex"}',
        '',
        `Text: ${truncated}`,
    ].join('\n');
}

function buildSynopsisPrompt(content, genre, formatType) {
    const truncated = content.length > 1500 ? content.substring(0, 1500) + '…' : content;
    return `Write a compelling 2-sentence synopsis for this ${formatType || 'story'} (${genre || 'fiction'}). ` +
        `No quotes around the synopsis.\n\n${truncated}`;
}

function buildIdeasPrompt(genre, count = 5, theme) {
    const themeClause = theme ? ` around the theme "${theme}"` : '';
    return genre
        ? `List ${count} original ${genre} story premises${themeClause}. One line each, numbered 1-${count}. No explanations.`
        : `List ${count} original story premises across varied genres${themeClause}. One line each, numbered 1-${count}. No explanations.`;
}

function buildImprovementPrompt(content, focusArea) {
    const truncated = content.length > 4000 ? content.substring(0, 4000) + '…' : content;
    return `Improve this text${focusArea ? `, focusing on ${focusArea}` : ''}. ` +
        `Return only the improved version — no commentary.\n\n${truncated}`;
}

// ---------------------------------------------------------------------------
// System Prompts — Minimal for token efficiency
// ---------------------------------------------------------------------------
const SYSTEM_PROMPTS = {
    story: 'You are a master storyteller. Write engaging, vivid narratives. Never break character or add meta-commentary.',
    comic: 'You are a comic script writer. Output panel-by-panel descriptions with dialogue. Visual, concise, cinematic.',
    novel: 'You are a novelist. Write immersive prose with strong characters and pacing. Chapter format.',
    analysis: 'You are a literary analyst. Return ONLY valid JSON — no markdown fences, no explanation.',
    synopsis: 'You write compelling blurbs. Concise, intriguing, spoiler-free.',
    ideas: 'You generate creative story premises. Each is unique, specific, and compelling.',
    improve: 'You are an expert editor. Enhance the text while preserving the author\'s voice. Return only the improved text.',
    general: 'You are a helpful creative writing assistant.',
};

// ---------------------------------------------------------------------------
// Core API Call with Retry
// ---------------------------------------------------------------------------

async function callGroq({ model, systemPrompt, userPrompt, maxTokens, temperature, apiKey }) {
    const groqApiKey = apiKey || process.env.GROQ_API_KEY;
    if (!groqApiKey) {
        throw new Error('GROQ_API_KEY is not configured');
    }

    const MAX_RETRIES = 2;
    let lastError;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${groqApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: model || MODELS.PRIMARY,
                    messages: [
                        { role: 'system', content: systemPrompt || SYSTEM_PROMPTS.general },
                        { role: 'user', content: userPrompt },
                    ],
                    max_tokens: maxTokens || 1000,
                    temperature: temperature ?? 0.7,
                    top_p: 0.9,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorBody = await response.text();
                // Retry on 5xx errors
                if (response.status >= 500 && attempt < MAX_RETRIES) {
                    lastError = new Error(`Groq API ${response.status}: ${errorBody}`);
                    const delay = Math.pow(2, attempt) * 500;
                    logger.warn(`Groq API ${response.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
                throw new Error(`Groq API error ${response.status}: ${errorBody}`);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            if (!content) {
                throw new Error('Empty response from Groq API');
            }

            return {
                content: content.trim(),
                model: data.model,
                tokensUsed: {
                    prompt: data.usage?.prompt_tokens || 0,
                    completion: data.usage?.completion_tokens || 0,
                    total: data.usage?.total_tokens || 0,
                },
            };
        } catch (err) {
            lastError = err;
            if (attempt < MAX_RETRIES && err.message?.includes('500')) {
                const delay = Math.pow(2, attempt) * 500;
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            throw err;
        }
    }

    throw lastError;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate creative content (story, comic, novel)
 */
async function generate({ prompt, genre, theme, length, tone, characters, setting, formatType, model, temperature, maxTokens, apiKey }) {
    // Determine the content type and build the appropriate prompt
    let userPrompt;
    let systemPrompt;
    let budget;

    const ft = (formatType || '').toLowerCase();

    if (ft === 'comic' || ft === 'comics') {
        userPrompt = prompt || buildComicPrompt({ genre, theme, characters, setting });
        systemPrompt = SYSTEM_PROMPTS.comic;
        budget = TOKEN_BUDGETS.long;
    } else if (ft === 'novel' || ft === 'book') {
        userPrompt = prompt || buildNovelPrompt({ genre, theme, characters, setting, tone });
        systemPrompt = SYSTEM_PROMPTS.novel;
        budget = TOKEN_BUDGETS.long;
    } else {
        userPrompt = prompt || buildStoryPrompt({ genre, theme, length, tone, characters, setting, formatType });
        systemPrompt = SYSTEM_PROMPTS.story;
        budget = TOKEN_BUDGETS[length] || TOKEN_BUDGETS.medium;
    }

    const result = await callGroq({
        model: model || MODELS.PRIMARY,
        systemPrompt,
        userPrompt,
        maxTokens: maxTokens || budget,
        temperature: temperature ?? 0.8,
        apiKey,
    });

    return result;
}

/**
 * Analyze content — returns structured JSON
 */
async function analyze({ content, analysisType, apiKey }) {
    const result = await callGroq({
        model: MODELS.FAST,
        systemPrompt: SYSTEM_PROMPTS.analysis,
        userPrompt: buildAnalysisPrompt(content),
        maxTokens: TOKEN_BUDGETS.analysis,
        temperature: 0.2,
        apiKey,
    });

    // Parse JSON from response
    try {
        // Strip any markdown fences the model might add
        let jsonStr = result.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        return { ...result, content: parsed };
    } catch {
        // Return raw content and calculate basic metrics
        const words = content.split(/\s+/).length;
        return {
            ...result,
            content: {
                sentiment: 'neutral',
                themes: ['general'],
                genres: ['fiction'],
                readabilityScore: 7,
                wordCount: words,
                estimatedReadingTime: Math.ceil(words / 200),
                complexity: 'medium',
                rawAnalysis: result.content,
            },
        };
    }
}

/**
 * Generate story ideas
 */
async function generateIdeas({ genre, count = 5, theme, apiKey }) {
    const result = await callGroq({
        model: MODELS.FAST,
        systemPrompt: SYSTEM_PROMPTS.ideas,
        userPrompt: buildIdeasPrompt(genre, count, theme),
        maxTokens: TOKEN_BUDGETS.ideas,
        temperature: 0.9,
        apiKey,
    });

    // Parse numbered list into array
    const ideas = result.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, count);

    return { ...result, content: ideas };
}

/**
 * Improve existing content
 */
async function improve({ content, focusArea, apiKey }) {
    const result = await callGroq({
        model: MODELS.LONG_CONTEXT,
        systemPrompt: SYSTEM_PROMPTS.improve,
        userPrompt: buildImprovementPrompt(content, focusArea),
        maxTokens: TOKEN_BUDGETS.improvement,
        temperature: 0.6,
        apiKey,
    });

    return result;
}

/**
 * Generate a synopsis for uploaded content
 */
async function generateSynopsis({ content, genre, formatType, apiKey }) {
    const result = await callGroq({
        model: MODELS.FAST,
        systemPrompt: SYSTEM_PROMPTS.synopsis,
        userPrompt: buildSynopsisPrompt(content, genre, formatType),
        maxTokens: TOKEN_BUDGETS.synopsis,
        temperature: 0.5,
        apiKey,
    });

    return result;
}

/**
 * Test connection to Groq API
 */
async function testConnection(apiKey) {
    try {
        const groqApiKey = apiKey || process.env.GROQ_API_KEY;
        if (!groqApiKey) return { success: false, message: 'GROQ_API_KEY not configured' };

        const response = await fetch('https://api.groq.com/openai/v1/models', {
            headers: { 'Authorization': `Bearer ${groqApiKey}` },
        });

        return {
            success: response.ok,
            message: response.ok ? 'Connected to Groq API' : `Failed: ${response.status}`,
        };
    } catch (err) {
        return { success: false, message: err.message };
    }
}

module.exports = {
    MODELS,
    MODEL_DISPLAY_NAMES,
    TOKEN_BUDGETS,
    generate,
    analyze,
    generateIdeas,
    improve,
    generateSynopsis,
    testConnection,
    callGroq,
    // Expose prompt builders for testing/customization
    buildStoryPrompt,
    buildComicPrompt,
    buildNovelPrompt,
    buildAnalysisPrompt,
    buildSynopsisPrompt,
    buildIdeasPrompt,
    buildImprovementPrompt,
    SYSTEM_PROMPTS,
};
