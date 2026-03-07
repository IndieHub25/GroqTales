/**
 * StoryMemoryManager - Tracks narrative continuity across panels
 * 
 * This service maintains story memory by extracting and storing narrative elements
 * from panels, detecting contradictions, and ensuring narrative coherence across
 * the multi-panel story.
 * 
 * Requirements: 4.1, 4.2, 4.5
 */

import {
  PanelData,
  StoryMemory,
  CharacterMemory,
  WorldBuildingMemory,
  EventMemory,
} from '@/lib/types/story-session';

export interface CanonElement {
  type: 'character' | 'event' | 'world-building' | 'fact';
  content: string;
  panelIndex: number;
  importance: 'high' | 'medium' | 'low';
}

export interface Contradiction {
  type: 'character' | 'event' | 'world-building' | 'fact';
  description: string;
  conflictingPanels: number[];
  severity: 'critical' | 'moderate' | 'minor';
}

export class StoryMemoryManager {
  /**
   * Updates story memory with narrative elements from a new panel
   * 
   * Requirements: 4.1, 4.2
   * 
   * @param panel - The panel to extract narrative elements from
   * @param currentMemory - The current story memory to update
   * @returns Updated story memory with new narrative elements
   */
  updateMemory(panel: PanelData, currentMemory?: StoryMemory): StoryMemory {
    // Initialize memory if not provided
    const memory: StoryMemory = currentMemory || {
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

    // Extract canon elements from the panel
    const canonElements = this.extractCanonElements(panel);

    // Update memory based on extracted elements
    for (const element of canonElements) {
      switch (element.type) {
        case 'character':
          this.updateCharacterMemory(memory, element, panel);
          break;
        case 'event':
          this.updateEventMemory(memory, element, panel);
          break;
        case 'world-building':
          this.updateWorldBuildingMemory(memory, element, panel);
          break;
        case 'fact':
          this.updateEstablishedFacts(memory, element);
          break;
      }
    }

    // Extract themes from panel parameters
    if (panel.parameters.themeDepth && panel.parameters.themeDepth > 0) {
      this.updateThemes(memory, panel);
    }

    // Update tone from panel parameters
    if (panel.parameters.sentimentTone) {
      memory.tone = panel.parameters.sentimentTone;
    }

    return memory;
  }

  /**
   * Extracts canonical narrative elements from a panel
   * 
   * Requirements: 4.1, 4.2
   * 
   * @param panel - The panel to extract elements from
   * @returns Array of canonical elements found in the panel
   */
  extractCanonElements(panel: PanelData): CanonElement[] {
    const elements: CanonElement[] = [];
    const content = panel.generatedContent;

    if (!content || content.trim().length === 0) {
      return elements;
    }

    // Extract character-related elements
    // Look for character introductions, names in quotes, or character actions
    const characterPatterns = [
      /(?:^|\s)([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+(?:said|thought|felt|walked|ran|looked)/gm,
      /(?:protagonist|antagonist|character)(?:\s+named)?\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/gi,
    ];

    for (const pattern of characterPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          elements.push({
            type: 'character',
            content: match[1],
            panelIndex: panel.panelIndex,
            importance: 'high',
          });
        }
      }
    }

    // Extract world-building elements
    // Look for location descriptions, time periods, or setting details
    const worldBuildingPatterns = [
      /(?:in|at|near|within)\s+(?:the\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:City|Kingdom|Empire|Village|Town|Castle|Forest|Mountain|Desert|Ocean)))/g,
      /(?:during|in)\s+(?:the\s+)?(\d+(?:st|nd|rd|th)?\s+century|ancient|medieval|modern|future|year\s+\d+)/gi,
    ];

    for (const pattern of worldBuildingPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          elements.push({
            type: 'world-building',
            content: match[1],
            panelIndex: panel.panelIndex,
            importance: 'medium',
          });
        }
      }
    }

    // Extract major events
    // Look for significant plot points or actions
    if (panel.parameters.chapterRole === 'climax') {
      elements.push({
        type: 'event',
        content: `Climax event in panel ${panel.panelIndex}`,
        panelIndex: panel.panelIndex,
        importance: 'high',
      });
    }

    // Extract established facts from content
    // Look for definitive statements
    const factPatterns = [
      /(?:It\s+(?:was|is)|There\s+(?:was|were|is|are))\s+([^.!?]+[.!?])/g,
      /(?:The\s+truth\s+(?:was|is)|In\s+fact)\s+([^.!?]+[.!?])/gi,
    ];

    for (const pattern of factPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length < 200) {
          elements.push({
            type: 'fact',
            content: match[1].trim(),
            panelIndex: panel.panelIndex,
            importance: 'low',
          });
        }
      }
    }

    return elements;
  }

  /**
   * Detects contradictions between a new panel and existing story memory
   * 
   * Requirements: 4.5
   * 
   * @param newPanel - The new panel to check for contradictions
   * @param memory - The existing story memory
   * @returns Array of detected contradictions
   */
  detectContradictions(newPanel: PanelData, memory: StoryMemory): Contradiction[] {
    const contradictions: Contradiction[] = [];

    // Extract elements from the new panel
    const newElements = this.extractCanonElements(newPanel);

    // Check for character contradictions
    for (const element of newElements.filter(e => e.type === 'character')) {
      const existingCharacter = memory.characters.find(
        c => c.name.toLowerCase() === element.content.toLowerCase()
      );

      if (existingCharacter) {
        // Check if character appears before their first appearance
        if (newPanel.panelIndex < existingCharacter.firstAppearance) {
          contradictions.push({
            type: 'character',
            description: `Character "${element.content}" appears in panel ${newPanel.panelIndex} but was first introduced in panel ${existingCharacter.firstAppearance}`,
            conflictingPanels: [newPanel.panelIndex, existingCharacter.firstAppearance],
            severity: 'moderate',
          });
        }
      }
    }

    // Check for world-building contradictions
    for (const element of newElements.filter(e => e.type === 'world-building')) {
      // Check for conflicting time periods
      if (memory.worldBuilding.timePeriod && element.content.toLowerCase().includes('century')) {
        const existingPeriod = memory.worldBuilding.timePeriod.toLowerCase();
        const newPeriod = element.content.toLowerCase();
        
        if (existingPeriod !== newPeriod && !existingPeriod.includes(newPeriod) && !newPeriod.includes(existingPeriod)) {
          contradictions.push({
            type: 'world-building',
            description: `Time period mismatch: existing "${memory.worldBuilding.timePeriod}" conflicts with new "${element.content}"`,
            conflictingPanels: [newPanel.panelIndex],
            severity: 'critical',
          });
        }
      }

      // Check for conflicting locations
      const existingLocations = memory.worldBuilding.locations.map(l => l.toLowerCase());
      const newLocation = element.content.toLowerCase();
      
      // This is a simple check - in a real implementation, you'd want more sophisticated logic
      if (existingLocations.length > 0 && !existingLocations.some(loc => 
        newLocation.includes(loc) || loc.includes(newLocation)
      )) {
        // New location is fine, just different - not a contradiction
      }
    }

    // Check for event contradictions
    const newEvents = newElements.filter(e => e.type === 'event');
    for (const newEvent of newEvents) {
      // Check if a similar event already occurred
      const similarEvent = memory.majorEvents.find(
        e => e.description.toLowerCase().includes(newEvent.content.toLowerCase()) ||
             newEvent.content.toLowerCase().includes(e.description.toLowerCase())
      );

      if (similarEvent && similarEvent.panelIndex !== newPanel.panelIndex) {
        // This could be a repetition or contradiction
        contradictions.push({
          type: 'event',
          description: `Similar event appears in both panel ${similarEvent.panelIndex} and panel ${newPanel.panelIndex}`,
          conflictingPanels: [similarEvent.panelIndex, newPanel.panelIndex],
          severity: 'minor',
        });
      }
    }

    // Check for fact contradictions
    for (const element of newElements.filter(e => e.type === 'fact')) {
      // Check if this fact contradicts any established facts
      for (const establishedFact of memory.establishedFacts) {
        // Simple contradiction detection - in reality, this would need NLP
        const newFactLower = element.content.toLowerCase();
        const establishedFactLower = establishedFact.toLowerCase();
        
        // Look for negation patterns
        if (
          (newFactLower.includes('not') && establishedFactLower.includes(newFactLower.replace('not', '').trim())) ||
          (establishedFactLower.includes('not') && newFactLower.includes(establishedFactLower.replace('not', '').trim()))
        ) {
          contradictions.push({
            type: 'fact',
            description: `Fact contradiction: "${element.content}" conflicts with established fact "${establishedFact}"`,
            conflictingPanels: [newPanel.panelIndex],
            severity: 'critical',
          });
        }
      }
    }

    return contradictions;
  }

  /**
   * Updates character memory with new character information
   * 
   * @param memory - The story memory to update
   * @param element - The canon element containing character information
   * @param panel - The panel the character appears in
   */
  private updateCharacterMemory(
    memory: StoryMemory,
    element: CanonElement,
    panel: PanelData
  ): void {
    const characterName = element.content;
    const existingCharacter = memory.characters.find(
      c => c.name.toLowerCase() === characterName.toLowerCase()
    );

    if (!existingCharacter) {
      // Determine character role from panel parameters
      let role: 'protagonist' | 'antagonist' | 'supporting' = 'supporting';
      
      if (panel.parameters.protagonistArchetype) {
        role = 'protagonist';
      } else if (panel.parameters.antagonistPresence && panel.parameters.antagonistPresence > 0) {
        // Check if this might be the antagonist
        if (memory.characters.filter(c => c.role === 'antagonist').length === 0) {
          role = 'antagonist';
        }
      }

      // Add new character to memory
      const newCharacter: CharacterMemory = {
        name: characterName,
        role,
        traits: [],
        relationships: {},
        arc: panel.parameters.characterGrowth ? 'developing' : 'static',
        firstAppearance: panel.panelIndex,
      };

      memory.characters.push(newCharacter);
    }
  }

  /**
   * Updates event memory with new event information
   * 
   * @param memory - The story memory to update
   * @param element - The canon element containing event information
   * @param panel - The panel the event occurs in
   */
  private updateEventMemory(
    memory: StoryMemory,
    element: CanonElement,
    panel: PanelData
  ): void {
    const newEvent: EventMemory = {
      panelIndex: panel.panelIndex,
      description: element.content,
      significance: element.importance === 'high' ? 'major' : 'minor',
      consequences: [],
    };

    // Avoid duplicate events
    const isDuplicate = memory.majorEvents.some(
      e => e.panelIndex === newEvent.panelIndex &&
           e.description.toLowerCase() === newEvent.description.toLowerCase()
    );

    if (!isDuplicate) {
      memory.majorEvents.push(newEvent);
    }
  }

  /**
   * Updates world-building memory with new world information
   * 
   * @param memory - The story memory to update
   * @param element - The canon element containing world-building information
   * @param panel - The panel containing the world-building element
   */
  private updateWorldBuildingMemory(
    memory: StoryMemory,
    element: CanonElement,
    panel: PanelData
  ): void {
    const content = element.content;

    // Determine what type of world-building element this is
    if (content.match(/city|kingdom|empire|village|town|castle|forest|mountain|desert|ocean/i)) {
      // This is a location
      if (!memory.worldBuilding.locations.includes(content)) {
        memory.worldBuilding.locations.push(content);
      }
    } else if (content.match(/century|ancient|medieval|modern|future|year/i)) {
      // This is a time period
      if (!memory.worldBuilding.timePeriod) {
        memory.worldBuilding.timePeriod = content;
      }
    }

    // Update setting from panel parameters
    if (panel.parameters.settingType && !memory.worldBuilding.setting) {
      memory.worldBuilding.setting = panel.parameters.settingType;
    }

    // Update rules from panel parameters
    if (panel.parameters.worldMagicSystem && panel.parameters.worldMagicSystem > 0) {
      const magicRule = `Magic system level: ${panel.parameters.worldMagicSystem}`;
      if (!memory.worldBuilding.rules.includes(magicRule)) {
        memory.worldBuilding.rules.push(magicRule);
      }
    }

    if (panel.parameters.technologyLevel) {
      const techRule = `Technology level: ${panel.parameters.technologyLevel}`;
      if (!memory.worldBuilding.rules.includes(techRule)) {
        memory.worldBuilding.rules.push(techRule);
      }
    }
  }

  /**
   * Updates established facts in story memory
   * 
   * @param memory - The story memory to update
   * @param element - The canon element containing a fact
   */
  private updateEstablishedFacts(memory: StoryMemory, element: CanonElement): void {
    const fact = element.content;

    // Avoid duplicate facts
    const isDuplicate = memory.establishedFacts.some(
      f => f.toLowerCase() === fact.toLowerCase()
    );

    if (!isDuplicate && fact.length > 10 && fact.length < 200) {
      memory.establishedFacts.push(fact);
    }
  }

  /**
   * Updates themes in story memory based on panel content
   * 
   * @param memory - The story memory to update
   * @param panel - The panel to extract themes from
   */
  private updateThemes(memory: StoryMemory, panel: PanelData): void {
    // Extract themes from panel parameters or content
    // This is a simplified implementation - in reality, you'd use NLP
    
    const themeKeywords = [
      'love', 'death', 'power', 'freedom', 'justice', 'revenge',
      'redemption', 'sacrifice', 'betrayal', 'loyalty', 'courage',
      'fear', 'hope', 'despair', 'identity', 'family', 'friendship',
    ];

    const content = panel.generatedContent.toLowerCase();
    
    for (const keyword of themeKeywords) {
      if (content.includes(keyword) && !memory.themes.includes(keyword)) {
        memory.themes.push(keyword);
      }
    }
  }

  /**
   * Generates a comprehensive "Story So Far" summary from previous panels
   * 
   * This method creates a detailed narrative summary suitable for AI context consumption,
   * including character tracking, major events, and unresolved questions.
   * 
   * Requirements: 4.3, 4.4
   * 
   * @param panels - Array of previous panels to summarize
   * @returns A formatted "Story So Far" summary for AI context
   */
  generateSummary(panels: PanelData[]): string {
    if (panels.length === 0) {
      return '';
    }

    // Build story memory from all panels
    let memory: StoryMemory = {
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

    // Update memory with each panel
    for (const panel of panels) {
      memory = this.updateMemory(panel, memory);
    }

    // Build comprehensive summary sections
    const sections: string[] = [];

    // Section 1: World and Setting
    if (memory.worldBuilding.setting || memory.worldBuilding.timePeriod || memory.worldBuilding.locations.length > 0) {
      const worldParts: string[] = ['WORLD AND SETTING:'];
      
      if (memory.worldBuilding.setting) {
        worldParts.push(`Setting: ${memory.worldBuilding.setting}`);
      }
      
      if (memory.worldBuilding.timePeriod) {
        worldParts.push(`Time Period: ${memory.worldBuilding.timePeriod}`);
      }
      
      if (memory.worldBuilding.locations.length > 0) {
        worldParts.push(`Locations: ${memory.worldBuilding.locations.join(', ')}`);
      }
      
      if (memory.worldBuilding.rules.length > 0) {
        worldParts.push(`World Rules: ${memory.worldBuilding.rules.join('; ')}`);
      }
      
      sections.push(worldParts.join('\n'));
    }

    // Section 2: Characters
    if (memory.characters.length > 0) {
      const characterParts: string[] = ['CHARACTERS:'];
      
      for (const character of memory.characters) {
        const charDetails: string[] = [
          `- ${character.name} (${character.role})`,
        ];
        
        if (character.traits.length > 0) {
          charDetails.push(`  Traits: ${character.traits.join(', ')}`);
        }
        
        if (Object.keys(character.relationships).length > 0) {
          const relationships = Object.entries(character.relationships)
            .map(([name, type]) => `${name} (${type})`)
            .join(', ');
          charDetails.push(`  Relationships: ${relationships}`);
        }
        
        if (character.arc) {
          charDetails.push(`  Character Arc: ${character.arc}`);
        }
        
        charDetails.push(`  First Appearance: Panel ${character.firstAppearance}`);
        
        characterParts.push(charDetails.join('\n'));
      }
      
      sections.push(characterParts.join('\n'));
    }

    // Section 3: Major Events (chronological)
    if (memory.majorEvents.length > 0) {
      const eventParts: string[] = ['MAJOR EVENTS:'];
      
      // Sort events by panel index
      const sortedEvents = [...memory.majorEvents].sort((a, b) => a.panelIndex - b.panelIndex);
      
      for (const event of sortedEvents) {
        eventParts.push(`- Panel ${event.panelIndex}: ${event.description} (${event.significance})`);
        
        if (event.consequences.length > 0) {
          eventParts.push(`  Consequences: ${event.consequences.join('; ')}`);
        }
      }
      
      sections.push(eventParts.join('\n'));
    }

    // Section 4: Established Facts
    if (memory.establishedFacts.length > 0) {
      const factParts: string[] = ['ESTABLISHED FACTS:'];
      
      for (const fact of memory.establishedFacts) {
        factParts.push(`- ${fact}`);
      }
      
      sections.push(factParts.join('\n'));
    }

    // Section 5: Unresolved Questions
    if (memory.unresolvedQuestions.length > 0) {
      const questionParts: string[] = ['UNRESOLVED QUESTIONS:'];
      
      for (const question of memory.unresolvedQuestions) {
        questionParts.push(`- ${question}`);
      }
      
      sections.push(questionParts.join('\n'));
    }

    // Section 6: Themes and Tone
    if (memory.themes.length > 0 || memory.tone) {
      const themeParts: string[] = ['THEMES AND TONE:'];
      
      if (memory.themes.length > 0) {
        themeParts.push(`Themes: ${memory.themes.join(', ')}`);
      }
      
      if (memory.tone) {
        themeParts.push(`Overall Tone: ${memory.tone}`);
      }
      
      sections.push(themeParts.join('\n'));
    }

    // Section 7: Panel Summaries
    const panelParts: string[] = ['PANEL SUMMARIES:'];
    
    for (const panel of panels) {
      const panelSummary = this.extractPanelSummary(panel);
      panelParts.push(`\nPanel ${panel.panelIndex}: ${panel.title}`);
      panelParts.push(panelSummary);
    }
    
    sections.push(panelParts.join('\n'));

    // Combine all sections
    const fullSummary = sections.join('\n\n');
    
    return fullSummary;
  }

  /**
   * Extracts a brief summary from a panel's content
   * 
   * @param panel - The panel to summarize
   * @returns A brief summary of the panel content
   */
  private extractPanelSummary(panel: PanelData): string {
    const content = panel.generatedContent;
    
    if (!content || content.trim().length === 0) {
      return '(No content generated)';
    }

    // Extract first few sentences or first paragraph as summary
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    
    if (sentences.length === 0) {
      // If no sentences found, take first 200 characters
      return content.substring(0, 200).trim() + (content.length > 200 ? '...' : '');
    }

    // Take first 2-3 sentences, up to ~300 characters
    let summary = '';
    for (let i = 0; i < Math.min(3, sentences.length); i++) {
      const sentence = sentences[i]?.trim();
      if (sentence && summary.length + sentence.length <= 300) {
        summary += sentence + ' ';
      } else if (summary.length === 0 && sentence) {
        // Include at least one sentence even if it's long
        summary = sentence.substring(0, 300) + '...';
        break;
      } else {
        break;
      }
    }

    return summary.trim() || '(Content summary unavailable)';
  }

  /**
   * Gets a brief summary of the current story memory
   * 
   * @param memory - The story memory to summarize
   * @returns A human-readable summary of the story memory
   */
  getSummary(memory: StoryMemory): string {
    const parts: string[] = [];

    // Characters summary
    if (memory.characters.length > 0) {
      const characterNames = memory.characters.map(c => c.name).join(', ');
      parts.push(`Characters: ${characterNames}`);
    }

    // Setting summary
    if (memory.worldBuilding.setting || memory.worldBuilding.locations.length > 0) {
      const setting = memory.worldBuilding.setting || 'Unknown';
      const locations = memory.worldBuilding.locations.join(', ');
      parts.push(`Setting: ${setting}${locations ? ` (${locations})` : ''}`);
    }

    // Events summary
    if (memory.majorEvents.length > 0) {
      parts.push(`Major events: ${memory.majorEvents.length}`);
    }

    // Themes summary
    if (memory.themes.length > 0) {
      parts.push(`Themes: ${memory.themes.join(', ')}`);
    }

    return parts.join(' | ');
  }
}
