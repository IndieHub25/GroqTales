/**
 * Unit tests for StoryMemoryManager
 * 
 * Tests memory updates, canon element extraction, and contradiction detection
 * Requirements: 4.1, 4.2, 4.5
 */

import { StoryMemoryManager } from '@/lib/services/story-memory-manager';
import { PanelData, StoryMemory } from '@/lib/types/story-session';

describe('StoryMemoryManager', () => {
  let manager: StoryMemoryManager;

  beforeEach(() => {
    manager = new StoryMemoryManager();
  });

  describe('updateMemory', () => {
    it('should initialize empty memory when none provided', () => {
      const panel: PanelData = {
        panelIndex: 1,
        title: 'Chapter 1',
        parameters: {},
        generatedContent: 'Test content',
        wordCount: 100,
        status: 'complete',
        metadata: {
          createdAt: new Date(),
          generatedAt: new Date(),
        },
      };

      const memory = manager.updateMemory(panel);

      expect(memory).toBeDefined();
      expect(memory.characters).toEqual([]);
      expect(memory.majorEvents).toEqual([]);
      expect(memory.establishedFacts).toEqual([]);
    });

    it('should update memory with existing memory provided', () => {
      const existingMemory: StoryMemory = {
        characters: [{
          name: 'Alice',
          role: 'protagonist',
          traits: [],
          relationships: {},
          arc: 'developing',
          firstAppearance: 1,
        }],
        worldBuilding: {
          setting: 'Fantasy',
          timePeriod: 'Medieval',
          rules: [],
          locations: [],
          cultures: [],
        },
        majorEvents: [],
        unresolvedQuestions: [],
        establishedFacts: [],
        themes: [],
        tone: 'dark',
      };

      const panel: PanelData = {
        panelIndex: 2,
        title: 'Chapter 2',
        parameters: {},
        generatedContent: 'Bob walked into the room.',
        wordCount: 100,
        status: 'complete',
        metadata: {
          createdAt: new Date(),
          generatedAt: new Date(),
        },
      };

      const memory = manager.updateMemory(panel, existingMemory);

      expect(memory.characters.length).toBeGreaterThanOrEqual(1);
      expect(memory.characters[0]?.name).toBe('Alice');
    });

    it('should update tone from panel parameters', () => {
      const panel: PanelData = {
        panelIndex: 1,
        title: 'Chapter 1',
        parameters: {
          sentimentTone: 'hopeful',
        },
        generatedContent: 'Test content',
        wordCount: 100,
        status: 'complete',
        metadata: {
          createdAt: new Date(),
          generatedAt: new Date(),
        },
      };

      const memory = manager.updateMemory(panel);

      expect(memory.tone).toBe('hopeful');
    });
  });

  describe('extractCanonElements', () => {
    it('should return empty array for panel with no content', () => {
      const panel: PanelData = {
        panelIndex: 1,
        title: 'Chapter 1',
        parameters: {},
        generatedContent: '',
        wordCount: 0,
        status: 'pending',
        metadata: {
          createdAt: new Date(),
        },
      };

      const elements = manager.extractCanonElements(panel);

      expect(elements).toEqual([]);
    });

    it('should extract character names from content', () => {
      const panel: PanelData = {
        panelIndex: 1,
        title: 'Chapter 1',
        parameters: {},
        generatedContent: 'Alice said hello to Bob. Charlie walked away.',
        wordCount: 100,
        status: 'complete',
        metadata: {
          createdAt: new Date(),
          generatedAt: new Date(),
        },
      };

      const elements = manager.extractCanonElements(panel);

      const characterElements = elements.filter((e) => e.type === 'character');
      expect(characterElements.length).toBeGreaterThan(0);
    });

    it('should extract world-building elements from content', () => {
      const panel: PanelData = {
        panelIndex: 1,
        title: 'Chapter 1',
        parameters: {},
        generatedContent: 'They traveled to the Crystal City during the 15th century.',
        wordCount: 100,
        status: 'complete',
        metadata: {
          createdAt: new Date(),
          generatedAt: new Date(),
        },
      };

      const elements = manager.extractCanonElements(panel);

      const worldElements = elements.filter((e) => e.type === 'world-building');
      expect(worldElements.length).toBeGreaterThan(0);
    });

    it('should extract events for climax panels', () => {
      const panel: PanelData = {
        panelIndex: 5,
        title: 'Chapter 5',
        parameters: {
          chapterRole: 'climax',
        },
        generatedContent: 'The final battle began.',
        wordCount: 100,
        status: 'complete',
        metadata: {
          createdAt: new Date(),
          generatedAt: new Date(),
        },
      };

      const elements = manager.extractCanonElements(panel);

      const eventElements = elements.filter((e) => e.type === 'event');
      expect(eventElements.length).toBeGreaterThan(0);
      expect(eventElements[0]?.importance).toBe('high');
    });
  });

  describe('detectContradictions', () => {
    it('should return empty array when no contradictions exist', () => {
      const memory: StoryMemory = {
        characters: [],
        worldBuilding: {
          setting: '',
          timePeriod: '',
          rules: [],
          locations: [],
          cultures: [],
        },
        majorEvents: [],
        unresolvedQuestions: [],
        establishedFacts: [],
        themes: [],
        tone: '',
      };

      const panel: PanelData = {
        panelIndex: 1,
        title: 'Chapter 1',
        parameters: {},
        generatedContent: 'Alice walked into the room.',
        wordCount: 100,
        status: 'complete',
        metadata: {
          createdAt: new Date(),
          generatedAt: new Date(),
        },
      };

      const contradictions = manager.detectContradictions(panel, memory);

      expect(contradictions).toEqual([]);
    });

    it('should detect character appearance contradictions', () => {
      const memory: StoryMemory = {
        characters: [{
          name: 'Alice',
          role: 'protagonist',
          traits: [],
          relationships: {},
          arc: 'developing',
          firstAppearance: 3,
        }],
        worldBuilding: {
          setting: '',
          timePeriod: '',
          rules: [],
          locations: [],
          cultures: [],
        },
        majorEvents: [],
        unresolvedQuestions: [],
        establishedFacts: [],
        themes: [],
        tone: '',
      };

      const panel: PanelData = {
        panelIndex: 2,
        title: 'Chapter 2',
        parameters: {},
        generatedContent: 'Alice said hello.',
        wordCount: 100,
        status: 'complete',
        metadata: {
          createdAt: new Date(),
          generatedAt: new Date(),
        },
      };

      const contradictions = manager.detectContradictions(panel, memory);

      expect(contradictions.length).toBeGreaterThan(0);
      expect(contradictions[0]?.type).toBe('character');
    });

    it('should detect time period contradictions', () => {
      const memory: StoryMemory = {
        characters: [],
        worldBuilding: {
          setting: '',
          timePeriod: '15th century',
          rules: [],
          locations: [],
          cultures: [],
        },
        majorEvents: [],
        unresolvedQuestions: [],
        establishedFacts: [],
        themes: [],
        tone: '',
      };

      const panel: PanelData = {
        panelIndex: 2,
        title: 'Chapter 2',
        parameters: {},
        generatedContent: 'In the 21st century, technology was everywhere.',
        wordCount: 100,
        status: 'complete',
        metadata: {
          createdAt: new Date(),
          generatedAt: new Date(),
        },
      };

      const contradictions = manager.detectContradictions(panel, memory);

      const timePeriodContradictions = contradictions.filter(
        (c) => c.type === 'world-building' && c.description.includes('Time period')
      );
      expect(timePeriodContradictions.length).toBeGreaterThan(0);
    });
  });

  describe('getSummary', () => {
    it('should generate empty summary for empty memory', () => {
      const memory: StoryMemory = {
        characters: [],
        worldBuilding: {
          setting: '',
          timePeriod: '',
          rules: [],
          locations: [],
          cultures: [],
        },
        majorEvents: [],
        unresolvedQuestions: [],
        establishedFacts: [],
        themes: [],
        tone: '',
      };

      const summary = manager.getSummary(memory);

      expect(summary).toBe('');
    });

    it('should include characters in summary', () => {
      const memory: StoryMemory = {
        characters: [
          {
            name: 'Alice',
            role: 'protagonist',
            traits: [],
            relationships: {},
            arc: 'developing',
            firstAppearance: 1,
          },
          {
            name: 'Bob',
            role: 'antagonist',
            traits: [],
            relationships: {},
            arc: 'static',
            firstAppearance: 2,
          },
        ],
        worldBuilding: {
          setting: '',
          timePeriod: '',
          rules: [],
          locations: [],
          cultures: [],
        },
        majorEvents: [],
        unresolvedQuestions: [],
        establishedFacts: [],
        themes: [],
        tone: '',
      };

      const summary = manager.getSummary(memory);

      expect(summary).toContain('Alice');
      expect(summary).toContain('Bob');
      expect(summary).toContain('Characters:');
    });

    it('should include setting and locations in summary', () => {
      const memory: StoryMemory = {
        characters: [],
        worldBuilding: {
          setting: 'Fantasy',
          timePeriod: '',
          rules: [],
          locations: ['Crystal City', 'Dark Forest'],
          cultures: [],
        },
        majorEvents: [],
        unresolvedQuestions: [],
        establishedFacts: [],
        themes: [],
        tone: '',
      };

      const summary = manager.getSummary(memory);

      expect(summary).toContain('Fantasy');
      expect(summary).toContain('Crystal City');
      expect(summary).toContain('Setting:');
    });

    it('should include themes in summary', () => {
      const memory: StoryMemory = {
        characters: [],
        worldBuilding: {
          setting: '',
          timePeriod: '',
          rules: [],
          locations: [],
          cultures: [],
        },
        majorEvents: [],
        unresolvedQuestions: [],
        establishedFacts: [],
        themes: ['love', 'betrayal', 'redemption'],
        tone: '',
      };

      const summary = manager.getSummary(memory);

      expect(summary).toContain('love');
      expect(summary).toContain('betrayal');
      expect(summary).toContain('Themes:');
    });
  });

  describe('generateSummary', () => {
    it('should return empty string for empty panel array', () => {
      const summary = manager.generateSummary([]);

      expect(summary).toBe('');
    });

    it('should generate summary with single panel', () => {
      const panel: PanelData = {
        panelIndex: 1,
        title: 'The Beginning',
        parameters: {
          settingType: 'Fantasy',
          sentimentTone: 'hopeful',
        },
        generatedContent: 'Alice walked into the Crystal City. She had never seen anything so beautiful.',
        wordCount: 100,
        status: 'complete',
        metadata: {
          createdAt: new Date(),
          generatedAt: new Date(),
        },
      };

      const summary = manager.generateSummary([panel]);

      expect(summary).toContain('PANEL SUMMARIES');
      expect(summary).toContain('Panel 1');
      expect(summary).toContain('The Beginning');
    });

    it('should include character information in summary', () => {
      const panel: PanelData = {
        panelIndex: 1,
        title: 'Chapter 1',
        parameters: {
          protagonistArchetype: 'hero',
        },
        generatedContent: 'Alice said hello to Bob. Charlie walked away.',
        wordCount: 100,
        status: 'complete',
        metadata: {
          createdAt: new Date(),
          generatedAt: new Date(),
        },
      };

      const summary = manager.generateSummary([panel]);

      expect(summary).toContain('CHARACTERS');
    });

    it('should include world-building information in summary', () => {
      const panel: PanelData = {
        panelIndex: 1,
        title: 'Chapter 1',
        parameters: {
          settingType: 'Fantasy',
        },
        generatedContent: 'They traveled to the Crystal City during the 15th century.',
        wordCount: 100,
        status: 'complete',
        metadata: {
          createdAt: new Date(),
          generatedAt: new Date(),
        },
      };

      const summary = manager.generateSummary([panel]);

      expect(summary).toContain('WORLD AND SETTING');
      expect(summary).toContain('Fantasy');
    });

    it('should include major events in chronological order', () => {
      const panels: PanelData[] = [
        {
          panelIndex: 1,
          title: 'Chapter 1',
          parameters: {
            chapterRole: 'setup',
          },
          generatedContent: 'The journey began.',
          wordCount: 50,
          status: 'complete',
          metadata: {
            createdAt: new Date(),
            generatedAt: new Date(),
          },
        },
        {
          panelIndex: 2,
          title: 'Chapter 2',
          parameters: {
            chapterRole: 'climax',
          },
          generatedContent: 'The battle was fierce.',
          wordCount: 50,
          status: 'complete',
          metadata: {
            createdAt: new Date(),
            generatedAt: new Date(),
          },
        },
      ];

      const summary = manager.generateSummary(panels);

      expect(summary).toContain('MAJOR EVENTS');
      expect(summary).toContain('Panel 1');
      expect(summary).toContain('Panel 2');
    });

    it('should include themes and tone when present', () => {
      const panel: PanelData = {
        panelIndex: 1,
        title: 'Chapter 1',
        parameters: {
          themeDepth: 5,
          sentimentTone: 'dark',
        },
        generatedContent: 'The story of love and betrayal began in the shadows.',
        wordCount: 100,
        status: 'complete',
        metadata: {
          createdAt: new Date(),
          generatedAt: new Date(),
        },
      };

      const summary = manager.generateSummary([panel]);

      expect(summary).toContain('THEMES AND TONE');
      expect(summary).toContain('dark');
    });

    it('should generate comprehensive summary with multiple panels', () => {
      const panels: PanelData[] = [
        {
          panelIndex: 1,
          title: 'The Beginning',
          parameters: {
            settingType: 'Fantasy',
            protagonistArchetype: 'hero',
            sentimentTone: 'hopeful',
          },
          generatedContent: 'Alice walked into the Crystal City. She had a mission to complete.',
          wordCount: 100,
          status: 'complete',
          metadata: {
            createdAt: new Date(),
            generatedAt: new Date(),
          },
        },
        {
          panelIndex: 2,
          title: 'The Challenge',
          parameters: {
            chapterRole: 'development',
          },
          generatedContent: 'Bob appeared and challenged Alice to a duel.',
          wordCount: 100,
          status: 'complete',
          metadata: {
            createdAt: new Date(),
            generatedAt: new Date(),
          },
        },
        {
          panelIndex: 3,
          title: 'The Climax',
          parameters: {
            chapterRole: 'climax',
          },
          generatedContent: 'The final battle took place in the Dark Forest.',
          wordCount: 100,
          status: 'complete',
          metadata: {
            createdAt: new Date(),
            generatedAt: new Date(),
          },
        },
      ];

      const summary = manager.generateSummary(panels);

      // Should contain all major sections
      expect(summary).toContain('WORLD AND SETTING');
      expect(summary).toContain('CHARACTERS');
      expect(summary).toContain('MAJOR EVENTS');
      expect(summary).toContain('PANEL SUMMARIES');
      
      // Should contain all panel titles
      expect(summary).toContain('The Beginning');
      expect(summary).toContain('The Challenge');
      expect(summary).toContain('The Climax');
      
      // Should contain character names
      expect(summary).toContain('Alice');
      expect(summary).toContain('Bob');
    });

    it('should handle panels with no generated content', () => {
      const panel: PanelData = {
        panelIndex: 1,
        title: 'Chapter 1',
        parameters: {},
        generatedContent: '',
        wordCount: 0,
        status: 'pending',
        metadata: {
          createdAt: new Date(),
        },
      };

      const summary = manager.generateSummary([panel]);

      expect(summary).toContain('PANEL SUMMARIES');
      expect(summary).toContain('(No content generated)');
    });
  });
});
