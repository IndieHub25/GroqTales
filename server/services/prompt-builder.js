/**
 * Prompt Builder — Comicraft VedaScript Engine
 *
 * Converts the pipeline-generated context into a system prompt + user prompt
 * pair suitable for the Groq chat completions API.
 *
 * The context from pipeline-runner contains rich structured data about
 * characters, plot, style, world, etc. This module serializes that
 * structure into natural language instructions for the LLM.
 */

let logger;
try {
    logger = require('../utils/logger');
} catch {
    logger = { info: console.log, warn: console.warn, error: console.error, debug: () => { } };
}

// ---------------------------------------------------------------------------
// Section Builders — each converts a part of the context to prompt text
// ---------------------------------------------------------------------------

function buildCharacterSection(context) {
    if (!context.characters || context.characters.length === 0) return '';
    const lines = ['## Characters'];
    for (const char of context.characters) {
        const parts = [`- **${char.name || char.role}**`];
        if (char.role) parts.push(`(${char.role})`);
        if (char.archetype) parts.push(`— archetype: ${char.archetype}`);
        if (char.traits && char.traits.length) parts.push(`— traits: ${char.traits.join(', ')}`);
        if (char.motivation) parts.push(`— motivation: ${char.motivation}`);
        if (char.flaw) parts.push(`— flaw: ${char.flaw}`);
        if (char.speechStyle) parts.push(`— voice: ${char.speechStyle}`);
        lines.push(parts.join(' '));
    }
    if (context.relationships && context.relationships.length > 0) {
        lines.push('### Relationships');
        for (const rel of context.relationships) {
            lines.push(`- ${rel.from} ↔ ${rel.to}: ${rel.type} (intensity: ${rel.intensity || 'medium'})`);
        }
    }
    return lines.join('\n');
}

function buildPlotSection(context) {
    if (!context.plot) return '';
    const lines = ['## Plot Structure'];
    const p = context.plot;
    if (p.complexity) lines.push(`- Complexity: ${p.complexity}`);
    if (p.pacing) lines.push(`- Pacing: ${p.pacing}`);
    if (p.structureType) lines.push(`- Structure: ${p.structureType}`);
    if (p.conflictType) lines.push(`- Central conflict: ${p.conflictType}`);
    if (p.resolutionType) lines.push(`- Resolution: ${p.resolutionType}`);
    if (p.hookStrength) lines.push(`- Opening hook strength: ${p.hookStrength}`);
    if (p.endingType) lines.push(`- Ending style: ${p.endingType}`);
    if (p.cliffhangerFrequency) lines.push(`- Cliffhanger frequency: ${p.cliffhangerFrequency}`);
    if (p.flashbackUsage) lines.push(`- Flashback usage: ${p.flashbackUsage}`);
    if (p.foreshadowing) lines.push(`- Foreshadowing level: ${p.foreshadowing}`);
    if (context.twists && context.twists.length > 0) {
        lines.push(`- Plot twists: ${context.twists.length} planned`);
    }
    return lines.join('\n');
}

function buildStyleSection(context) {
    if (!context.style) return '';
    const lines = ['## Writing Style'];
    const s = context.style;
    if (s.prose) {
        lines.push(`- Prose style: ${s.prose.style} — ${s.prose.description || ''}`);
        if (s.prose.guidance) lines.push(`  Guidance: ${s.prose.guidance}`);
        if (s.prose.vocabularyLevel) lines.push(`  Vocabulary: ${s.prose.vocabularyLevel}`);
    }
    if (s.voice) lines.push(`- Narrative voice: ${typeof s.voice === 'object' ? s.voice.style || JSON.stringify(s.voice) : s.voice}`);
    if (s.dialogue) lines.push(`- Dialogue level: ${typeof s.dialogue === 'object' ? JSON.stringify(s.dialogue) : s.dialogue}`);
    if (s.humor) lines.push(`- Humor: level ${typeof s.humor === 'object' ? JSON.stringify(s.humor) : s.humor}`);
    if (s.darkness) lines.push(`- Darkness level: ${typeof s.darkness === 'object' ? JSON.stringify(s.darkness) : s.darkness}`);
    if (s.sentiment) lines.push(`- Sentiment tone: ${typeof s.sentiment === 'object' ? JSON.stringify(s.sentiment) : s.sentiment}`);
    return lines.join('\n');
}

function buildTechnicalSection(context) {
    if (!context.technical) return '';
    const lines = ['## Technical Parameters'];
    const t = context.technical;
    if (t.pointOfView) lines.push(`- Point of view: ${t.pointOfView}`);
    if (t.verbTense) lines.push(`- Verb tense: ${t.verbTense}`);
    if (t.readingLevel) lines.push(`- Reading level: ${t.readingLevel}`);
    if (t.targetWordCount) lines.push(`- Target word count: ${t.targetWordCount}`);
    if (t.narrativeTimeSpan) lines.push(`- Narrative time span: ${t.narrativeTimeSpan}`);
    if (t.descriptionIntensity) lines.push(`- Description intensity: ${t.descriptionIntensity}`);
    if (t.chapterStructure) lines.push(`- Chapter structure: ${t.chapterStructure}`);
    return lines.join('\n');
}

function buildWorldSection(context) {
    if (!context.world) return '';
    const lines = ['## World'];
    const w = context.world;
    if (w.settingType) lines.push(`- Setting type: ${w.settingType}`);
    if (w.settingDetail) lines.push(`- Setting detail: ${w.settingDetail}`);
    if (w.atmosphere) lines.push(`- Atmosphere: ${typeof w.atmosphere === 'object' ? w.atmosphere.mood || JSON.stringify(w.atmosphere) : w.atmosphere}`);
    if (w.technologyLevel) lines.push(`- Technology level: ${w.technologyLevel}`);
    if (w.magicSystem) lines.push(`- Magic system: ${typeof w.magicSystem === 'object' ? JSON.stringify(w.magicSystem) : w.magicSystem}`);
    if (w.politicsComplexity) lines.push(`- Political complexity: ${w.politicsComplexity}`);
    if (w.economicSystem) lines.push(`- Economic system: ${w.economicSystem}`);
    if (w.historyDepth) lines.push(`- World history depth: ${w.historyDepth}`);
    return lines.join('\n');
}

function buildThemeSection(context) {
    if (!context.theme) return '';
    const lines = ['## Themes'];
    const th = context.theme;
    if (th.depth) lines.push(`- Theme depth: ${th.depth}`);
    if (th.subtlety) lines.push(`- Theme subtlety: ${th.subtlety}`);
    if (th.symbolism) lines.push(`- Symbolism level: ${th.symbolism}`);
    if (th.moralComplexity) lines.push(`- Moral complexity: ${th.moralComplexity}`);
    if (th.metaphorDensity) lines.push(`- Metaphor density: ${th.metaphorDensity}`);
    return lines.join('\n');
}

function buildImmersionSection(context) {
    if (!context.immersion) return '';
    const lines = ['## Immersion'];
    const i = context.immersion;
    if (i.level) lines.push(`- Immersion level: ${i.level}`);
    if (i.sensoryDetail) lines.push(`- Sensory detail: ${i.sensoryDetail}`);
    if (i.emotionalDepth) lines.push(`- Emotional depth: ${i.emotionalDepth}`);
    if (i.tensionCurve) lines.push(`- Tension curve: ${i.tensionCurve}`);
    if (i.actionDescription) lines.push(`- Action description: ${i.actionDescription}`);
    return lines.join('\n');
}

function buildAudienceSection(context) {
    if (!context.audience) return '';
    const lines = ['## Audience'];
    const a = context.audience;
    if (a.ageRating) lines.push(`- Age rating: ${a.ageRating}`);
    if (a.culturalSensitivity) lines.push(`- Cultural sensitivity: ${a.culturalSensitivity}`);
    if (context.warnings && context.warnings.length > 0) {
        lines.push(`- Content warnings: ${context.warnings.join(', ')}`);
    }
    return lines.join('\n');
}

function buildEffectsSection(context) {
    if (!context.effects) return '';
    const lines = ['## Special Effects'];
    const e = context.effects;
    if (e.genreBlending) lines.push(`- Genre blending: ${typeof e.genreBlending === 'object' ? JSON.stringify(e.genreBlending) : e.genreBlending}`);
    if (e.narrativeDevice) lines.push(`- Special narrative device: ${e.narrativeDevice}`);
    if (e.easterEggs) lines.push(`- Easter eggs: ${typeof e.easterEggs === 'object' ? JSON.stringify(e.easterEggs) : e.easterEggs}`);
    return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main Prompt Builder
// ---------------------------------------------------------------------------

/**
 * Builds the system prompt and user prompt from the pipeline context.
 *
 * @param {object} context - The context object built by runAllPipelines
 * @param {object} userInput - The raw user input (prompt, title, genre, etc.)
 * @returns {{ systemPrompt: string, userPrompt: string, temperature: number, maxTokens: number }}
 */
function buildPrompt(context, userInput = {}) {
    // Build system prompt from context sections
    const sections = [
        buildCharacterSection(context),
        buildPlotSection(context),
        buildStyleSection(context),
        buildTechnicalSection(context),
        buildWorldSection(context),
        buildThemeSection(context),
        buildImmersionSection(context),
        buildAudienceSection(context),
        buildEffectsSection(context),
    ].filter(s => s.length > 0);

    const pipelineInstructions = sections.length > 0
        ? `\n\nFollow these story parameters precisely:\n\n${sections.join('\n\n')}`
        : '';

    const systemPrompt = [
        'You are the VedaScript Engine — Comicraft\'s flagship AI storytelling engine.',
        'You write immersive, publication-quality fiction.',
        'Follow every instruction below precisely. Write only the story — no preamble, no commentary, no meta-text.',
        'Start immediately with the narrative.',
        pipelineInstructions,
    ].join('\n');

    // Build user prompt from their direct input
    const userParts = [];
    if (userInput.title) userParts.push(`Title: "${userInput.title}"`);
    if (userInput.prompt) userParts.push(userInput.prompt);
    if (userInput.genre) userParts.push(`Genre: ${userInput.genre}`);
    if (userInput.setting) userParts.push(`Setting: ${userInput.setting}`);
    if (userInput.characters) userParts.push(`Characters: ${userInput.characters}`);
    if (userInput.themes) userParts.push(`Themes: ${userInput.themes}`);

    const userPrompt = userParts.length > 0
        ? userParts.join('\n')
        : 'Write a compelling short story.';

    // Extract generation params from context
    const temperature = context.generation?.temperature ?? 0.8;
    const targetWordCount = context.technical?.targetWordCount;

    // Map word count to token budget (rough: ~0.75 tokens per word)
    let maxTokens = 2000; // default
    if (targetWordCount) {
        maxTokens = Math.min(Math.ceil(targetWordCount * 1.5), 8000);
    }

    logger.info(`[PromptBuilder] System prompt: ${systemPrompt.length} chars, User prompt: ${userPrompt.length} chars, temp: ${temperature}, maxTokens: ${maxTokens}`);

    return { systemPrompt, userPrompt, temperature, maxTokens };
}

module.exports = { buildPrompt };
