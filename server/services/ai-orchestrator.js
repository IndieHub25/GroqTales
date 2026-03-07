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
            model: 'llama3-8b-8192',
            systemPrompt: 'You are a story structuring assistant. Keep responses concise and return only requested format.',
            userPrompt: prompt,
            maxTokens: 1000,
            temperature: 0.5,
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

    // 1. Core Directive
    sections.push(`# CHAIRMAN DIRECTIVE: STORY GENERATION`);
    sections.push(`You are the primary AI architect overseeing this story generation.`);
    sections.push(`Your decisions are final. You will generate complete, coherent output.`);
    
    // Include Groq context if available
    if (groqContext.classification) {
        sections.push(`\n[STRUCTURED INSIGHTS FROM TASK-SPECIFIC AI]`);
        sections.push(`Story Classification: ${groqContext.classification}`);
        sections.push(`Suggested Narrative Approach: ${groqContext.narrativeApproach}`);
        sections.push(`Conventional Genre Elements to Include: ${groqContext.conventionalElements?.join(', ') || 'none'}`);
        sections.push(`Recommended Unconventional Twists: ${groqContext.unconventionalTwists?.join(', ') || 'balance with convention'}`);
    }
    
    if (groqContext.outline && groqContext.outline.length > 0) {
        sections.push(`\n[STORY STRUCTURE OUTLINE (Pre-Generated)]`);
        groqContext.outline.forEach(beat => {
            sections.push(`- ${beat}`);
        });
    }
    
    sections.push(``);

    // 2. User Input & Requirements
    sections.push(`## USER REQUEST`);
    if (config.customPremise) {
        sections.push(`Premise: ${config.customPremise}`);
    }
    if (userInput) {
        sections.push(`Additional input: ${userInput}`);
    }
    sections.push(``);

    // 3. Configuration Summary
    sections.push(`## GENERATION CONFIG`);
    sections.push(`- Mode: ${config.mode} (${config.mode === 'story-only' ? 'prose only' : config.mode === 'story-comic' ? 'prose + comic panels' : 'comic panels only'})`);
    sections.push(`- Genre: ${config.primaryGenre}${config.secondaryGenres?.length ? ` + ${config.secondaryGenres.join(', ')}` : ''}`);
    sections.push(`- Length: ${config.targetLength} (${config.targetWordCount || '5000-15000'} words)`);
    sections.push(`- POV: ${config.narrativePOV}, Tense: ${config.tense}`);
    sections.push(`- Tones: ${Array.isArray(config.tone) ? config.tone.join(', ') : config.tone}`);
    sections.push(`- Pacing: ${config.pacing}, Humor: ${config.humorLevel}`);
    sections.push(``);

    // 4. Character Guidance
    sections.push(`## CHARACTERS`);
    sections.push(`- Main Characters: ${config.mainCharacterCount || 1}`);
    sections.push(`- Supporting: ${config.supportingCharacterCount || 5}`);
    sections.push(`- Protagonist Type: ${config.protagonistArchetype}`);
    sections.push(`- Antagonist: ${config.antagonistType}`);
    sections.push(``);

    // 5. Plot & Structure
    sections.push(`## PLOT STRUCTURE`);
    sections.push(`- Template: ${config.structureTemplate}`);
    sections.push(`- Ending: ${config.endingStyle}`);
    sections.push(`- Twist Intensity: ${config.twistIntensity}`);
    sections.push(`- Themes: ${Array.isArray(config.themes) ? config.themes.join(', ') : config.themes}`);
    sections.push(``);

    // 6. Style & Voice
    sections.push(`## STYLE REQUIREMENTS`);
    sections.push(`- Prose Density: ${config.proseDensity}`);
    sections.push(`- Dialogue:Description ratio: ${config.dialogueToDescriptionRatio}:${100 - config.dialogueToDescriptionRatio}`);
    sections.push(`- Voice Flavors: ${Array.isArray(config.styleFlavorPresets) ? config.styleFlavorPresets.join(', ') : 'balanced'}`);
    if (config.avoidRepetition) {
        sections.push(`- Avoid repetitive phrases and constructions`);
    }
    sections.push(``);

    // 7. Comic-Specific (if applicable)
    if (config.mode.includes('comic')) {
        sections.push(`## COMIC PANEL BREAKDOWN (for mode: ${config.mode})`);
        sections.push(`- Panel Layout: ${config.panelLayoutStyle}`);
        sections.push(`- Target Panels: ${config.comicPanelCount || 24}`);
        sections.push(`- Visual Tone: ${config.visualTone}`);
        sections.push(`- Action Density: ${config.actionDensity}/10`);
        sections.push(`- Panel Shot Distribution:`);
        sections.push(`  * Establishing: ${config.establishingShotPercent || 25}%`);
        sections.push(`  * Medium: ${config.mediumShotPercent || 40}%`);
        sections.push(`  * Close-up: ${config.closeUpPercent || 25}%`);
        sections.push(`  * Reaction: ${config.reactionPanelPercent || 10}%`);
        sections.push(``);
    }

    // 8. Output Specification
    sections.push(`## OUTPUT SPECIFICATION`);
    sections.push(`Format: ${config.outputFormat || 'markdown'}`);
    if (config.mode === 'story-only') {
        sections.push(`- Generate complete prose story with chapters`);
        if (config.includeLogline) sections.push(`- Include: one-line logline at top`);
        if (config.includeSynopsis) sections.push(`- Include: 2-3 paragraph synopsis`);
        if (config.includeDetailedOutline) sections.push(`- Include: chapter-by-chapter outline`);
    }
    if (config.mode.includes('comic')) {
        sections.push(`- For comic panels: Generate as structured JSON array`);
        sections.push(`  Each panel: {index, description, dialogue, cameraDirection, mood}`);
    }
    sections.push(``);

    // 9. Safety & Constraints
    sections.push(`## SAFETY & CONSTRAINTS`);
    sections.push(`- NSFW Level: ${config.nsfwToggle || 'standard'}`);
    if (config.blockRealPeopleTrademarks) {
        sections.push(`- Do NOT use real people or trademarked characters`);
    }
    sections.push(`- Horror Intensity Cap: ${config.horrorIntensityMax || 7}/10`);
    sections.push(`- Violence Intensity: ${config.violenceIntensity || 5}/10`);
    sections.push(``);

    // 10. Final Instructions
    sections.push(`## EXECUTION`);
    sections.push(`1. Generate the ${config.mode === 'story-only' ? 'complete story' : config.mode === 'comic-only' ? 'comic panels' : 'story and comic panels'}`);
    sections.push(`2. Ensure linguistic coherence and thematic consistency`);
    sections.push(`3. Apply all safety filters and content restrictions`);
    sections.push(`4. Format output according to specification above`);
    sections.push(`5. Do NOT add meta-commentary or explanations — output only the story/panels`);
    sections.push(``);
    sections.push(`BEGIN GENERATION:`);

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
    logger.info(`[${correlationId}] Starting story generation`, {
        mode: config.mode,
        genre: config.primaryGenre,
        streaming,
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
            logger.debug(`[${correlationId}] Starting parallel Groq pre-processing tasks`);
            
            // Execute Groq tasks in parallel: validation, classification, outline
            const groqTasks = await Promise.all([
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
            ].filter(Boolean)); // Filter out errors

            // Parse Groq results
            if (groqTasks[0]?.content) {
                try {
                    groqContext.validation = JSON.parse(groqTasks[0].content);
                } catch { /* JSON parse error, skip */ }
            }

            if (groqTasks[1]?.content) {
                try {
                    const classified = JSON.parse(groqTasks[1].content);
                    groqContext.classification = classified.classification;
                    groqContext.narrativeApproach = classified.narrativeApproach;
                    groqContext.conventionalElements = classified.conventionalElements;
                    groqContext.unconventionalTwists = classified.unconventionalTwists;
                } catch { /* JSON parse error, skip */ }
            }

            if (groqTasks[2]?.content) {
                // Parse outline as text lines
                groqContext.outline = groqTasks[2].content
                    .split('\n')
                    .filter(line => line.match(/^\d+\./))
                    .slice(0, 15); // Limit to 15 beats
            }

            logger.debug(`[${correlationId}] Groq pre-processing complete`, {
                hasValidation: !!groqContext.validation,
                hasClassification: !!groqContext.classification,
                outlineBeats: groqContext.outline?.length || 0,
            });
        }

        // ─────────────────────────────────────────────────────────────
        // PHASE 2B: GEMINI CHAIRMAN — Primary Generation
        // ─────────────────────────────────────────────────────────────

        const chairmanPrompt = buildChairmanPrompt(userInput, config, groqContext);

        let generatedContent;

        if (streaming && onChunk) {
            // Streaming generation
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
            // Batch generation
            generatedContent = await geminiService.generateContent({
                prompt: chairmanPrompt,
                config,
                stream: false,
                correlationId,
            });
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
