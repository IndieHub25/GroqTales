/**
 * Parameter Schema Definition for ComicCraft AI Story Studio
 * Defines all 70+ parameters with metadata for UI rendering, validation, and help text
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10
 */

/**
 * Parameter types for UI rendering
 */
export type ParameterType = 'slider' | 'toggle' | 'select' | 'multiselect' | 'text' | 'textarea';

/**
 * Parameter metadata structure
 */
export interface ParameterMetadata {
  key: string;
  label: string;
  type: ParameterType;
  category: ParameterCategory;
  defaultValue: any;
  constraints?: {
    min?: number;
    max?: number;
    step?: number;
    options?: Array<{ value: string | number; label: string }>;
    maxLength?: number;
    pattern?: string;
  };
  helpText: string;
  required?: boolean;
}

/**
 * Parameter categories
 */
export type ParameterCategory =
  | 'character'
  | 'plot'
  | 'worldbuilding'
  | 'tone'
  | 'technical'
  | 'thematic'
  | 'sensory'
  | 'audience'
  | 'advanced'
  | 'special';

/**
 * Category metadata for UI organization
 */
export interface CategoryMetadata {
  key: ParameterCategory;
  label: string;
  description: string;
  icon?: string;
}

/**
 * Category definitions
 */
export const PARAMETER_CATEGORIES: CategoryMetadata[] = [
  {
    key: 'character',
    label: 'Character Development',
    description: 'Define character depth, archetypes, relationships, and growth',
  },
  {
    key: 'plot',
    label: 'Plot Structure',
    description: 'Control pacing, conflict, twists, and narrative structure',
  },
  {
    key: 'worldbuilding',
    label: 'Worldbuilding',
    description: 'Shape setting, time period, magic/tech levels, and atmosphere',
  },
  {
    key: 'tone',
    label: 'Tone & Style',
    description: 'Set narrative voice, prose style, dialogue, and emotional tone',
  },
  {
    key: 'technical',
    label: 'Technical Parameters',
    description: 'Configure word count, POV, tense, and reading level',
  },
  {
    key: 'thematic',
    label: 'Thematic Elements',
    description: 'Define themes, symbolism, and moral complexity',
  },
  {
    key: 'sensory',
    label: 'Sensory & Immersion',
    description: 'Control sensory detail, action, emotion, and tension',
  },
  {
    key: 'audience',
    label: 'Audience',
    description: 'Set age rating, content warnings, and representation',
  },
  {
    key: 'advanced',
    label: 'Advanced Options',
    description: 'Fine-tune creativity, coherence, and AI behavior',
  },
  {
    key: 'special',
    label: 'Special Effects',
    description: 'Add narrative devices, easter eggs, and genre blending',
  },
];

/**
 * Character Development Parameters (11 parameters)
 * Requirement 3.2
 */
const CHARACTER_PARAMETERS: ParameterMetadata[] = [
  {
    key: 'characterCount',
    label: 'Character Count',
    type: 'slider',
    category: 'character',
    defaultValue: 3,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Number of significant characters in this chapter (1-10)',
  },
  {
    key: 'characterDepth',
    label: 'Character Depth',
    type: 'slider',
    category: 'character',
    defaultValue: 5,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'How deeply characters are explored (1=surface, 10=profound)',
  },
  {
    key: 'protagonistArchetype',
    label: 'Protagonist Archetype',
    type: 'select',
    category: 'character',
    defaultValue: 'hero',
    constraints: {
      options: [
        { value: 'hero', label: 'Hero' },
        { value: 'antihero', label: 'Antihero' },
        { value: 'everyman', label: 'Everyman' },
        { value: 'mentor', label: 'Mentor' },
        { value: 'rebel', label: 'Rebel' },
        { value: 'explorer', label: 'Explorer' },
        { value: 'sage', label: 'Sage' },
        { value: 'innocent', label: 'Innocent' },
        { value: 'outlaw', label: 'Outlaw' },
        { value: 'magician', label: 'Magician' },
      ],
    },
    helpText: 'Primary archetype for the protagonist',
  },
  {
    key: 'antagonistPresence',
    label: 'Antagonist Presence',
    type: 'slider',
    category: 'character',
    defaultValue: 5,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: 'Prominence of antagonist in this chapter (0=absent, 10=central)',
  },
  {
    key: 'sideCharacterCount',
    label: 'Side Character Count',
    type: 'slider',
    category: 'character',
    defaultValue: 2,
    constraints: { min: 0, max: 8, step: 1 },
    helpText: 'Number of side/supporting characters (0-8)',
  },
  {
    key: 'characterDiversity',
    label: 'Character Diversity',
    type: 'slider',
    category: 'character',
    defaultValue: 5,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Diversity in backgrounds, perspectives, and identities (1=homogeneous, 10=highly diverse)',
  },
  {
    key: 'relationshipComplexity',
    label: 'Relationship Complexity',
    type: 'slider',
    category: 'character',
    defaultValue: 5,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Complexity of character relationships (1=simple, 10=intricate)',
  },
  {
    key: 'characterMotivationClarity',
    label: 'Motivation Clarity',
    type: 'slider',
    category: 'character',
    defaultValue: 7,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'How clear character motivations are (1=mysterious, 10=transparent)',
  },
  {
    key: 'characterVoiceDistinctness',
    label: 'Voice Distinctness',
    type: 'slider',
    category: 'character',
    defaultValue: 6,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'How distinct each character\'s voice/personality is (1=similar, 10=unique)',
  },
  {
    key: 'characterFlaws',
    label: 'Character Flaws',
    type: 'slider',
    category: 'character',
    defaultValue: 5,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: 'Prominence of character flaws and weaknesses (0=none, 10=deeply flawed)',
  },
  {
    key: 'characterGrowth',
    label: 'Character Growth',
    type: 'slider',
    category: 'character',
    defaultValue: 5,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: 'Amount of character development/growth in this chapter (0=static, 10=transformative)',
  },
];

/**
 * Plot Structure Parameters (9 parameters)
 * Requirement 3.3
 */
const PLOT_PARAMETERS: ParameterMetadata[] = [
  {
    key: 'plotComplexity',
    label: 'Plot Complexity',
    type: 'slider',
    category: 'plot',
    defaultValue: 5,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Complexity of plot structure (1=linear, 10=intricate)',
  },
  {
    key: 'pacingSpeed',
    label: 'Pacing Speed',
    type: 'slider',
    category: 'plot',
    defaultValue: 5,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Speed of narrative pacing (1=slow/contemplative, 10=fast/action-packed)',
  },
  {
    key: 'cliffhangerFrequency',
    label: 'Cliffhanger Frequency',
    type: 'slider',
    category: 'plot',
    defaultValue: 3,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: 'How often cliffhangers appear (0=none, 10=constant)',
  },
  {
    key: 'plotStructureType',
    label: 'Plot Structure',
    type: 'select',
    category: 'plot',
    defaultValue: 'three-act',
    constraints: {
      options: [
        { value: 'three-act', label: 'Three-Act Structure' },
        { value: 'heros-journey', label: "Hero's Journey" },
        { value: 'in-medias-res', label: 'In Medias Res' },
        { value: 'circular', label: 'Circular' },
        { value: 'parallel', label: 'Parallel Narratives' },
        { value: 'nonlinear', label: 'Nonlinear' },
        { value: 'episodic', label: 'Episodic' },
      ],
    },
    helpText: 'Overall narrative structure approach',
  },
  {
    key: 'twistCount',
    label: 'Plot Twists',
    type: 'slider',
    category: 'plot',
    defaultValue: 1,
    constraints: { min: 0, max: 5, step: 1 },
    helpText: 'Number of major plot twists in this chapter (0-5)',
  },
  {
    key: 'conflictType',
    label: 'Conflict Types',
    type: 'multiselect',
    category: 'plot',
    defaultValue: ['person-vs-person'],
    constraints: {
      options: [
        { value: 'person-vs-person', label: 'Person vs Person' },
        { value: 'person-vs-self', label: 'Person vs Self' },
        { value: 'person-vs-society', label: 'Person vs Society' },
        { value: 'person-vs-nature', label: 'Person vs Nature' },
        { value: 'person-vs-technology', label: 'Person vs Technology' },
        { value: 'person-vs-supernatural', label: 'Person vs Supernatural' },
        { value: 'person-vs-fate', label: 'Person vs Fate' },
      ],
    },
    helpText: 'Types of conflict present in this chapter',
  },
  {
    key: 'resolutionType',
    label: 'Resolution Type',
    type: 'select',
    category: 'plot',
    defaultValue: 'partial',
    constraints: {
      options: [
        { value: 'complete', label: 'Complete Resolution' },
        { value: 'partial', label: 'Partial Resolution' },
        { value: 'cliffhanger', label: 'Cliffhanger' },
        { value: 'open', label: 'Open-Ended' },
        { value: 'twist', label: 'Twist Ending' },
      ],
    },
    helpText: 'How conflicts are resolved at chapter end',
  },
  {
    key: 'flashbackUsage',
    label: 'Flashback Usage',
    type: 'slider',
    category: 'plot',
    defaultValue: 2,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: 'Frequency of flashbacks/backstory (0=none, 10=extensive)',
  },
  {
    key: 'foreshadowingLevel',
    label: 'Foreshadowing',
    type: 'slider',
    category: 'plot',
    defaultValue: 5,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: 'Amount of foreshadowing for future events (0=none, 10=heavy)',
  },
];

/**
 * Worldbuilding Parameters (9 parameters)
 * Requirement 3.4
 */
const WORLDBUILDING_PARAMETERS: ParameterMetadata[] = [
  {
    key: 'settingDetail',
    label: 'Setting Detail',
    type: 'slider',
    category: 'worldbuilding',
    defaultValue: 5,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Level of setting description (1=minimal, 10=richly detailed)',
  },
  {
    key: 'settingType',
    label: 'Setting Type',
    type: 'select',
    category: 'worldbuilding',
    defaultValue: 'contemporary',
    constraints: {
      options: [
        { value: 'contemporary', label: 'Contemporary' },
        { value: 'historical', label: 'Historical' },
        { value: 'future', label: 'Future/Sci-Fi' },
        { value: 'fantasy', label: 'Fantasy World' },
        { value: 'alternate-history', label: 'Alternate History' },
        { value: 'post-apocalyptic', label: 'Post-Apocalyptic' },
        { value: 'urban-fantasy', label: 'Urban Fantasy' },
        { value: 'space', label: 'Space/Cosmic' },
      ],
    },
    helpText: 'Primary setting type for the story',
  },
  {
    key: 'worldMagicSystem',
    label: 'Magic System',
    type: 'slider',
    category: 'worldbuilding',
    defaultValue: 0,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: 'Presence and complexity of magic (0=none, 10=central/complex)',
  },
  {
    key: 'technologyLevel',
    label: 'Technology Level',
    type: 'slider',
    category: 'worldbuilding',
    defaultValue: 5,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: 'Technology advancement (0=primitive, 5=modern, 10=far future)',
  },
  {
    key: 'worldHistoryDepth',
    label: 'World History Depth',
    type: 'slider',
    category: 'worldbuilding',
    defaultValue: 3,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: 'Depth of world history/lore (0=none, 10=extensive)',
  },
  {
    key: 'politicsComplexity',
    label: 'Political Complexity',
    type: 'slider',
    category: 'worldbuilding',
    defaultValue: 3,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: 'Complexity of political systems/intrigue (0=none, 10=intricate)',
  },
  {
    key: 'economicSystem',
    label: 'Economic System',
    type: 'slider',
    category: 'worldbuilding',
    defaultValue: 2,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: 'Prominence of economic systems/trade (0=not mentioned, 10=central)',
  },
  {
    key: 'culturalDiversity',
    label: 'Cultural Diversity',
    type: 'slider',
    category: 'worldbuilding',
    defaultValue: 5,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Diversity of cultures in the world (1=monoculture, 10=highly diverse)',
  },
  {
    key: 'atmosphere',
    label: 'Atmosphere',
    type: 'select',
    category: 'worldbuilding',
    defaultValue: 'neutral',
    constraints: {
      options: [
        { value: 'oppressive', label: 'Oppressive' },
        { value: 'tense', label: 'Tense' },
        { value: 'neutral', label: 'Neutral' },
        { value: 'hopeful', label: 'Hopeful' },
        { value: 'whimsical', label: 'Whimsical' },
        { value: 'mysterious', label: 'Mysterious' },
        { value: 'foreboding', label: 'Foreboding' },
      ],
    },
    helpText: 'Overall atmospheric quality of the setting',
  },
];

/**
 * Tone & Style Parameters (8 parameters)
 * Requirement 3.5
 */
const TONE_PARAMETERS: ParameterMetadata[] = [
  {
    key: 'narrativeVoice',
    label: 'Narrative Voice',
    type: 'select',
    category: 'tone',
    defaultValue: 'third-limited',
    constraints: {
      options: [
        { value: 'first-person', label: 'First Person' },
        { value: 'second-person', label: 'Second Person' },
        { value: 'third-limited', label: 'Third Person Limited' },
        { value: 'third-omniscient', label: 'Third Person Omniscient' },
        { value: 'multiple-pov', label: 'Multiple POV' },
      ],
    },
    helpText: 'Point of view and narrative perspective',
  },
  {
    key: 'proseStyle',
    label: 'Prose Style',
    type: 'select',
    category: 'tone',
    defaultValue: 'balanced',
    constraints: {
      options: [
        { value: 'minimalist', label: 'Minimalist' },
        { value: 'balanced', label: 'Balanced' },
        { value: 'literary', label: 'Literary' },
        { value: 'poetic', label: 'Poetic' },
        { value: 'pulp', label: 'Pulp/Action' },
        { value: 'noir', label: 'Noir' },
        { value: 'lyrical', label: 'Lyrical' },
      ],
    },
    helpText: 'Overall writing style and prose approach',
  },
  {
    key: 'dialogueLevel',
    label: 'Dialogue Level',
    type: 'slider',
    category: 'tone',
    defaultValue: 5,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Amount of dialogue vs narration (1=minimal, 10=dialogue-heavy)',
  },
  {
    key: 'dialogueNaturalism',
    label: 'Dialogue Naturalism',
    type: 'slider',
    category: 'tone',
    defaultValue: 7,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'How natural/realistic dialogue sounds (1=stylized, 10=realistic)',
  },
  {
    key: 'humorLevel',
    label: 'Humor Level',
    type: 'slider',
    category: 'tone',
    defaultValue: 3,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: 'Amount of humor in the narrative (0=none, 10=comedy)',
  },
  {
    key: 'humorStyle',
    label: 'Humor Style',
    type: 'multiselect',
    category: 'tone',
    defaultValue: [],
    constraints: {
      options: [
        { value: 'witty', label: 'Witty/Clever' },
        { value: 'slapstick', label: 'Slapstick' },
        { value: 'dark', label: 'Dark Humor' },
        { value: 'satirical', label: 'Satirical' },
        { value: 'absurd', label: 'Absurdist' },
        { value: 'dry', label: 'Dry/Deadpan' },
        { value: 'wordplay', label: 'Wordplay/Puns' },
      ],
    },
    helpText: 'Types of humor to include (if any)',
  },
  {
    key: 'darknessLevel',
    label: 'Darkness Level',
    type: 'slider',
    category: 'tone',
    defaultValue: 3,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: 'How dark/grim the tone is (0=light, 10=grimdark)',
  },
  {
    key: 'sentimentTone',
    label: 'Sentiment Tone',
    type: 'select',
    category: 'tone',
    defaultValue: 'balanced',
    constraints: {
      options: [
        { value: 'optimistic', label: 'Optimistic' },
        { value: 'hopeful', label: 'Hopeful' },
        { value: 'balanced', label: 'Balanced' },
        { value: 'melancholic', label: 'Melancholic' },
        { value: 'cynical', label: 'Cynical' },
        { value: 'nihilistic', label: 'Nihilistic' },
      ],
    },
    helpText: 'Overall emotional sentiment of the narrative',
  },
];

/**
 * Technical Parameters (7 parameters)
 * Requirement 3.10
 */
const TECHNICAL_PARAMETERS: ParameterMetadata[] = [
  {
    key: 'targetWordCount',
    label: 'Target Word Count',
    type: 'slider',
    category: 'technical',
    defaultValue: 1500,
    constraints: { min: 500, max: 5000, step: 100 },
    helpText: 'Approximate word count for this chapter (500-5000)',
  },
  {
    key: 'readingLevel',
    label: 'Reading Level',
    type: 'select',
    category: 'technical',
    defaultValue: 'adult',
    constraints: {
      options: [
        { value: 'elementary', label: 'Elementary (Ages 6-10)' },
        { value: 'middle-grade', label: 'Middle Grade (Ages 8-12)' },
        { value: 'young-adult', label: 'Young Adult (Ages 12-18)' },
        { value: 'adult', label: 'Adult' },
        { value: 'literary', label: 'Literary/Advanced' },
      ],
    },
    helpText: 'Target reading comprehension level',
  },
  {
    key: 'pointOfView',
    label: 'Point of View',
    type: 'select',
    category: 'technical',
    defaultValue: 'third-limited',
    constraints: {
      options: [
        { value: 'first-person', label: 'First Person' },
        { value: 'second-person', label: 'Second Person' },
        { value: 'third-limited', label: 'Third Person Limited' },
        { value: 'third-omniscient', label: 'Third Person Omniscient' },
        { value: 'multiple', label: 'Multiple POV' },
      ],
    },
    helpText: 'Narrative point of view',
  },
  {
    key: 'verbTense',
    label: 'Verb Tense',
    type: 'select',
    category: 'technical',
    defaultValue: 'past',
    constraints: {
      options: [
        { value: 'past', label: 'Past Tense' },
        { value: 'present', label: 'Present Tense' },
        { value: 'mixed', label: 'Mixed Tense' },
      ],
    },
    helpText: 'Primary verb tense for narration',
  },
  {
    key: 'chapterStructure',
    label: 'Chapter Structure',
    type: 'select',
    category: 'technical',
    defaultValue: 'standard',
    constraints: {
      options: [
        { value: 'standard', label: 'Standard Narrative' },
        { value: 'scenes', label: 'Multiple Scenes' },
        { value: 'vignettes', label: 'Vignettes' },
        { value: 'epistolary', label: 'Epistolary (Letters/Docs)' },
        { value: 'stream-of-consciousness', label: 'Stream of Consciousness' },
      ],
    },
    helpText: 'Internal structure of the chapter',
  },
  {
    key: 'descriptionIntensity',
    label: 'Description Intensity',
    type: 'slider',
    category: 'technical',
    defaultValue: 5,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Amount of descriptive detail (1=sparse, 10=lush)',
  },
  {
    key: 'narrativeTimeSpan',
    label: 'Narrative Time Span',
    type: 'select',
    category: 'technical',
    defaultValue: 'hours',
    constraints: {
      options: [
        { value: 'minutes', label: 'Minutes' },
        { value: 'hours', label: 'Hours' },
        { value: 'days', label: 'Days' },
        { value: 'weeks', label: 'Weeks' },
        { value: 'months', label: 'Months' },
        { value: 'years', label: 'Years' },
        { value: 'nonlinear', label: 'Nonlinear' },
      ],
    },
    helpText: 'Time period covered in this chapter',
  },
];

/**
 * Thematic Elements Parameters (5 parameters)
 * Requirement 3.6
 */
const THEMATIC_PARAMETERS: ParameterMetadata[] = [
  {
    key: 'themeDepth',
    label: 'Theme Depth',
    type: 'slider',
    category: 'thematic',
    defaultValue: 5,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'How deeply themes are explored (1=surface, 10=profound)',
  },
  {
    key: 'themeSubtlety',
    label: 'Theme Subtlety',
    type: 'slider',
    category: 'thematic',
    defaultValue: 6,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'How subtly themes are presented (1=explicit, 10=implicit)',
  },
  {
    key: 'symbolismLevel',
    label: 'Symbolism Level',
    type: 'slider',
    category: 'thematic',
    defaultValue: 4,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: 'Amount of symbolic imagery (0=none, 10=heavy)',
  },
  {
    key: 'metaphorDensity',
    label: 'Metaphor Density',
    type: 'slider',
    category: 'thematic',
    defaultValue: 4,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: 'Frequency of metaphors and figurative language (0=literal, 10=dense)',
  },
  {
    key: 'moralComplexity',
    label: 'Moral Complexity',
    type: 'slider',
    category: 'thematic',
    defaultValue: 5,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Moral ambiguity and complexity (1=clear good/evil, 10=morally gray)',
  },
];

/**
 * Sensory & Immersion Parameters (5 parameters)
 * Requirements: 3.1-3.10 (general parameter support)
 */
const SENSORY_PARAMETERS: ParameterMetadata[] = [
  {
    key: 'sensoryDetail',
    label: 'Sensory Detail',
    type: 'slider',
    category: 'sensory',
    defaultValue: 5,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Amount of sensory description (sight, sound, smell, touch, taste) (1=minimal, 10=rich)',
  },
  {
    key: 'actionDescription',
    label: 'Action Description',
    type: 'slider',
    category: 'sensory',
    defaultValue: 5,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Detail level for action sequences (1=brief, 10=blow-by-blow)',
  },
  {
    key: 'emotionalDepth',
    label: 'Emotional Depth',
    type: 'slider',
    category: 'sensory',
    defaultValue: 6,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Depth of emotional exploration (1=surface, 10=intense)',
  },
  {
    key: 'tensionCurve',
    label: 'Tension Curve',
    type: 'select',
    category: 'sensory',
    defaultValue: 'rising',
    constraints: {
      options: [
        { value: 'flat', label: 'Flat/Steady' },
        { value: 'rising', label: 'Rising' },
        { value: 'falling', label: 'Falling' },
        { value: 'peaks-valleys', label: 'Peaks and Valleys' },
        { value: 'climactic', label: 'Climactic Build' },
      ],
    },
    helpText: 'How tension develops throughout the chapter',
  },
  {
    key: 'immersionLevel',
    label: 'Immersion Level',
    type: 'slider',
    category: 'sensory',
    defaultValue: 7,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Overall immersiveness of the narrative (1=detached, 10=deeply immersive)',
  },
];

/**
 * Audience Parameters (4 parameters)
 * Requirement 3.7 (Content Controls)
 */
const AUDIENCE_PARAMETERS: ParameterMetadata[] = [
  {
    key: 'ageRating',
    label: 'Age Rating',
    type: 'select',
    category: 'audience',
    defaultValue: 'teen',
    constraints: {
      options: [
        { value: 'children', label: 'Children (G)' },
        { value: 'pre-teen', label: 'Pre-Teen (PG)' },
        { value: 'teen', label: 'Teen (PG-13)' },
        { value: 'mature', label: 'Mature (R)' },
        { value: 'adult', label: 'Adult (18+)' },
      ],
    },
    helpText: 'Target age rating for content appropriateness',
  },
  {
    key: 'contentWarnings',
    label: 'Content Warnings',
    type: 'multiselect',
    category: 'audience',
    defaultValue: [],
    constraints: {
      options: [
        { value: 'violence', label: 'Violence' },
        { value: 'gore', label: 'Gore' },
        { value: 'sexual-content', label: 'Sexual Content' },
        { value: 'strong-language', label: 'Strong Language' },
        { value: 'substance-use', label: 'Substance Use' },
        { value: 'mental-health', label: 'Mental Health Themes' },
        { value: 'death', label: 'Death/Grief' },
        { value: 'trauma', label: 'Trauma' },
        { value: 'discrimination', label: 'Discrimination' },
      ],
    },
    helpText: 'Content warnings to apply (affects content generation)',
  },
  {
    key: 'genderRepresentation',
    label: 'Gender Representation',
    type: 'select',
    category: 'audience',
    defaultValue: 'balanced',
    constraints: {
      options: [
        { value: 'male-focused', label: 'Male-Focused' },
        { value: 'female-focused', label: 'Female-Focused' },
        { value: 'balanced', label: 'Balanced' },
        { value: 'non-binary-inclusive', label: 'Non-Binary Inclusive' },
        { value: 'diverse', label: 'Diverse/Fluid' },
      ],
    },
    helpText: 'Gender representation approach',
  },
  {
    key: 'culturalSensitivity',
    label: 'Cultural Sensitivity',
    type: 'slider',
    category: 'audience',
    defaultValue: 8,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Level of cultural sensitivity and awareness (1=low, 10=high)',
  },
];

/**
 * Advanced Options Parameters (6 parameters)
 * Requirement 3.10
 */
const ADVANCED_PARAMETERS: ParameterMetadata[] = [
  {
    key: 'creativityLevel',
    label: 'Creativity Level',
    type: 'slider',
    category: 'advanced',
    defaultValue: 7,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'AI creativity/randomness (1=predictable, 10=highly creative)',
  },
  {
    key: 'coherenceStrictness',
    label: 'Coherence Strictness',
    type: 'slider',
    category: 'advanced',
    defaultValue: 8,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'How strictly to maintain narrative coherence (1=loose, 10=strict)',
  },
  {
    key: 'randomizationSeed',
    label: 'Randomization Seed',
    type: 'text',
    category: 'advanced',
    defaultValue: '',
    constraints: { maxLength: 50 },
    helpText: 'Optional seed for reproducible generation (leave empty for random)',
  },
  {
    key: 'modelTemperature',
    label: 'Model Temperature',
    type: 'slider',
    category: 'advanced',
    defaultValue: 0.7,
    constraints: { min: 0, max: 1, step: 0.1 },
    helpText: 'AI model temperature (0=deterministic, 1=random)',
  },
  {
    key: 'detailLevel',
    label: 'Detail Level',
    type: 'slider',
    category: 'advanced',
    defaultValue: 5,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Overall level of detail in generation (1=sparse, 10=exhaustive)',
  },
  {
    key: 'guardrailsStrictness',
    label: 'Content Guardrails',
    type: 'slider',
    category: 'advanced',
    defaultValue: 7,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Strictness of content safety guardrails (1=permissive, 10=strict)',
  },
];

/**
 * Special Effects Parameters (4 parameters)
 * Requirement 3.8
 */
const SPECIAL_PARAMETERS: ParameterMetadata[] = [
  {
    key: 'specialNarrativeDevice',
    label: 'Narrative Devices',
    type: 'multiselect',
    category: 'special',
    defaultValue: [],
    constraints: {
      options: [
        { value: 'unreliable-narrator', label: 'Unreliable Narrator' },
        { value: 'frame-story', label: 'Frame Story' },
        { value: 'breaking-fourth-wall', label: 'Breaking Fourth Wall' },
        { value: 'meta-fiction', label: 'Meta-Fiction' },
        { value: 'multiple-timelines', label: 'Multiple Timelines' },
        { value: 'parallel-narratives', label: 'Parallel Narratives' },
        { value: 'nested-stories', label: 'Nested Stories' },
      ],
    },
    helpText: 'Special narrative techniques to employ',
  },
  {
    key: 'easterEggs',
    label: 'Easter Eggs',
    type: 'toggle',
    category: 'special',
    defaultValue: false,
    helpText: 'Include subtle references or hidden details',
  },
  {
    key: 'crossReferences',
    label: 'Cross-References',
    type: 'toggle',
    category: 'special',
    defaultValue: true,
    helpText: 'Reference previous panels and maintain continuity',
  },
  {
    key: 'genreBlending',
    label: 'Genre Blending',
    type: 'slider',
    category: 'special',
    defaultValue: 3,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: 'How much to blend/mix genre conventions (0=pure genre, 10=heavy blending)',
  },
];

/**
 * Panel-Specific Parameters (3 parameters)
 * These control chapter-level behavior
 */
const PANEL_SPECIFIC_PARAMETERS: ParameterMetadata[] = [
  {
    key: 'chapterRole',
    label: 'Chapter Role',
    type: 'select',
    category: 'plot',
    defaultValue: 'development',
    constraints: {
      options: [
        { value: 'setup', label: 'Setup/Introduction' },
        { value: 'development', label: 'Development' },
        { value: 'climax', label: 'Climax' },
        { value: 'resolution', label: 'Resolution' },
      ],
    },
    helpText: 'Role of this chapter in the overall story arc',
  },
  {
    key: 'hookStrength',
    label: 'Hook Strength',
    type: 'slider',
    category: 'plot',
    defaultValue: 7,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Strength of opening hook (1=gentle, 10=gripping)',
  },
  {
    key: 'endingType',
    label: 'Ending Type',
    type: 'select',
    category: 'plot',
    defaultValue: 'emotional-beat',
    constraints: {
      options: [
        { value: 'cliffhanger', label: 'Cliffhanger' },
        { value: 'resolution', label: 'Resolution' },
        { value: 'emotional-beat', label: 'Emotional Beat' },
        { value: 'open', label: 'Open-Ended' },
      ],
    },
    helpText: 'How this chapter ends',
  },
];

/**
 * Complete parameter schema (70+ parameters)
 * Combines all parameter categories
 */
export const ALL_PARAMETERS: ParameterMetadata[] = [
  ...CHARACTER_PARAMETERS,
  ...PLOT_PARAMETERS,
  ...WORLDBUILDING_PARAMETERS,
  ...TONE_PARAMETERS,
  ...TECHNICAL_PARAMETERS,
  ...THEMATIC_PARAMETERS,
  ...SENSORY_PARAMETERS,
  ...AUDIENCE_PARAMETERS,
  ...ADVANCED_PARAMETERS,
  ...SPECIAL_PARAMETERS,
  ...PANEL_SPECIFIC_PARAMETERS,
];

/**
 * Parameter lookup by key
 */
export const PARAMETER_MAP = new Map<string, ParameterMetadata>(
  ALL_PARAMETERS.map((param) => [param.key, param])
);

/**
 * Get parameters by category
 */
export function getParametersByCategory(category: ParameterCategory): ParameterMetadata[] {
  return ALL_PARAMETERS.filter((param) => param.category === category);
}

/**
 * Get parameter metadata by key
 */
export function getParameter(key: string): ParameterMetadata | undefined {
  return PARAMETER_MAP.get(key);
}

/**
 * Validate parameter value against constraints
 */
export function validateParameterValue(
  key: string,
  value: any
): { valid: boolean; error?: string } {
  const param = getParameter(key);
  if (!param) {
    return { valid: false, error: `Unknown parameter: ${key}` };
  }

  // Type-specific validation
  switch (param.type) {
    case 'slider':
      if (!Number.isFinite(value)) {
        return { valid: false, error: `${param.label} must be a finite number` };
      }
      if (param.constraints?.min !== undefined && value < param.constraints.min) {
        return { valid: false, error: `${param.label} must be at least ${param.constraints.min}` };
      }
      if (param.constraints?.max !== undefined && value > param.constraints.max) {
        return { valid: false, error: `${param.label} must be at most ${param.constraints.max}` };
      }
      break;

    case 'select':
      if (param.constraints?.options) {
        const validValues = param.constraints.options.map((opt) => opt.value);
        if (!validValues.includes(value)) {
          return { valid: false, error: `${param.label} must be one of: ${validValues.join(', ')}` };
        }
      }
      break;

    case 'multiselect':
      if (!Array.isArray(value)) {
        return { valid: false, error: `${param.label} must be an array` };
      }
      if (param.constraints?.options) {
        const validValues = param.constraints.options.map((opt) => opt.value);
        const invalidValues = value.filter((v) => !validValues.includes(v));
        if (invalidValues.length > 0) {
          return {
            valid: false,
            error: `${param.label} contains invalid values: ${invalidValues.join(', ')}`,
          };
        }
      }
      break;

    case 'text':
      if (typeof value !== 'string') {
        return { valid: false, error: `${param.label} must be a string` };
      }
      if (param.constraints?.maxLength && value.length > param.constraints.maxLength) {
        return {
          valid: false,
          error: `${param.label} must be at most ${param.constraints.maxLength} characters`,
        };
      }
      if (param.constraints?.pattern) {
        const regex = new RegExp(param.constraints.pattern);
        if (!regex.test(value)) {
          return { valid: false, error: `${param.label} format is invalid` };
        }
      }
      break;

    case 'textarea':
      if (typeof value !== 'string') {
        return { valid: false, error: `${param.label} must be a string` };
      }
      if (param.constraints?.maxLength && value.length > param.constraints.maxLength) {
        return {
          valid: false,
          error: `${param.label} must be at most ${param.constraints.maxLength} characters`,
        };
      }
      break;

    case 'toggle':
      if (typeof value !== 'boolean') {
        return { valid: false, error: `${param.label} must be true or false` };
      }
      break;
  }

  return { valid: true };
}

/**
 * Get default values for all parameters
 */
export function getDefaultParameters(): Record<string, any> {
  const defaults: Record<string, any> = {};
  ALL_PARAMETERS.forEach((param) => {
    const defaultValue = param.defaultValue;
    // Deep clone non-primitive values (objects and arrays) to prevent mutation
    if (typeof defaultValue === 'object' && defaultValue !== null) {
      defaults[param.key] = JSON.parse(JSON.stringify(defaultValue));
    } else {
      // Primitive values (numbers, strings, booleans, null, undefined) are returned by value
      defaults[param.key] = defaultValue;
    }
  });
  return defaults;
}

/**
 * Compatibility aliases used by parameter-panel.tsx
 */
export type AIStoryParameter = ParameterMetadata & {
  id: string;
  name: string;
  description: string;
  value?: any;
};

/**
 * AI_STORY_PARAMETERS — enriched list with id/name/description aliases
 */
export const AI_STORY_PARAMETERS: AIStoryParameter[] = ALL_PARAMETERS.map((p) => ({
  ...p,
  id: p.key,
  name: p.label,
  description: p.helpText,
}));

/**
 * Preset definitions for quick parameter configuration
 */
export interface ParameterPreset {
  name: string;
  icon: string;
  description: string;
  enabledParameterIds: string[];
}

export const PARAMETER_PRESETS: Record<string, ParameterPreset> = {
  minimal: {
    name: 'Minimal',
    icon: '✨',
    description: 'Just the essentials — genre, tone, and length',
    enabledParameterIds: [
      'narrativeVoice', 'proseStyle', 'targetWordCount', 'pointOfView', 'pacingSpeed',
    ],
  },
  standard: {
    name: 'Standard',
    icon: '📖',
    description: 'Balanced set of character, plot, and tone controls',
    enabledParameterIds: [
      'characterCount', 'characterDepth', 'protagonistArchetype',
      'plotComplexity', 'pacingSpeed', 'plotStructureType', 'conflictType',
      'narrativeVoice', 'proseStyle', 'dialogueLevel',
      'targetWordCount', 'pointOfView',
      'themeDepth', 'emotionalDepth',
    ],
  },
  advanced: {
    name: 'Advanced',
    icon: '⚙️',
    description: 'Full control over all major story dimensions',
    enabledParameterIds: [
      'characterCount', 'characterDepth', 'protagonistArchetype', 'antagonistPresence',
      'sideCharacterCount', 'characterDiversity', 'relationshipComplexity',
      'characterMotivationClarity', 'characterVoiceDistinctness', 'characterFlaws', 'characterGrowth',
      'plotComplexity', 'pacingSpeed', 'cliffhangerFrequency', 'plotStructureType',
      'twistCount', 'conflictType', 'resolutionType', 'flashbackUsage', 'foreshadowingLevel',
      'settingDetail', 'settingType', 'worldMagicSystem', 'technologyLevel',
      'narrativeVoice', 'proseStyle', 'dialogueLevel', 'dialogueNaturalism',
      'humorLevel', 'darknessLevel', 'sentimentTone',
      'targetWordCount', 'readingLevel', 'pointOfView', 'verbTense',
      'themeDepth', 'symbolismLevel', 'moralComplexity',
      'sensoryDetail', 'actionDescription', 'emotionalDepth', 'tensionCurve',
      'creativityLevel', 'coherenceStrictness', 'modelTemperature',
    ],
  },
  worldbuilder: {
    name: 'Worldbuilder',
    icon: '🌍',
    description: 'Deep worldbuilding with rich setting and lore',
    enabledParameterIds: [
      'settingDetail', 'settingType', 'worldMagicSystem', 'technologyLevel',
      'worldHistoryDepth', 'politicsComplexity', 'economicSystem', 'culturalDiversity', 'atmosphere',
      'characterDiversity', 'sensoryDetail', 'immersionLevel',
      'plotComplexity', 'narrativeVoice', 'targetWordCount',
    ],
  },
};

/**
 * Search parameters by name, description, or category
 */
export function searchParameters(query: string): AIStoryParameter[] {
  const q = query.toLowerCase().trim();
  if (!q) return AI_STORY_PARAMETERS;
  return AI_STORY_PARAMETERS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
  );
}

/**
 * Apply a preset — returns the set of parameter IDs to enable
 */
export function applyPreset(presetKey: string): string[] {
  const preset = PARAMETER_PRESETS[presetKey];
  return preset ? preset.enabledParameterIds : [];
}

