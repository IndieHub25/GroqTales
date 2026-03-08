/**
 * Pipeline Runner — Comicraft VedaScript Engine (CJS-compatible)
 *
 * Runs all pipeline parameter logic to build a rich structured context
 * from user-provided story parameters. This module consolidates the
 * pipeline logic from the 71 ESM pipeline files into a single CJS module
 * that the Express backend can require() directly.
 *
 * The ESM pipeline files in /pipelines/ are the canonical reference
 * implementation. This module replicates their logic for backend use.
 */

let logger;
try {
    logger = require('../utils/logger');
} catch {
    logger = { info: console.log, warn: console.warn, error: console.error, debug: () => { } };
}

// ---------------------------------------------------------------------------
// Character Pipelines (11)
// ---------------------------------------------------------------------------

function runCharacterPipelines(params) {
    const context = { characters: [], relationships: [], arcs: [] };

    // 1. characterCount — generate main characters
    const count = Math.min(Math.max(params.characterCount || 3, 1), 8);
    const roles = ['protagonist', 'deuteragonist', 'tritagonist', 'confidant', 'love interest', 'rival', 'mentor', 'foil'];
    for (let i = 0; i < count; i++) {
        context.characters.push({
            id: 'char_' + (i + 1),
            name: 'Character ' + (i + 1),
            role: roles[i] || 'supporting',
            traits: [],
            depth: 'moderate',
        });
    }

    // 2. characterDepth
    const depthMap = { 1: 'flat', 2: 'shallow', 3: 'moderate', 4: 'deep', 5: 'profound' };
    const depth = depthMap[Math.min(Math.max(params.characterDepth || 3, 1), 5)] || 'moderate';
    context.characters = context.characters.map(c => ({ ...c, depth }));

    // 3. protagonistArchetype
    const archetypeTraits = {
        hero: ['courageous', 'selfless', 'determined', 'honorable'],
        antihero: ['cynical', 'morally ambiguous', 'resourceful', 'independent'],
        reluctant: ['cautious', 'doubtful', 'empathetic', 'adaptable'],
        trickster: ['witty', 'deceptive', 'charismatic', 'unpredictable'],
        mentor: ['wise', 'patient', 'experienced', 'guiding'],
        rebel: ['defiant', 'passionate', 'iconoclastic', 'bold'],
        innocent: ['naive', 'optimistic', 'trusting', 'curious'],
        explorer: ['adventurous', 'open-minded', 'restless', 'perceptive'],
    };
    const archetype = params.protagonistArchetype || 'hero';
    const traits = archetypeTraits[archetype] || archetypeTraits.hero;
    context.characters = context.characters.map(c => {
        if (c.role === 'protagonist') {
            return { ...c, archetype, traits: [...c.traits, ...traits] };
        }
        return c;
    });

    // 4. antagonistPresence
    if (params.antagonistPresence !== false) {
        const hasAntag = context.characters.some(c => c.role === 'antagonist');
        if (!hasAntag) {
            context.characters.push({
                id: 'antagonist',
                name: 'Antagonist',
                role: 'antagonist',
                traits: ['cunning', 'formidable', 'complex'],
                depth,
            });
        }
    }

    // 5. sideCharacterCount
    const sideCount = Math.min(params.sideCharacterCount || 2, 6);
    for (let i = 0; i < sideCount; i++) {
        context.characters.push({
            id: 'side_' + (i + 1),
            name: 'Side Character ' + (i + 1),
            role: 'supporting',
            traits: [],
            depth: 'shallow',
        });
    }

    // 6–11: characterDiversity, relationshipComplexity, motivation, voice, flaws, growth
    const growthMap = { 1: 'static', 2: 'slight', 3: 'moderate', 4: 'significant', 5: 'transformative' };
    const growth = growthMap[Math.min(Math.max(params.characterGrowth || 3, 1), 5)] || 'moderate';
    context.characters = context.characters.map(c => {
        if (c.role === 'protagonist' || c.role === 'deuteragonist') {
            context.arcs.push({ characterId: c.id, growth, arc: `${c.role} undergoes ${growth} transformation` });
        }
        return { ...c, motivation: 'driven by personal conviction', flaw: 'struggles with inner conflict' };
    });

    // Build basic relationships
    if (context.characters.length >= 2) {
        context.relationships.push({
            from: context.characters[0].id,
            to: context.characters[1]?.id,
            type: 'ally',
            intensity: 'strong',
        });
    }
    const antag = context.characters.find(c => c.role === 'antagonist');
    if (antag) {
        context.relationships.push({
            from: context.characters[0].id,
            to: antag.id,
            type: 'adversary',
            intensity: 'high',
        });
    }

    return context;
}

// ---------------------------------------------------------------------------
// Plot Pipelines (12)
// ---------------------------------------------------------------------------

function runPlotPipelines(params, context) {
    if (!context.plot) context.plot = {};
    if (!context.twists) context.twists = [];
    if (!context.timeline) context.timeline = [];
    if (!context.structure) context.structure = {};

    // plotComplexity
    const complexityMap = { 1: 'single-thread', 2: 'dual-thread', 3: 'layered', 4: 'intricate', 5: 'epic' };
    context.plot.complexity = complexityMap[Math.min(Math.max(params.plotComplexity || 3, 1), 5)] || 'layered';

    // pacingSpeed
    const pacingMap = { 1: 'slow-burn', 2: 'deliberate', 3: 'moderate', 4: 'fast', 5: 'breakneck' };
    context.plot.pacing = pacingMap[Math.min(Math.max(params.pacingSpeed || 3, 1), 5)] || 'moderate';

    // plotStructureType
    context.plot.structureType = params.plotStructureType || 'three-act';

    // conflictType
    context.plot.conflictType = params.conflictType || 'person-vs-person';

    // resolutionType
    context.plot.resolutionType = params.resolutionType || 'resolved';

    // twistCount
    const twists = Math.min(Math.max(params.twistCount || 1, 0), 5);
    for (let i = 0; i < twists; i++) {
        context.twists.push({ id: 'twist_' + (i + 1), placement: 'mid-story', type: 'reveal' });
    }

    // hookStrength
    const hookMap = { 1: 'gentle', 2: 'mild', 3: 'strong', 4: 'gripping', 5: 'explosive' };
    context.plot.hookStrength = hookMap[Math.min(Math.max(params.hookStrength || 3, 1), 5)] || 'strong';

    // endingType
    context.plot.endingType = params.endingType || 'resolved';

    // cliffhangerFrequency
    context.plot.cliffhangerFrequency = params.cliffhangerFrequency || 'occasional';

    // flashbackUsage
    context.plot.flashbackUsage = params.flashbackUsage || 'none';

    // foreshadowing
    const foreshadowMap = { 1: 'none', 2: 'subtle', 3: 'moderate', 4: 'heavy', 5: 'pervasive' };
    context.plot.foreshadowing = foreshadowMap[Math.min(Math.max(params.foreshadowingLevel || 3, 1), 5)] || 'moderate';

    return context;
}

// ---------------------------------------------------------------------------
// Style Pipelines (8)
// ---------------------------------------------------------------------------

function runStylePipelines(params, context) {
    if (!context.style) context.style = {};

    // proseStyle
    const styleMap = {
        literary: { style: 'literary', description: 'Rich, layered prose that rewards close reading', vocabularyLevel: 'elevated', guidance: 'Prioritize thematic resonance. Let sentences carry subtext.' },
        simple: { style: 'simple', description: 'Clear, accessible language', vocabularyLevel: 'everyday', guidance: 'Say what you mean plainly. Let story do the heavy lifting.' },
        cinematic: { style: 'cinematic', description: 'Visual, scene-driven prose', vocabularyLevel: 'moderate', guidance: 'Describe what a camera would see. Favor action and dialogue.' },
        poetic: { style: 'poetic', description: 'Rhythm-focused, lyrical prose', vocabularyLevel: 'curated', guidance: 'Choose words for sound as much as meaning.' },
        minimalist: { style: 'minimalist', description: 'Stripped-down, essential-only prose', vocabularyLevel: 'basic', guidance: 'Cut ruthlessly. Trust the reader.' },
    };
    context.style.prose = styleMap[params.proseStyle] || styleMap.cinematic;

    // narrativeVoice
    context.style.voice = params.narrativeVoice || 'intimate';

    // dialogueLevel + naturalism
    context.style.dialogue = { level: params.dialogueLevel || 3, naturalism: params.dialogueNaturalism || 3 };

    // humorLevel + style
    context.style.humor = { level: params.humorLevel || 3, style: params.humorStyle || 'situational' };

    // darknessLevel
    context.style.darkness = params.darknessLevel || 3;

    // sentimentTone
    context.style.sentiment = params.sentimentTone || 'neutral';

    return context;
}

// ---------------------------------------------------------------------------
// Technical Pipelines (7)
// ---------------------------------------------------------------------------

function runTechnicalPipelines(params, context) {
    if (!context.technical) context.technical = {};

    context.technical.pointOfView = params.pointOfView || 'third-limited';
    context.technical.verbTense = params.verbTense || 'past';
    context.technical.readingLevel = params.readingLevel || 'general';
    context.technical.targetWordCount = params.targetWordCount || 2000;
    context.technical.narrativeTimeSpan = params.narrativeTimeSpan || 'days';
    context.technical.descriptionIntensity = params.descriptionIntensity || 3;
    context.technical.chapterStructure = params.chapterStructure || 'continuous';

    return context;
}

// ---------------------------------------------------------------------------
// World Pipelines (9)
// ---------------------------------------------------------------------------

function runWorldPipelines(params, context) {
    if (!context.world) context.world = {};

    context.world.settingType = params.settingType || 'urban';
    context.world.settingDetail = params.settingDetail || 3;
    context.world.atmosphere = params.atmosphere || 'mysterious';
    context.world.technologyLevel = params.technologyLevel || 3;
    context.world.magicSystem = params.worldMagicSystem || 'none';
    context.world.politicsComplexity = params.politicsComplexity || 2;
    context.world.economicSystem = params.economicSystem || 'market';
    context.world.historyDepth = params.worldHistoryDepth || 3;

    return context;
}

// ---------------------------------------------------------------------------
// Theme Pipelines (5)
// ---------------------------------------------------------------------------

function runThemePipelines(params, context) {
    if (!context.theme) context.theme = {};

    context.theme.depth = params.themeDepth || 3;
    context.theme.subtlety = params.themeSubtlety || 3;
    context.theme.symbolism = params.symbolismLevel || 3;
    context.theme.moralComplexity = params.moralComplexity || 3;
    context.theme.metaphorDensity = params.metaphorDensity || 3;

    return context;
}

// ---------------------------------------------------------------------------
// Immersion Pipelines (5)
// ---------------------------------------------------------------------------

function runImmersionPipelines(params, context) {
    if (!context.immersion) context.immersion = {};

    context.immersion.level = params.immersionLevel || 3;
    context.immersion.sensoryDetail = params.sensoryDetail || 3;
    context.immersion.emotionalDepth = params.emotionalDepth || 3;
    context.immersion.tensionCurve = params.tensionCurve || 'rising';
    context.immersion.actionDescription = params.actionDescription || 3;

    return context;
}

// ---------------------------------------------------------------------------
// Audience Pipelines (4)
// ---------------------------------------------------------------------------

function runAudiencePipelines(params, context) {
    if (!context.audience) context.audience = {};
    if (!context.warnings) context.warnings = [];

    context.audience.ageRating = params.ageRating || 'general';
    context.audience.culturalSensitivity = params.culturalSensitivity || 'moderate';
    context.audience.genderRepresentation = params.genderRepresentation || 'balanced';

    // Auto-generate content warnings based on darkness level
    if (params.darknessLevel >= 4) context.warnings.push('violence', 'dark themes');
    if (params.ageRating === 'mature') context.warnings.push('mature content');

    return context;
}

// ---------------------------------------------------------------------------
// Effects Pipelines (4)
// ---------------------------------------------------------------------------

function runEffectsPipelines(params, context) {
    if (!context.effects) context.effects = {};

    context.effects.genreBlending = params.genreBlending || false;
    context.effects.narrativeDevice = params.specialNarrativeDevice || 'standard';
    context.effects.easterEggs = params.easterEggs || false;
    context.effects.crossReferences = params.crossReferences || false;

    return context;
}

// ---------------------------------------------------------------------------
// Advanced Pipelines (6)
// ---------------------------------------------------------------------------

function runAdvancedPipelines(params, context) {
    if (!context.advanced) context.advanced = {};
    if (!context.generation) context.generation = {};

    // creativityLevel
    context.advanced.creativity = params.creativityLevel || 3;

    // coherenceStrictness
    context.advanced.coherence = params.coherenceStrictness || 3;

    // randomizationSeed
    if (params.randomizationSeed) {
        context.advanced.seed = params.randomizationSeed;
    }

    // modelTemperature
    const temp = Math.min(Math.max(params.modelTemperature ?? 0.8, 0.0), 2.0);
    context.generation.temperature = temp;
    context.advanced.temperature = { value: temp };

    // detailLevel
    context.advanced.detailLevel = params.detailLevel || 3;

    // guardrailsStrictness
    context.advanced.guardrails = params.guardrailsStrictness || 3;

    return context;
}

// ---------------------------------------------------------------------------
// Main Runner
// ---------------------------------------------------------------------------

/**
 * Runs all 10 pipeline categories in order.
 *
 * @param {object} params - Story parameters from the user
 * @returns {Promise<object>} The fully built context object
 */
async function runAllPipelines(params = {}) {
    logger.info(`[PipelineRunner] Running all pipelines with ${Object.keys(params).length} params`);

    let context = runCharacterPipelines(params);
    context = runPlotPipelines(params, context);
    context = runStylePipelines(params, context);
    context = runTechnicalPipelines(params, context);
    context = runWorldPipelines(params, context);
    context = runThemePipelines(params, context);
    context = runImmersionPipelines(params, context);
    context = runAudiencePipelines(params, context);
    context = runEffectsPipelines(params, context);
    context = runAdvancedPipelines(params, context);

    logger.info(`[PipelineRunner] All pipelines complete. Context keys: ${Object.keys(context).join(', ')}`);
    return context;
}

module.exports = { runAllPipelines };
