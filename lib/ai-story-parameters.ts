/**
 * Comprehensive AI Story Generation Parameters
 * 70+ configurable parameters organized by 10 categories
 * Users can selectively enable/disable and adjust each parameter
 */

export type ParameterType = 'slider' | 'toggle' | 'select' | 'multiselect' | 'text' | 'textarea';

export interface ParameterConstraint {
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  maxLength?: number;
  pattern?: string;
}

export interface AIStoryParameter {
  id: string;
  category: ParameterCategory;
  name: string;
  description: string;
  type: ParameterType;
  defaultValue: any;
  enabled: boolean;
  value?: any;
  constraints?: ParameterConstraint;
  helpText?: string;
  relatedParams?: string[];
}

export type ParameterCategory = 
  | 'character-development'
  | 'plot-structure'
  | 'worldbuilding'
  | 'tone-style'
  | 'technical'
  | 'thematic'
  | 'sensory-immersion'
  | 'audience'
  | 'advanced'
  | 'special-effects';

export const PARAMETER_CATEGORIES = {
  'character-development': {
    label: 'Character Development',
    icon: '👤',
    description: 'Control how characters are developed and portrayed',
    color: '#FF6B6B',
  },
  'plot-structure': {
    label: 'Plot Structure',
    icon: '📖',
    description: 'Define narrative arc, pacing, and conflict',
    color: '#4ECDC4',
  },
  'worldbuilding': {
    label: 'Worldbuilding',
    icon: '🌍',
    description: 'Configure setting, rules, and world mechanics',
    color: '#95E1D3',
  },
  'tone-style': {
    label: 'Tone & Style',
    icon: '✨',
    description: 'Shape narrative voice, prose style, and mood',
    color: '#FFE66D',
  },
  'technical': {
    label: 'Technical Parameters',
    icon: '⚙️',
    description: 'Adjust length, structure, and composition',
    color: '#95B8D1',
  },
  'thematic': {
    label: 'Thematic Elements',
    icon: '🎨',
    description: 'Define themes, symbolism, and deeper meanings',
    color: '#C7CEEA',
  },
  'sensory-immersion': {
    label: 'Sensory & Immersion',
    icon: '👁️',
    description: 'Control sensory details and immersion level',
    color: '#FFDAB9',
  },
  'audience': {
    label: 'Target Audience',
    icon: '👥',
    description: 'Specify audience demographics and content rating',
    color: '#B4A7D6',
  },
  'advanced': {
    label: 'Advanced Options',
    icon: '🔧',
    description: 'Fine-tune generation parameters and AI behavior',
    color: '#73A1D9',
  },
  'special-effects': {
    label: 'Special Effects',
    icon: '⚡',
    description: 'Add unique narrative devices and features',
    color: '#F38181',
  },
};

export const AI_STORY_PARAMETERS: AIStoryParameter[] = [
  // ==================== CHARACTER DEVELOPMENT ====================
  {
    id: 'char-count',
    category: 'character-development',
    name: 'Character Count',
    description: 'Number of prominent characters in the story',
    type: 'slider',
    defaultValue: 3,
    enabled: false,
    constraints: { min: 1, max: 20, step: 1 },
    helpText: 'More characters = richer ensemble, less focus per character',
  },
  {
    id: 'char-depth',
    category: 'character-development',
    name: 'Character Depth',
    description: 'How deeply characters are developed (internal conflicts, backstories, growth arcs)',
    type: 'slider',
    defaultValue: 5,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Higher values = complex, flawed, evolving characters',
  },
  {
    id: 'protagonist-archetype',
    category: 'character-development',
    name: 'Protagonist Archetype',
    description: 'Define protagonist type (Hero, Rogue, Sage, Mentor, Lover, etc.)',
    type: 'select',
    defaultValue: 'Hero',
    enabled: false,
    constraints: {
      options: [
        'Hero', 'Rogue', 'Sage', 'Mentor', 'Lover', 'Creator', 'Innocent', 
        'Everyman', 'Jester', 'Magician', 'Outlaw', 'Explorer', 'None'
      ]
    },
  },
  {
    id: 'character-diversity',
    category: 'character-development',
    name: 'Character Diversity',
    description: 'Level of ethnic, cultural, and social diversity among characters',
    type: 'slider',
    defaultValue: 5,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
  },
  {
    id: 'relationship-complexity',
    category: 'character-development',
    name: 'Relationship Complexity',
    description: 'Complexity of relationships between characters (love triangles, rivalries, alliances, etc.)',
    type: 'slider',
    defaultValue: 5,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
  },
  {
    id: 'character-motivation-clarity',
    category: 'character-development',
    name: 'Character Motivation Clarity',
    description: 'How clear and understandable character motivations are',
    type: 'slider',
    defaultValue: 7,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
  },
  {
    id: 'character-voice-distinctness',
    category: 'character-development',
    name: 'Character Voice Distinctness',
    description: 'How distinct and unique each character\'s voice/speech pattern is',
    type: 'slider',
    defaultValue: 6,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
  },
  {
    id: 'character-flaws',
    category: 'character-development',
    name: 'Character Flaws Emphasis',
    description: 'How prominent character flaws and weaknesses are',
    type: 'slider',
    defaultValue: 5,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Higher = more vulnerable, relatable characters',
  },
  {
    id: 'character-growth',
    category: 'character-development',
    name: 'Character Growth Arc',
    description: 'How much characters transform during the story',
    type: 'slider',
    defaultValue: 6,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
  },

  // ==================== PLOT STRUCTURE ====================
  {
    id: 'plot-complexity',
    category: 'plot-structure',
    name: 'Plot Complexity',
    description: 'Number of subplots and narrative threads',
    type: 'slider',
    defaultValue: 5,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: 'Simple = single thread, Complex = multiple interwoven subplots',
  },
  {
    id: 'pacing-speed',
    category: 'plot-structure',
    name: 'Pacing Speed',
    description: 'How quickly events unfold (slow burn vs. fast-paced)',
    type: 'slider',
    defaultValue: 5,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: '1 = slow, contemplative; 10 = breakneck, action-packed',
  },
  {
    id: 'cliffhanger-frequency',
    category: 'plot-structure',
    name: 'Cliffhanger Frequency',
    description: 'How often cliffhangers or dramatic endings occur at chapter breaks',
    type: 'slider',
    defaultValue: 3,
    enabled: false,
    constraints: { min: 0, max: 10, step: 1 },
  },
  {
    id: 'plot-structure-type',
    category: 'plot-structure',
    name: 'Plot Structure Type',
    description: 'Narrative structure to follow',
    type: 'select',
    defaultValue: 'three-act',
    enabled: false,
    constraints: {
      options: [
        'three-act', 'five-act', 'seven-point', 'hero-journey', 'kishotenketsu',
        'three-act-modified', 'circular', 'parallel', 'non-linear', 'experimental'
      ]
    },
  },
  {
    id: 'twist-count',
    category: 'plot-structure',
    name: 'Plot Twist Count',
    description: 'Number of major plot twists or surprises',
    type: 'slider',
    defaultValue: 2,
    enabled: false,
    constraints: { min: 0, max: 10, step: 1 },
  },
  {
    id: 'conflict-type',
    category: 'plot-structure',
    name: 'Conflict Type',
    description: 'Primary type of conflict in the story',
    type: 'multiselect',
    defaultValue: ['man-vs-self'],
    enabled: false,
    constraints: {
      options: [
        'man-vs-man', 'man-vs-nature', 'man-vs-society', 'man-vs-self',
        'man-vs-technology', 'man-vs-fate', 'man-vs-time'
      ]
    },
  },
  {
    id: 'resolution-type',
    category: 'plot-structure',
    name: 'Resolution Type',
    description: 'How the story concludes',
    type: 'select',
    defaultValue: 'satisfying',
    enabled: false,
    constraints: {
      options: [
        'happy-ending', 'bittersweet', 'tragic', 'ambiguous', 'satisfying',
        'unresolved', 'twist-ending', 'cyclical', 'open-ended'
      ]
    },
  },
  {
    id: 'flashback-usage',
    category: 'plot-structure',
    name: 'Flashback Usage',
    description: 'How much the story uses flashbacks (0 = none, 10 = frequent)',
    type: 'slider',
    defaultValue: 2,
    enabled: false,
    constraints: { min: 0, max: 10, step: 1 },
  },
  {
    id: 'foreshadowing-level',
    category: 'plot-structure',
    name: 'Foreshadowing Level',
    description: 'How much subtle foreshadowing prepares readers for plot points',
    type: 'slider',
    defaultValue: 6,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
  },

  // ==================== WORLDBUILDING ====================
  {
    id: 'setting-detail',
    category: 'worldbuilding',
    name: 'Setting Detail Level',
    description: 'How richly detailed the physical setting/world is described',
    type: 'slider',
    defaultValue: 6,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
  },
  {
    id: 'setting-type',
    category: 'worldbuilding',
    name: 'Setting Time Period',
    description: 'When the story takes place',
    type: 'select',
    defaultValue: 'contemporary',
    enabled: false,
    constraints: {
      options: [
        'medieval', 'renaissance', 'victorian', 'roaring-twenties', 'wwii-era',
        'post-war', 'cold-war', 'contemporary', 'near-future', 'far-future',
        'alternate-history', 'timeless'
      ]
    },
  },
  {
    id: 'world-magic-system',
    category: 'worldbuilding',
    name: 'Magic/Supernatural System',
    description: 'Rules and extent of magic or supernatural elements (0 = realistic)',
    type: 'slider',
    defaultValue: 0,
    enabled: false,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: '0 = no magic, 5 = balanced magic/reality, 10 = fully magical world',
  },
  {
    id: 'technology-level',
    category: 'worldbuilding',
    name: 'Technology Level',
    description: 'Level of technological advancement in the world',
    type: 'slider',
    defaultValue: 5,
    enabled: false,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: '0 = prehistoric, 5 = modern, 10 = futuristic',
  },
  {
    id: 'world-history-depth',
    category: 'worldbuilding',
    name: 'World History Depth',
    description: 'How much the world\'s history influences the present story',
    type: 'slider',
    defaultValue: 4,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
  },
  {
    id: 'politics-complexity',
    category: 'worldbuilding',
    name: 'Political Complexity',
    description: 'Complexity of political systems and power dynamics',
    type: 'slider',
    defaultValue: 3,
    enabled: false,
    constraints: { min: 0, max: 10, step: 1 },
  },
  {
    id: 'economic-system',
    category: 'worldbuilding',
    name: 'Economic System Detail',
    description: 'How detailed is the world\'s economic system',
    type: 'slider',
    defaultValue: 2,
    enabled: false,
    constraints: { min: 0, max: 10, step: 1 },
  },
  {
    id: 'cultural-diversity',
    category: 'worldbuilding',
    name: 'Cultural Diversity',
    description: 'Number and distinctness of different cultures/societies in the world',
    type: 'slider',
    defaultValue: 4,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
  },

  // ==================== TONE & STYLE ====================
  {
    id: 'narrative-voice',
    category: 'tone-style',
    name: 'Narrative Voice',
    description: 'Type of narrative perspective',
    type: 'select',
    defaultValue: 'third-limited',
    enabled: false,
    constraints: {
      options: [
        'first-person', 'second-person', 'third-limited', 'third-omniscient',
        'mixed', 'unreliable-narrator', 'meta-narrative'
      ]
    },
  },
  {
    id: 'prose-style',
    category: 'tone-style',
    name: 'Prose Style',
    description: 'Overall prose sophistication and complexity',
    type: 'select',
    defaultValue: 'balanced',
    enabled: false,
    constraints: {
      options: [
        'simple-accessible', 'balanced', 'literary', 'flowery-poetic',
        'noir-hardboiled', 'minimalist', 'experimental'
      ]
    },
  },
  {
    id: 'dialogue-level',
    category: 'tone-style',
    name: 'Dialogue Proportion',
    description: 'How much of the story is dialogue vs. narration',
    type: 'slider',
    defaultValue: 5,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: '1 = minimal dialogue, 10 = dialogue-heavy',
  },
  {
    id: 'dialogue-naturalism',
    category: 'tone-style',
    name: 'Dialogue Naturalism',
    description: 'How realistic vs. stylized dialogue is',
    type: 'slider',
    defaultValue: 6,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: '1 = highly stylized, 10 = naturalistic/realistic',
  },
  {
    id: 'humor-level',
    category: 'tone-style',
    name: 'Humor Level',
    description: 'Amount and tone of humor in the story',
    type: 'slider',
    defaultValue: 3,
    enabled: false,
    constraints: { min: 0, max: 10, step: 1 },
  },
  {
    id: 'humor-style',
    category: 'tone-style',
    name: 'Humor Style',
    description: 'Type of humor employed',
    type: 'multiselect',
    defaultValue: [],
    enabled: false,
    constraints: {
      options: [
        'slapstick', 'witty', 'dark', 'absurdist', 'situational', 'ironic',
        'sarcasm', 'wordplay', 'satire'
      ]
    },
  },
  {
    id: 'darkness-level',
    category: 'tone-style',
    name: 'Darkness Level',
    description: 'How dark, grim, or disturbing the tone is',
    type: 'slider',
    defaultValue: 3,
    enabled: false,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: '0 = lighthearted, 10 = bleak/dystopian',
  },
  {
    id: 'sentiment-tone',
    category: 'tone-style',
    name: 'Overall Sentiment',
    description: 'Overall emotional tone of the story',
    type: 'select',
    defaultValue: 'neutral',
    enabled: false,
    constraints: {
      options: [
        'hopeful', 'melancholic', 'mysterious', 'thrilling', 'romantic',
        'comedic', 'tragic', 'neutral', 'inspirational', 'unsettling'
      ]
    },
  },

  // ==================== TECHNICAL PARAMETERS ====================
  {
    id: 'target-word-count',
    category: 'technical',
    name: 'Target Word Count',
    description: 'Desired length of the generated story',
    type: 'slider',
    defaultValue: 5000,
    enabled: false,
    constraints: { min: 500, max: 50000, step: 500 },
  },
  {
    id: 'reading-level',
    category: 'technical',
    name: 'Reading Level',
    description: 'Vocabulary and sentence complexity for target reader level',
    type: 'select',
    defaultValue: 'adult',
    enabled: false,
    constraints: {
      options: [
        'elementary', 'middle-school', 'high-school', 'college', 'adult',
        'academic', 'technical'
      ]
    },
  },
  {
    id: 'point-of-view',
    category: 'technical',
    name: 'Point of View',
    description: 'Story perspective (POV character focus)',
    type: 'select',
    defaultValue: 'single-pov',
    enabled: false,
    constraints: {
      options: [
        'single-pov', 'dual-pov', 'multiple-pov', 'omniscient',
        'rotating-pov', 'ensemble-pov'
      ]
    },
  },
  {
    id: 'verb-tense',
    category: 'technical',
    name: 'Verb Tense',
    description: 'Primary tense of narrative',
    type: 'select',
    defaultValue: 'past',
    enabled: false,
    constraints: {
      options: ['past', 'present', 'future', 'mixed']
    },
  },
  {
    id: 'chapter-structure',
    category: 'technical',
    name: 'Chapter Structure',
    description: 'How to divide the story (chapters, sections, continuous, etc.)',
    type: 'select',
    defaultValue: 'chapters',
    enabled: false,
    constraints: {
      options: ['chapters', 'sections', 'parts', 'acts', 'continuous', 'mixed']
    },
  },
  {
    id: 'description-intensity',
    category: 'technical',
    name: 'Description Intensity',
    description: 'Amount of descriptive text vs. action/dialogue',
    type: 'slider',
    defaultValue: 5,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: '1 = minimal description, 10 = highly descriptive',
  },
  {
    id: 'narrative-time-span',
    category: 'technical',
    name: 'Narrative Time Span',
    description: 'How long the depicted events span (hours to years)',
    type: 'select',
    defaultValue: 'days-weeks',
    enabled: false,
    constraints: {
      options: [
        'hours', 'single-day', 'days-weeks', 'months', 'year', 'years',
        'decades', 'lifetime'
      ]
    },
  },

  // ==================== THEMATIC ELEMENTS ====================
  {
    id: 'theme-depth',
    category: 'thematic',
    name: 'Thematic Depth',
    description: 'How deeply the story explores its themes',
    type: 'slider',
    defaultValue: 5,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
  },
  {
    id: 'theme-subtlety',
    category: 'thematic',
    name: 'Theme Subtlety',
    description: 'How subtle vs. explicit themes are presented',
    type: 'slider',
    defaultValue: 6,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: '1 = heavy-handed, 10 = very subtle',
  },
  {
    id: 'symbolism-level',
    category: 'thematic',
    name: 'Symbolism Level',
    description: 'Amount and complexity of symbolic elements',
    type: 'slider',
    defaultValue: 4,
    enabled: false,
    constraints: { min: 0, max: 10, step: 1 },
  },
  {
    id: 'metaphor-density',
    category: 'thematic',
    name: 'Metaphor Density',
    description: 'Frequency and richness of metaphors and similes',
    type: 'slider',
    defaultValue: 4,
    enabled: false,
    constraints: { min: 0, max: 10, step: 1 },
  },
  {
    id: 'moral-complexity',
    category: 'thematic',
    name: 'Moral Complexity',
    description: 'Whether morality is clear-cut or morally ambiguous',
    type: 'slider',
    defaultValue: 5,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: '1 = clear good/evil, 10 = deeply morally ambiguous',
  },

  // ==================== SENSORY & IMMERSION ====================
  {
    id: 'sensory-detail',
    category: 'sensory-immersion',
    name: 'Sensory Detail Level',
    description: 'How richly sensory details (sight, sound, smell, taste, touch) are described',
    type: 'slider',
    defaultValue: 5,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
  },
  {
    id: 'action-description',
    category: 'sensory-immersion',
    name: 'Action Description Detail',
    description: 'How detailed action sequences are described',
    type: 'slider',
    defaultValue: 6,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
  },
  {
    id: 'emotional-depth',
    category: 'sensory-immersion',
    name: 'Emotional Depth',
    description: 'How deeply character emotional states are explored',
    type: 'slider',
    defaultValue: 6,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
  },
  {
    id: 'tension-curve',
    category: 'sensory-immersion',
    name: 'Tension Curve',
    description: 'How dramatic tension builds and releases throughout the story',
    type: 'select',
    defaultValue: 'gradual-build',
    enabled: false,
    constraints: {
      options: [
        'steady', 'gradual-build', 'steady-high', 'spikes', 'crescendo',
        'plateau-release', 'roller-coaster'
      ]
    },
  },
  {
    id: 'immersion-level',
    category: 'sensory-immersion',
    name: 'Immersion Level',
    description: 'How immersive and engaging the narrative experience is',
    type: 'slider',
    defaultValue: 7,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
  },

  // ==================== AUDIENCE ====================
  {
    id: 'age-rating',
    category: 'audience',
    name: 'Age Rating',
    description: 'Intended age group for readers',
    type: 'select',
    defaultValue: 'young-adult',
    enabled: false,
    constraints: {
      options: [
        'children-6-8', 'children-9-12', 'teen-13-17', 'young-adult',
        'adult', 'mature-adult', 'all-ages'
      ]
    },
  },
  {
    id: 'content-warnings',
    category: 'audience',
    name: 'Content Warnings',
    description: 'Sensitive content to include/exclude',
    type: 'multiselect',
    defaultValue: [],
    enabled: false,
    constraints: {
      options: [
        'violence', 'gore', 'sexual-content', 'drug-use', 'abuse',
        'mental-illness', 'self-harm', 'death', 'phobias', 'discrimination'
      ]
    },
  },
  {
    id: 'gender-representation',
    category: 'audience',
    name: 'Gender Representation',
    description: 'Balance of gender representation among characters',
    type: 'select',
    defaultValue: 'balanced',
    enabled: false,
    constraints: {
      options: [
        'male-centric', 'female-centric', 'balanced', 'equal', 'lgbtq-focused',
        'diverse', 'non-binary'
      ]
    },
  },
  {
    id: 'cultural-sensitivity',
    category: 'audience',
    name: 'Cultural Sensitivity',
    description: 'Level of cultural research and respectfulness (0 = stereotypical, 10 = extensively researched)',
    type: 'slider',
    defaultValue: 7,
    enabled: false,
    constraints: { min: 0, max: 10, step: 1 },
  },

  // ==================== ADVANCED OPTIONS ====================
  {
    id: 'creativity-level',
    category: 'advanced',
    name: 'Creativity Level',
    description: 'How creative and unconventional the story should be',
    type: 'slider',
    defaultValue: 6,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: '1 = conventional, 10 = highly experimental',
  },
  {
    id: 'coherence-strictness',
    category: 'advanced',
    name: 'Coherence Strictness',
    description: 'How strictly the story maintains internal logic and consistency',
    type: 'slider',
    defaultValue: 8,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
  },
  {
    id: 'randomization-seed',
    category: 'advanced',
    name: 'Randomization Seed (Optional)',
    description: 'Fixed seed for reproducible story generation (leave empty for random)',
    type: 'text',
    defaultValue: '',
    enabled: false,
    constraints: { maxLength: 20 },
    helpText: 'Use same seed to regenerate identical story',
  },
  {
    id: 'model-temperature',
    category: 'advanced',
    name: 'Generation Temperature',
    description: 'Controls randomness (0 = deterministic, 1 = maximum randomness)',
    type: 'slider',
    defaultValue: 0.7,
    enabled: false,
    constraints: { min: 0, max: 1, step: 0.1 },
  },
  {
    id: 'detail-level',
    category: 'advanced',
    name: 'Generation Detail Level',
    description: 'How much detail the AI spends on various aspects',
    type: 'slider',
    defaultValue: 6,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
  },
  {
    id: 'guardrails-strictness',
    category: 'advanced',
    name: 'Content Safety (Guardrails)',
    description: 'How strictly safety filters are applied',
    type: 'slider',
    defaultValue: 7,
    enabled: false,
    constraints: { min: 1, max: 10, step: 1 },
    helpText: '10 = strict filtering, 1 = minimal filtering',
  },

  // ==================== SPECIAL EFFECTS ====================
  {
    id: 'special-narrative-device',
    category: 'special-effects',
    name: 'Narrative Device',
    description: 'Special narrative technique to employ',
    type: 'multiselect',
    defaultValue: [],
    enabled: false,
    constraints: {
      options: [
        'found-footage', 'epistolary', 'frame-narrative', 'stream-of-consciousness',
        'quest-narrative', 'unreliable-narrator', 'meta-fiction', 'anthology',
        'choose-your-own-adventure', 'parallel-timelines'
      ]
    },
  },
  {
    id: 'easter-eggs',
    category: 'special-effects',
    name: 'Easter Eggs & Hidden Details',
    description: 'Include subtle references and hidden details',
    type: 'toggle',
    defaultValue: false,
    enabled: false,
  },
  {
    id: 'cross-references',
    category: 'special-effects',
    name: 'Interconnected References',
    description: 'Include references to other stories/universes (if part of series)',
    type: 'toggle',
    defaultValue: false,
    enabled: false,
  },
  {
    id: 'genre-blending',
    category: 'special-effects',
    name: 'Genre Blending Level',
    description: 'How much to blend multiple genres together',
    type: 'slider',
    defaultValue: 3,
    enabled: false,
    constraints: { min: 0, max: 10, step: 1 },
    helpText: '0 = pure single genre, 10 = heavily blended',
  },
];

/**
 * Helper Functions
 */

export function getParametersByCategory(category: ParameterCategory): AIStoryParameter[] {
  return AI_STORY_PARAMETERS.filter(p => p.category === category);
}

export function getEnabledParameters(): AIStoryParameter[] {
  return AI_STORY_PARAMETERS.filter(p => p.enabled);
}

export function getParameterById(id: string): AIStoryParameter | undefined {
  return AI_STORY_PARAMETERS.find(p => p.id === id);
}

export function updateParameterValue(id: string, value: any): void {
  const param = getParameterById(id);
  if (param) {
    param.value = value;
  }
}

export function toggleParameter(id: string): void {
  const param = getParameterById(id);
  if (param) {
    param.enabled = !param.enabled;
  }
}

export function getParametersByIds(ids: string[]): AIStoryParameter[] {
  return ids.map(id => getParameterById(id)).filter(p => p !== undefined) as AIStoryParameter[];
}

export function searchParameters(query: string): AIStoryParameter[] {
  const lowerQuery = query.toLowerCase();
  return AI_STORY_PARAMETERS.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.id.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Preset Configurations
 */
export interface ParameterPreset {
  name: string;
  description: string;
  icon: string;
  enabledParameterIds: string[];
}

export const PARAMETER_PRESETS: Record<string, ParameterPreset> = {
  'quick-story': {
    name: 'Quick Story',
    description: 'Minimal parameters for fast generation',
    icon: '⚡',
    enabledParameterIds: [
      'plot-complexity', 'pacing-speed', 'setting-detail', 'narrative-voice',
      'target-word-count', 'age-rating'
    ],
  },
  'standard': {
    name: 'Standard',
    description: 'Balanced set of essential parameters',
    icon: '📖',
    enabledParameterIds: [
      'char-count', 'char-depth', 'protagonist-archetype',
      'plot-complexity', 'pacing-speed', 'conflict-type',
      'setting-type', 'setting-detail', 'narrative-voice', 'prose-style',
      'target-word-count', 'reading-level', 'age-rating', 'creativity-level'
    ],
  },
  'detailed': {
    name: 'Detailed',
    description: 'Comprehensive parameter coverage',
    icon: '🎨',
    enabledParameterIds: [
      'char-count', 'char-depth', 'protagonist-archetype', 'relationship-complexity',
      'character-diversity', 'character-flaws', 'character-growth',
      'plot-complexity', 'pacing-speed', 'cliffhanger-frequency', 'plot-structure-type',
      'twist-count', 'conflict-type', 'resolution-type', 'foreshadowing-level',
      'setting-type', 'setting-detail', 'world-magic-system', 'technology-level',
      'politics-complexity', 'cultural-diversity',
      'narrative-voice', 'prose-style', 'dialogue-level', 'humor-level', 'darkness-level',
      'target-word-count', 'reading-level', 'point-of-view', 'description-intensity',
      'theme-depth', 'symbolism-level', 'moral-complexity',
      'sensory-detail', 'emotional-depth', 'immersion-level',
      'age-rating', 'content-warnings', 'cultural-sensitivity',
      'creativity-level', 'coherence-strictness'
    ],
  },
  'epic': {
    name: 'Epic',
    description: 'All 70+ parameters for maximum customization',
    icon: '👑',
    enabledParameterIds: AI_STORY_PARAMETERS.map(p => p.id),
  },
};

export function applyPreset(presetKey: string): void {
  // First disable all parameters
  AI_STORY_PARAMETERS.forEach(p => p.enabled = false);

  // Then enable only those in the preset
  const preset = PARAMETER_PRESETS[presetKey];
  if (preset) {
    preset.enabledParameterIds.forEach(id => {
      const param = getParameterById(id);
      if (param) {
        param.enabled = true;
      }
    });
  }
}

export function getPresetEnabledCount(presetKey: string): number {
  const preset = PARAMETER_PRESETS[presetKey];
  return preset ? preset.enabledParameterIds.length : 0;
}
