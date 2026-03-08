/**
 * AI Story Orchestrator — Chairman Pattern
 * 
 * Implements the "Gemini Chairman" pattern where:
 * - Gemini is the primary decision-maker and writer
 * - Groq handles fast, narrow-scoped subtasks (outline, classification, panel breakdown)
 * - Final output is coherent, Gemini-consistent, and properly merged
 * 
 * Flow:
 * 1. Chairman reads config (90+ parameters)
 * 2. Decides task decomposition (Gemini-only vs Gemini+Groq)
 * 3. Orchestrates calls to appropriate models
 * 4. Merges results into unified output
 * 5. Applies safety filters and post-processing
 */

const geminiService = require('./geminiService');
const groqService = require('./groqService');
const vectorService = require('./vectorService');

let logger;
try {
    logger = require('../utils/logger');
} catch {
    logger = { info: console.log, warn: console.warn, error: console.error, debug: () => { } };
}

// ─────────────────────────────────────────────────────────────────────────
// GROQ NARROW-SCOPED TASK BUILDERS
// ─────────────────────────────────────────────────────────────────────────

/**
 * Build prompt for Groq to validate and parse parameters
 */
function buildParameterValidationPrompt(config) {
    return `Validate and summarize these story parameters. Return a JSON object with:
{
  "genres": ["primary", "secondary"],
  "themes": ["theme1", "theme2"],
  "characterCount": number,
  "estimatedWordCount": number,
  "contentWarnings": ["warning1"],
  "isValid": boolean,
  "issues": ["issue1"] // if any validation failed
}

Parameters to validate:
- Primary Genre: ${config.primaryGenre}
- Secondary Genres: ${config.secondaryGenres?.join(', ') || 'none'}
- Themes: ${Array.isArray(config.themes) ? config.themes.join(', ') : config.themes || 'none'}
- Main Characters: ${config.mainCharacterCount || 1}
- Supporting Characters: ${config.supportingCharacterCount || 5}
- Target Length: ${config.targetLength} (${config.targetWordCount || '5000-15000'} words)
- Content Level: ${config.nsfwToggle || 'standard'}
- Violence: ${config.violenceIntensity || 5}/10
- Horror: ${config.horrorIntensityMax || 7}/10

Return ONLY valid JSON, no markdown.`;
}

/**
 * Build prompt for Groq to classify topic and suggest structure
 */
function buildClassificationPrompt(userInput, config) {
    return `Classify this story concept and suggest structure:

User Input: "${userInput}"
Genres: ${config.primaryGenre}${config.secondaryGenres?.length ? ` + ${config.secondaryGenres.join(', ')}` : ''}
Themes: ${Array.isArray(config.themes) ? config.themes.join(', ') : config.themes}

Return ONLY this JSON:
{
  "classification": "genre classification",
  "suggestedStructure": "three-act|hero-journey|slice-of-life|ensemble",
  "paceProfile": "fast|moderate|slow",
  "conventionalElements": ["element1", "element2"],
  "unconventionalTwists": ["twist1"],
  "narrativeApproach": "linear|nonlinear|framed"
}`;
}

/**
 * Build prompt for Groq to generate story outline
 */
function buildOutlinePrompt(userInput, config) {
    return `Generate a detailed story outline for:

Title Concept: ${config.customPremise || userInput}
Genre: ${config.primaryGenre}${config.secondaryGenres?.length ? ` + ${config.secondaryGenres.join(', ')}` : ''}
Length: ${config.targetLength} (${config.targetWordCount || '5000-15000'} words)
POV: ${config.narrativePOV}, Tense: ${config.tense}
Structure: ${config.structureTemplate || 'three-act'}
Themes: ${Array.isArray(config.themes) ? config.themes.join(', ') : config.themes}

Format as numbered chapters/sections with 1-2 sentence beats:
1. [Chapter/Section Name] - [beat description]
2. [Chapter/Section Name] - [beat description]
...

Focus on story flow and narrative beats.`;
}

/**
 * Build prompt for Groq to break down comic panels
 */
function buildPanelBreakdownPrompt(storySceneOrPremise, config) {
    return `Break this story/scene into visual comic panels:

Story/Scene: "${storySceneOrPremise.substring(0, 500)}"
Genre: ${config.primaryGenre}
Panel Count Target: ${config.comicPanelCount || 24}
Visual Tone: ${config.visualTone || 'dynamic'}
Action Density: ${config.actionDensity || 6}/10
Shot Distribution:
  - Establishing: ${config.establishingShotPercent || 25}%
  - Medium: ${config.mediumShotPercent || 40}%
  - Close-up: ${config.closeUpPercent || 25}%
  - Reaction: ${config.reactionPanelPercent || 10}%

Return ONLY JSON array:
[
  {
    "index": 1,
    "description": "Visual description",
    "pose": "character pose/action",
    "cameraAngle": "wide-shot|medium|close-up|pov",
    "dialogue": "character speech or narration",
    "mood": "emotional tone"
  }
]`;
}

// ─────────────────────────────────────────────────────────────────────────
// GROQ EXECUTION HELPERS (with error handling)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Safely execute Groq task with fallback
 */
async function executeGroqTask(taskName, prompt, correlationId) {
    try {
        logger.debug(`[${correlationId}] Executing Groq task: ${taskName}`);
        const result = await groqService.callGroq({
            model: 'llama-3.3-70b-versatile',
            systemPrompt: 'You are a story structuring assistant. Keep responses concise. Return your response as valid JSON.',
            userPrompt: prompt,
            maxTokens: 1000,
            temperature: 0.5,
            responseFormat: 'json',
        });
        logger.debug(`[${correlationId}] Groq task ${taskName} completed`);
        return result;
    } catch (error) {
        logger.warn(`[${correlationId}] Groq task ${taskName} failed: ${error.message}. Continuing without it.`);
        return null; // Non-fatal: continue without Groq enhancement
    }
}

// ─────────────────────────────────────────────────────────────────────────
// CHAIRMAN PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────────────

function buildChairmanPrompt(userInput, config, groqContext = {}) {
    const sections = [];

    // 1. Core Directive — PREMISE FIRST
    sections.push(`# STORY GENERATION DIRECTIVE`);
    sections.push(`You are a world-class fiction writer. Generate a complete, compelling story based on the user's concept below.`);
    sections.push(`Write ONLY the story prose — no commentary, no meta-text, no authors notes.`);
    sections.push(`Start immediately with the narrative.`);
    sections.push(``);

    // 2. THE USER'S STORY CONCEPT — MOST IMPORTANT PART
    sections.push(`## ⚡ USER'S STORY CONCEPT (THIS IS YOUR PRIMARY DIRECTIVE — FOLLOW IT CLOSELY)`);
    if (config.customPremise) {
        sections.push(config.customPremise);
    }
    if (userInput && userInput.trim()) {
        sections.push(userInput);
    }
    if (!config.customPremise && !userInput) {
        sections.push(`(No specific premise provided — generate an original story in the ${config.primaryGenre || 'fantasy'} genre)`);
    }
    sections.push(``);

    // 3. Include Groq context if available (pre-processed insights)
    if (groqContext.classification) {
        sections.push(`## PRE-ANALYZED INSIGHTS`);
        sections.push(`Classification: ${groqContext.classification}`);
        if (groqContext.narrativeApproach) sections.push(`Narrative approach: ${groqContext.narrativeApproach}`);
        if (groqContext.conventionalElements?.length) sections.push(`Genre elements: ${groqContext.conventionalElements.join(', ')}`);
        sections.push(``);
    }

    if (groqContext.outline && groqContext.outline.length > 0) {
        sections.push(`## SUGGESTED OUTLINE`);
        groqContext.outline.forEach(beat => sections.push(`- ${beat}`));
        sections.push(``);
    }

    if (groqContext.vectorTwists && groqContext.vectorTwists.length > 0) {
        sections.push(`## STORYLINE UNIQUENESS PROTOCOL (RAG VECTOR SEARCH)`);
        sections.push(`We found highly similar stories already exist in our database. To ensure this new story stands out, you MUST subvert expectations and introduce UNIQUE twists.`);
        sections.push(`Avoid these common tropes found in similar stories:`);
        groqContext.vectorTwists.forEach((story, i) => {
            sections.push(`- Similar Idea ${i + 1}: "${story.storyline.substring(0, 150)}..." -> DIVERGE FROM THIS`);
        });
        sections.push(`Inject a surprising twist or use an unconventional narrative approach so this story is completely unique.`);
        sections.push(``);
    }

    // 4. LENGTH & STRUCTURE CONSTRAINTS (critical for chapter control)
    sections.push(`## LENGTH & STRUCTURE REQUIREMENTS`);
    const chapterCount = config.chapterCount || 1;
    const wordCount = config.targetWordCount || 800;
    sections.push(`- Generate EXACTLY ${chapterCount} chapter(s)`);
    sections.push(`- Target word count: approximately ${wordCount} words total`);
    sections.push(`- Length category: ${config.targetLength || 'short'}`);
    if (chapterCount === 1) {
        sections.push(`- Write as a single continuous narrative (no chapter headers)`);
    } else {
        sections.push(`- Format each chapter with: ## Chapter [N]: [Title]`);
    }
    sections.push(``);

    // 5. Genre & Tone
    sections.push(`## GENRE & TONE`);
    sections.push(`- Genre: ${config.primaryGenre || 'fantasy'}${config.secondaryGenres?.length ? ` + ${config.secondaryGenres.join(', ')}` : ''}`);
    if (config.tone) sections.push(`- Tone: ${Array.isArray(config.tone) ? config.tone.join(', ') : config.tone}`);
    if (config.pacing) sections.push(`- Pacing: ${config.pacing}`);
    if (config.humorLevel) sections.push(`- Humor level: ${config.humorLevel}`);
    sections.push(``);

    // 6. Characters (only if specified)
    if (config.mainCharacterCount || config.protagonistArchetype || config.antagonistType) {
        sections.push(`## CHARACTERS`);
        if (config.mainCharacterCount) sections.push(`- Main characters: ${config.mainCharacterCount}`);
        if (config.supportingCharacterCount) sections.push(`- Supporting: ${config.supportingCharacterCount}`);
        if (config.protagonistArchetype) sections.push(`- Protagonist type: ${config.protagonistArchetype}`);
        if (config.antagonistType) sections.push(`- Antagonist: ${config.antagonistType}`);
        sections.push(``);
    }

    // 7. Plot structure (only if specified)
    if (config.structureTemplate || config.endingStyle || config.twistIntensity || config.themes) {
        sections.push(`## PLOT`);
        if (config.structureTemplate) sections.push(`- Structure: ${config.structureTemplate}`);
        if (config.endingStyle) sections.push(`- Ending: ${config.endingStyle}`);
        if (config.twistIntensity) sections.push(`- Twist intensity: ${config.twistIntensity}`);
        if (config.themes) sections.push(`- Themes: ${Array.isArray(config.themes) ? config.themes.join(', ') : config.themes}`);
        sections.push(``);
    }

    // 8. Style (only if specified)
    if (config.proseDensity || config.narrativePOV || config.tense) {
        sections.push(`## STYLE`);
        if (config.narrativePOV) sections.push(`- POV: ${config.narrativePOV}`);
        if (config.tense) sections.push(`- Tense: ${config.tense}`);
        if (config.proseDensity) sections.push(`- Prose density: ${config.proseDensity}`);
        if (config.dialogueToDescriptionRatio) sections.push(`- Dialogue:Description ratio: ${config.dialogueToDescriptionRatio}:${100 - config.dialogueToDescriptionRatio}`);
        sections.push(``);
    }

    // 9. Comic panels (if applicable)
    if (config.mode && config.mode.includes('comic')) {
        sections.push(`## COMIC PANEL BREAKDOWN`);
        sections.push(`- Panel Layout: ${config.panelLayoutStyle || 'standard'}`);
        sections.push(`- Target Panels: ${config.comicPanelCount || 24}`);
        sections.push(`- Visual Tone: ${config.visualTone || 'dynamic'}`);
        sections.push(``);
    }

    // 10. Safety (minimal, only if set)
    if (config.nsfwToggle || config.blockRealPeopleTrademarks) {
        sections.push(`## CONSTRAINTS`);
        if (config.nsfwToggle) sections.push(`- Content level: ${config.nsfwToggle}`);
        if (config.blockRealPeopleTrademarks) sections.push(`- No real people or trademarked characters`);
        sections.push(``);
    }

    // 11. Final reminder
    sections.push(`## IMPORTANT REMINDERS`);
    sections.push(`1. Your story MUST be about the user's concept described above`);
    sections.push(`2. Stay within ${wordCount} words (±20%)`);
    sections.push(`3. Generate exactly ${chapterCount} chapter(s)`);
    sections.push(`4. Write ONLY the story — no meta-commentary`);
    sections.push(`5. Be creative and original — generate a UNIQUE story every time`);
    if (config.generationSeed) {
        sections.push(`[Generation Seed: ${config.generationSeed} — use this for creative variation]`);
    }
    sections.push(``);
    sections.push(`BEGIN WRITING:`);

    return sections.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN ORCHESTRATION FUNCTION
// ─────────────────────────────────────────────────────────────────────────

/**
 * Main orchestration function that implements the Chairman pattern
 * @param {Object} params
 * @param {string} params.userInput - User-provided text/premise
 * @param {Object} params.config - Full AI config object (90+ params)
 * @param {boolean} params.streaming - Enable streaming to caller
 * @param {Function} params.onChunk - Callback for stream chunks
 * @param {string} params.correlationId - Request tracing ID
 * @returns {Promise<Object>} Generated story with metadata
 */
async function orchestrateGeneration({
    userInput = '',
    config = {},
    streaming = false,
    onChunk = null,
    correlationId = `gen-${Date.now()}`,
} = {}) {
    const startTime = Date.now();

    // CRITICAL: If userInput is empty but config has customPremise, use it
    // This ensures the user's story concept ALWAYS reaches the prompt
    if (!userInput && config.customPremise) {
        userInput = config.customPremise;
        logger.info(`[${correlationId}] Using customPremise as userInput (was empty)`);
    }

    logger.info(`[${correlationId}] Starting story generation`, {
        mode: config.mode,
        genre: config.primaryGenre,
        streaming,
        hasUserInput: !!userInput,
        userInputLength: userInput?.length || 0,
        hasCustomPremise: !!config.customPremise,
        customPremiseLength: config.customPremise?.length || 0,
        chapterCount: config.chapterCount,
        targetWordCount: config.targetWordCount,
    });

    try {
        // ─────────────────────────────────────────────────────────────
        // PHASE 1: CHAIRMAN DECISION — Model Strategy
        // ─────────────────────────────────────────────────────────────

        const latencyPriority = config.latencyPriority || 'balanced';
        const useGroqTasks = latencyPriority !== 'speed-only'; // Groq for insights unless speed-critical

        logger.info(`[${correlationId}] Chairman Strategy:`, {
            latencyPriority,
            useGroqTasks,
            streamingEnabled: streaming,
        });

        // ─────────────────────────────────────────────────────────────
        // PHASE 2A: PARALLEL GROQ PRE-PROCESSING (optional)
        // ─────────────────────────────────────────────────────────────

        let groqContext = {};

        if (useGroqTasks) {
            logger.debug(`[${correlationId}] Starting parallel Groq pre-processing tasks and Vector Search`);

            // Execute Groq tasks in parallel: validation, classification, outline, AND Vector Search
            const tasks = [
                executeGroqTask(
                    'parameter-validation',
                    buildParameterValidationPrompt(config),
                    correlationId
                ),
                executeGroqTask(
                    'topic-classification',
                    buildClassificationPrompt(userInput || config.customPremise, config),
                    correlationId
                ),
                executeGroqTask(
                    'outline-generation',
                    buildOutlinePrompt(userInput || config.customPremise, config),
                    correlationId
                ),
                // Vector search check
                vectorService.checkStorylineExists(userInput || config.customPremise).catch(() => ({ exists: false, similarStories: [] }))
            ];

            const results = await Promise.all(tasks);
            const [valResult, classResult, outResult, vectorResult] = results;

            // Parse Vector Search results
            if (vectorResult && vectorResult.exists && vectorResult.similarStories) {
                groqContext.vectorTwists = vectorResult.similarStories;
                logger.debug(`[${correlationId}] Vector Search found ${vectorResult.similarStories.length} similar stories. Uniqueness protocol activated.`);
            }

            // Parse Groq results
            if (valResult?.content) {
                try {
                    groqContext.validation = JSON.parse(valResult.content);
                } catch { /* JSON parse error, skip */ }
            }

            if (classResult?.content) {
                try {
                    const classified = JSON.parse(classResult.content);
                    groqContext.classification = classified.classification;
                    groqContext.narrativeApproach = classified.narrativeApproach;
                    groqContext.conventionalElements = classified.conventionalElements;
                    groqContext.unconventionalTwists = classified.unconventionalTwists;
                } catch { /* JSON parse error, skip */ }
            }

            if (outResult?.content) {
                // Parse outline as text lines
                groqContext.outline = outResult.content
                    .split('\n')
                    .filter(line => line.match(/^\d+\./))
                    .slice(0, 15); // Limit to 15 beats
            }

            logger.debug(`[${correlationId}] Groq pre-processing complete`, {
                hasValidation: !!groqContext.validation,
                hasClassification: !!groqContext.classification,
                outlineBeats: groqContext.outline?.length || 0,
                hasVectorTwists: !!groqContext.vectorTwists,
            });
        }

        // ─────────────────────────────────────────────────────────────
        // PHASE 2B: PRIMARY GENERATION — Gemini Chairman or Groq Fallback
        // ─────────────────────────────────────────────────────────────

        const chairmanPrompt = buildChairmanPrompt(userInput, config, groqContext);

        let generatedContent;
        const geminiConfigured = !!process.env.GEMINI_API_KEY;

        if (geminiConfigured) {
            // Use Gemini as chairman
            if (streaming && onChunk) {
                generatedContent = await geminiService.generateContent({
                    prompt: chairmanPrompt,
                    config,
                    stream: true,
                    onChunk: (chunk) => {
                        onChunk({
                            type: 'generation',
                            model: 'gemini',
                            chunk: chunk.text,
                            done: chunk.done,
                        });
                    },
                    correlationId,
                });
            } else {
                generatedContent = await geminiService.generateContent({
                    prompt: chairmanPrompt,
                    config,
                    stream: false,
                    correlationId,
                });
            }
        } else {
            // Fallback: use Groq as primary generator when Gemini is not configured
            logger.info(`[${correlationId}] Gemini not configured, using Groq as primary generator`);

            if (!process.env.GROQ_API_KEY) {
                throw new Error('AI Generation failed: Neither GEMINI_API_KEY nor GROQ_API_KEY is configured on the server. Please add an API key to the .env file.');
            }

            // Use temperature from user params with random jitter for unique outputs
            const baseTemp = config.modelTemperature || 0.8;
            const jitter = (Math.random() - 0.5) * 0.15; // ±0.075 variation
            const effectiveTemp = Math.max(0.1, Math.min(1.5, baseTemp + jitter));

            const groqResult = await groqService.callGroq({
                model: 'llama-3.3-70b-versatile',
                systemPrompt: 'You are a world-class fiction writer. Generate complete, publication-quality stories. Output ONLY the story text — no commentary, no meta-text. Be creative and unique in every generation.',
                userPrompt: chairmanPrompt,
                maxTokens: config.targetWordCount ? Math.min(Math.ceil(config.targetWordCount * 1.5), 8000) : 4000,
                temperature: effectiveTemp,
            });
            generatedContent = groqResult.content;

            if (streaming && onChunk) {
                // Send the full result as a single chunk for streaming mode
                onChunk({
                    type: 'generation',
                    model: 'groq-llama-3.3-70b',
                    chunk: generatedContent,
                    done: true,
                });
            }
        }

        logger.info(`[${correlationId}] Chairman generation complete`, {
            contentLength: generatedContent.length,
            duration: Date.now() - startTime,
        });

        // ─────────────────────────────────────────────────────────────
        // PHASE 3: OUTPUT PARSING & STRUCTURING
        // ─────────────────────────────────────────────────────────────

        const output = parseGeneratedContent(generatedContent, config);

        // ─────────────────────────────────────────────────────────────
        // PHASE 3A: PARALLEL GROQ POST-PROCESSING (optional)
        // ─────────────────────────────────────────────────────────────

        if (useGroqTasks) {
            logger.debug(`[${correlationId}] Starting parallel Groq post-processing tasks`);

            const postProcessTasks = [];

            // Task: Generate panel breakdown for comic mode
            if (config.mode.includes('comic')) {
                const sceneText = output.chapters[0]?.content || generatedContent.substring(0, 500);
                postProcessTasks.push(
                    executeGroqTask(
                        'panel-breakdown',
                        buildPanelBreakdownPrompt(sceneText, config),
                        correlationId
                    )
                );
            }

            // Execute post-processing tasks
            if (postProcessTasks.length > 0) {
                const postResults = await Promise.all(postProcessTasks);

                // Parse panel breakdown if available
                if (postResults[0]?.content && config.mode.includes('comic')) {
                    try {
                        const panels = JSON.parse(postResults[0].content);
                        if (Array.isArray(panels)) {
                            output.panelBreakdown = panels.slice(0, config.comicPanelCount || 24);
                        }
                    } catch { /* JSON parse error, skip */ }
                }
            }

            logger.debug(`[${correlationId}] Groq post-processing complete`);
        }

        // ─────────────────────────────────────────────────────────────
        // PHASE 4: POST-PROCESSING & SAFETY FILTER
        // ─────────────────────────────────────────────────────────────

        applyPostProcessing(output, config);
        applySafetyFilters(output, config);

        // ─────────────────────────────────────────────────────────────
        // PHASE 5: METADATA EXTRACTION
        // ─────────────────────────────────────────────────────────────

        const metadata = {
            generatedAt: new Date().toISOString(),
            durationMs: Date.now() - startTime,
            model: 'gemini-chairman',
            requestId: correlationId,
            groqEnhanced: useGroqTasks && Object.keys(groqContext).length > 0,
            config: {
                mode: config.mode,
                genre: config.primaryGenre,
                targetLength: config.targetLength,
            },
        };

        // ─────────────────────────────────────────────────────────────
        // PHASE 6: RAG VECTOR DATABASE STORAGE
        // ─────────────────────────────────────────────────────────────
        // Store this new storyline for future uniqueness checks (fire and forget)
        if (output && output.chapters && output.chapters.length > 0) {
            const firstChapterPreview = output.chapters[0].content.substring(0, 1000);
            const storylineToStore = config.customPremise || userInput || firstChapterPreview;
            const themesToStore = config.themes ? (Array.isArray(config.themes) ? config.themes : [config.themes]) : [];

            vectorService.storeStoryEmbedding(storylineToStore, config.primaryGenre || 'fantasy', themesToStore)
                .catch(err => logger.warn(`[${correlationId}] Failed to store vector embedding: ${err.message}`));
        }

        if (onChunk) {
            onChunk({
                type: 'metadata',
                data: metadata,
                done: true,
            });
        }

        return {
            ...output,
            metadata,
        };
    } catch (error) {
        logger.error(`[${correlationId}] Generation failed: ${error.message}`, {
            stack: error.stack,
        });

        if (onChunk) {
            onChunk({
                type: 'error',
                error: error.message,
                done: true,
            });
        }

        throw error;
    }
}

// ─────────────────────────────────────────────────────────────────────────
// OUTPUT PARSING
// ─────────────────────────────────────────────────────────────────────────

function parseGeneratedContent(content, config) {
    const output = {
        logline: '',
        synopsis: '',
        outline: [],
        chapters: [],
        panelBreakdown: [],
        characterSheets: [],
        worldBible: '',
        rawContent: content,
    };

    // Basic parsing — handles markdown sections
    const sections = content.split(/\n##\s+/);

    sections.forEach((section) => {
        const lines = section.split('\n');
        const header = lines[0] || '';

        if (header.match(/logline/i)) {
            output.logline = lines.slice(1).join('\n').trim();
        } else if (header.match(/synopsis/i)) {
            output.synopsis = lines.slice(1).join('\n').trim();
        } else if (header.match(/outline/i)) {
            output.outline = lines.slice(1).filter((l) => l.trim().length > 0);
        } else if (header.match(/chapter|scene/i)) {
            output.chapters.push({
                title: header,
                content: lines.slice(1).join('\n').trim(),
            });
        } else if (header.match(/panel/i)) {
            try {
                // Try JSON parsing for comic panels
                const json = JSON.parse(section);
                output.panelBreakdown = Array.isArray(json) ? json : [json];
            } catch {
                // Fallback to text
                output.panelBreakdown.push({
                    description: section.trim(),
                });
            }
        } else if (header.match(/character/i)) {
            output.characterSheets.push({
                name: header,
                description: lines.slice(1).join('\n').trim(),
            });
        } else if (header.match(/world|lore|setting/i)) {
            output.worldBible += section + '\n';
        }
    });

    return output;
}

// ─────────────────────────────────────────────────────────────────────────
// POST-PROCESSING (formatting, cleanup)
// ─────────────────────────────────────────────────────────────────────────

function applyPostProcessing(output, config) {
    // Ensure chapters are properly formatted
    output.chapters = output.chapters.map((ch) => ({
        ...ch,
        content: (ch.content || '')
            .trim()
            .replace(/\n{3,}/g, '\n\n'), // Collapse extra newlines
    }));

    // Format panel breakdown if needed
    if (config.mode.includes('comic') && output.panelBreakdown.length > 0) {
        output.panelBreakdown = output.panelBreakdown.map((panel, idx) => ({
            index: idx + 1,
            ...panel,
        }));
    }

    // Calculate word count
    const storyText = output.chapters.map((c) => c.content).join(' ');
    output.wordCount = storyText.split(/\s+/).length;
}

// ─────────────────────────────────────────────────────────────────────────
// SAFETY FILTERING
// ─────────────────────────────────────────────────────────────────────────

function applySafetyFilters(output, config) {
    const contentFilters = config.contentFilters || {};
    const banList = (config.contentBanList || '').split(',').map((s) => s.trim());

    if (contentFilters.violence && config.violenceIntensity < 5) {
        // Tone down violence
        output.chapters = output.chapters.map((ch) => ({
            ...ch,
            content: ch.content
                .replace(/\b(killed|murdered|slaughtered|blood|gore)\b/gi, '[FILTERED]'),
        }));
    }

    // Apply ban list
    banList.forEach((banned) => {
        if (banned.length > 0) {
            const regex = new RegExp(`\\b${escaped(banned)}\\b`, 'gi');
            output.chapters = output.chapters.map((ch) => ({
                ...ch,
                content: ch.content.replace(regex, '[FILTERED]'),
            }));
        }
    });
}

function escaped(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
    orchestrateGeneration,
    buildChairmanPrompt,
    parseGeneratedContent,
    // Groq helpers for testing/customization
    buildParameterValidationPrompt,
    buildClassificationPrompt,
    buildOutlinePrompt,
    buildPanelBreakdownPrompt,
    executeGroqTask,
};
