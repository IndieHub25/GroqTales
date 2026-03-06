/**
 * GroqTales Backend Test Suite — Groq AI Service & API Endpoints
 *
 * Tests cover:
 * 1. groqService module — prompt builders, model config, token budgets
 * 2. Route handler structure — /api/groq, /api/v1/ai, /api/groq/models
 * 3. Request/response validation
 * 4. Error handling
 *
 * Run: npx jest tests/backend/groq-service.test.js
 */

// ---------------------------------------------------------------------------
// Mock logger before requiring anything else
// ---------------------------------------------------------------------------
jest.mock('../../server/utils/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
}));

// Mock fetch globally
const originalFetch = global.fetch;
const mockFetch = jest.fn();
global.fetch = mockFetch;

const groqService = require('../../server/services/groqService');

// ============================================================================
// GROQ SERVICE — UNIT TESTS
// ============================================================================

describe('Groq Service Module', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.GROQ_API_KEY = 'test-api-key-123';
    });

    afterEach(() => {
        delete process.env.GROQ_API_KEY;
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    // ---------- Model Configuration ----------

    describe('Model Configuration', () => {
        test('exports valid Groq model identifiers', () => {
            expect(groqService.MODELS.PRIMARY).toBe('llama-3.3-70b-versatile');
            expect(groqService.MODELS.FAST).toBe('llama-3.1-8b-instant');
            expect(groqService.MODELS.LONG_CONTEXT).toBe('mistral-saba-24b');
        });

        test('exports display names for all models', () => {
            const modelIds = Object.values(groqService.MODELS);
            for (const id of modelIds) {
                expect(groqService.MODEL_DISPLAY_NAMES[id]).toBeDefined();
                expect(typeof groqService.MODEL_DISPLAY_NAMES[id]).toBe('string');
            }
        });

        test('exports token budgets for all content lengths', () => {
            expect(groqService.TOKEN_BUDGETS.short).toBeLessThan(groqService.TOKEN_BUDGETS.medium);
            expect(groqService.TOKEN_BUDGETS.medium).toBeLessThan(groqService.TOKEN_BUDGETS.long);
            expect(groqService.TOKEN_BUDGETS.synopsis).toBeLessThanOrEqual(200);
            expect(groqService.TOKEN_BUDGETS.analysis).toBeLessThanOrEqual(500);
        });
    });

    // ---------- Prompt Builders ----------

    describe('Prompt Builders', () => {
        test('buildStoryPrompt includes all specified parameters', () => {
            const prompt = groqService.buildStoryPrompt({
                genre: 'sci-fi',
                theme: 'time travel',
                length: 'short',
                tone: 'dark',
                characters: 'Dr. Smith',
                setting: 'Mars colony',
            });

            expect(prompt).toContain('short');
            expect(prompt).toContain('sci-fi');
            expect(prompt).toContain('time travel');
            expect(prompt).toContain('dark');
            expect(prompt).toContain('Dr. Smith');
            expect(prompt).toContain('Mars colony');
            expect(prompt).toContain('no preamble');
        });

        test('buildStoryPrompt handles minimal parameters', () => {
            const prompt = groqService.buildStoryPrompt({ theme: 'adventure' });
            expect(prompt).toContain('adventure');
            expect(prompt).toContain('medium');
            expect(prompt).toContain('story');
        });

        test('buildComicPrompt generates panel-format instructions', () => {
            const prompt = groqService.buildComicPrompt({
                genre: 'superhero',
                theme: 'origin story',
                pages: 4,
            });

            expect(prompt).toContain('4-page');
            expect(prompt).toContain('superhero');
            expect(prompt).toContain('origin story');
            expect(prompt).toContain('PAGE N');
            expect(prompt).toContain('panel');
        });

        test('buildNovelPrompt generates chapter-format instructions', () => {
            const prompt = groqService.buildNovelPrompt({
                genre: 'mystery',
                theme: 'locked room',
                chapters: 3,
            });

            expect(prompt).toContain('3 chapters');
            expect(prompt).toContain('mystery');
            expect(prompt).toContain('locked room');
            expect(prompt).toContain('CHAPTER N');
        });

        test('buildAnalysisPrompt requests JSON output format', () => {
            const prompt = groqService.buildAnalysisPrompt('Test story content...');
            expect(prompt).toContain('JSON');
            expect(prompt).toContain('sentiment');
            expect(prompt).toContain('themes');
            expect(prompt).toContain('readabilityScore');
            expect(prompt).toContain('wordCount');
        });

        test('buildAnalysisPrompt truncates long content', () => {
            const longContent = 'a'.repeat(5000);
            const prompt = groqService.buildAnalysisPrompt(longContent);
            expect(prompt.length).toBeLessThan(5000);
            expect(prompt).toContain('…');
        });

        test('buildSynopsisPrompt is concise (token-efficient)', () => {
            const prompt = groqService.buildSynopsisPrompt('story content', 'fantasy', 'novel');
            expect(prompt).toContain('2-sentence');
            expect(prompt).toContain('synopsis');
            expect(prompt).toContain('fantasy');
            expect(prompt).toContain('novel');
        });

        test('buildIdeasPrompt with genre', () => {
            const prompt = groqService.buildIdeasPrompt('horror', 5);
            expect(prompt).toContain('5');
            expect(prompt).toContain('horror');
            expect(prompt).toContain('No explanations');
        });

        test('buildIdeasPrompt without genre', () => {
            const prompt = groqService.buildIdeasPrompt(undefined, 3);
            expect(prompt).toContain('3');
            expect(prompt).toContain('varied genres');
        });

        test('buildImprovementPrompt with focus area', () => {
            const prompt = groqService.buildImprovementPrompt('text', 'pacing');
            expect(prompt).toContain('pacing');
            expect(prompt).toContain('no commentary');
        });

        test('buildImprovementPrompt truncates long content', () => {
            const longContent = 'b'.repeat(6000);
            const prompt = groqService.buildImprovementPrompt(longContent, 'dialogue');
            expect(prompt.length).toBeLessThan(6000);
        });
    });

    // ---------- System Prompts ----------

    describe('System Prompts', () => {
        test('all system prompts are defined and non-empty', () => {
            const keys = ['story', 'comic', 'novel', 'analysis', 'synopsis', 'ideas', 'improve', 'general'];
            for (const key of keys) {
                expect(groqService.SYSTEM_PROMPTS[key]).toBeDefined();
                expect(groqService.SYSTEM_PROMPTS[key].length).toBeGreaterThan(10);
            }
        });

        test('analysis system prompt enforces JSON-only output', () => {
            expect(groqService.SYSTEM_PROMPTS.analysis).toContain('JSON');
            expect(groqService.SYSTEM_PROMPTS.analysis).toContain('no markdown');
        });
    });

    // ---------- API Calls ----------

    describe('callGroq', () => {
        test('throws when GROQ_API_KEY is missing', async () => {
            delete process.env.GROQ_API_KEY;
            await expect(groqService.callGroq({
                userPrompt: 'test',
            })).rejects.toThrow('GROQ_API_KEY');
        });

        test('sends correct headers and body to Groq API', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: 'Generated text' } }],
                    model: 'llama-3.3-70b-versatile',
                    usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
                }),
            });

            const result = await groqService.callGroq({
                model: 'llama-3.3-70b-versatile',
                systemPrompt: 'You are a writer.',
                userPrompt: 'Write something.',
                maxTokens: 100,
                temperature: 0.7,
            });

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.groq.com/openai/v1/chat/completions',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-api-key-123',
                        'Content-Type': 'application/json',
                    }),
                })
            );

            expect(result.content).toBe('Generated text');
            expect(result.tokensUsed.total).toBe(30);
        });

        test('retries on 500 errors', async () => {
            mockFetch
                .mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'Server error' })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        choices: [{ message: { content: 'Retry success' } }],
                        model: 'llama-3.3-70b-versatile',
                        usage: { prompt_tokens: 5, completion_tokens: 10, total_tokens: 15 },
                    }),
                });

            const result = await groqService.callGroq({
                userPrompt: 'test retry',
                maxTokens: 50,
            });

            expect(result.content).toBe('Retry success');
            expect(mockFetch).toHaveBeenCalledTimes(2);
        });

        test('throws on non-retryable 4xx errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                text: async () => 'Bad request',
            });

            await expect(groqService.callGroq({
                userPrompt: 'bad request',
            })).rejects.toThrow('400');
        });
    });

    // ---------- High-Level Functions ----------

    describe('generate()', () => {
        test('generates story content with correct parameters', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: 'Once upon a time...' } }],
                    model: 'llama-3.3-70b-versatile',
                    usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
                }),
            });

            const result = await groqService.generate({
                genre: 'fantasy',
                theme: 'dragons',
                length: 'short',
            });

            expect(result.content).toBe('Once upon a time...');
            expect(result.model).toBe('llama-3.3-70b-versatile');
        });

        test('uses comic system prompt for comic formatType', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: 'PAGE 1: Panel 1...' } }],
                    model: 'llama-3.3-70b-versatile',
                    usage: { prompt_tokens: 30, completion_tokens: 80, total_tokens: 110 },
                }),
            });

            const result = await groqService.generate({
                genre: 'superhero',
                formatType: 'comic',
            });

            const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(callBody.messages[0].content).toContain(groqService.SYSTEM_PROMPTS.comic);
        });
    });

    describe('analyze()', () => {
        test('returns parsed JSON analysis', async () => {
            const mockAnalysis = {
                sentiment: 'positive',
                themes: ['adventure'],
                genres: ['fantasy'],
                readabilityScore: 8,
                wordCount: 500,
                estimatedReadingTime: 3,
                complexity: 'medium',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: JSON.stringify(mockAnalysis) } }],
                    model: 'llama-3.1-8b-instant',
                    usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
                }),
            });

            const result = await groqService.analyze({ content: 'A brave knight...' });
            expect(result.content.sentiment).toBe('positive');
            expect(result.content.themes).toContain('adventure');
        });

        test('handles non-JSON analysis response gracefully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: 'This is a great story about adventure.' } }],
                    model: 'llama-3.1-8b-instant',
                    usage: { prompt_tokens: 50, completion_tokens: 20, total_tokens: 70 },
                }),
            });

            const result = await groqService.analyze({ content: 'Test content' });
            expect(result.content.sentiment).toBe('neutral');
            expect(result.content.rawAnalysis).toBeDefined();
        });
    });

    describe('generateIdeas()', () => {
        test('returns array of ideas', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: '1. A wizard school\n2. Space pirates\n3. Underwater city' } }],
                    model: 'llama-3.1-8b-instant',
                    usage: { prompt_tokens: 20, completion_tokens: 30, total_tokens: 50 },
                }),
            });

            const result = await groqService.generateIdeas({ genre: 'fantasy', count: 3 });
            expect(result.content).toHaveLength(3);
            expect(result.content[0]).toBe('A wizard school');
        });
    });

    describe('improve()', () => {
        test('returns improved content', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: 'The dark, stormy night engulfed the countryside...' } }],
                    model: 'mixtral-8x7b-32768',
                    usage: { prompt_tokens: 40, completion_tokens: 60, total_tokens: 100 },
                }),
            });

            const result = await groqService.improve({
                content: 'It was a dark and stormy night.',
                focusArea: 'descriptive language',
            });

            expect(result.content).toContain('stormy');
            expect(result.model).toBe('mixtral-8x7b-32768');
        });
    });

    describe('generateSynopsis()', () => {
        test('generates concise synopsis', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: 'A brave knight embarks on a quest to save the world.' } }],
                    model: 'llama-3.1-8b-instant',
                    usage: { prompt_tokens: 30, completion_tokens: 15, total_tokens: 45 },
                }),
            });

            const result = await groqService.generateSynopsis({
                content: 'Long story text...',
                genre: 'fantasy',
                formatType: 'novel',
            });

            expect(result.content.length).toBeLessThan(500);
            expect(result.tokensUsed.total).toBeLessThan(100);
        });
    });

    describe('testConnection()', () => {
        test('returns success when API responds OK', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true });

            const result = await groqService.testConnection();
            expect(result.success).toBe(true);
            expect(result.message).toContain('Connected');
        });

        test('returns failure when GROQ_API_KEY is missing', async () => {
            delete process.env.GROQ_API_KEY;
            const result = await groqService.testConnection();
            expect(result.success).toBe(false);
        });
    });
});
