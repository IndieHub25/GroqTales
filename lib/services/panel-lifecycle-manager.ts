/**
 * PanelLifecycleManager - Enforces sequential panel creation and validation
 * 
 * This service ensures that panels are created in strict sequential order (1→7)
 * and that panel N cannot be created without panel N-1 existing.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { PanelData } from '@/lib/types/story-session';

export class PanelLifecycleManager {
  private readonly MIN_PANELS = 1;
  private readonly MAX_PANELS = 7;

  /**
   * Checks if a panel can be created based on sequential ordering rules
   * 
   * Requirements: 1.3, 9.3
   * 
   * @param panelIndex - The index of the panel to create (1-7)
   * @param existingPanels - Array of existing panels in the story session
   * @returns true if the panel can be created, false otherwise
   */
  canCreatePanel(panelIndex: number, existingPanels: PanelData[]): boolean {
    // Validate panel index is within valid range (1-7)
    if (panelIndex < this.MIN_PANELS || panelIndex > this.MAX_PANELS) {
      return false;
    }

    // Panel 1 can always be created if it doesn't exist
    if (panelIndex === 1) {
      return !existingPanels.some(panel => panel.panelIndex === 1);
    }

    // For panels 2-7, check that the previous panel exists and is complete
    const previousPanelIndex = panelIndex - 1;
    const previousPanel = existingPanels.find(
      panel => panel.panelIndex === previousPanelIndex
    );

    // Previous panel must exist and be complete
    return previousPanel !== undefined && this.isPanelComplete(previousPanel);
  }

  /**
   * Validates that all panels in a session follow sequential ordering
   * 
   * Requirements: 1.3, 1.4, 9.5
   * 
   * @param panels - Array of panels to validate
   * @returns Object indicating if sequence is valid with any error messages
   */
  validatePanelSequence(panels: PanelData[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for duplicate panel indices
    const indices = panels.map(p => p.panelIndex);
    const uniqueIndices = new Set(indices);
    if (indices.length !== uniqueIndices.size) {
      errors.push('Duplicate panel indices detected');
    }

    // Check that all panel indices are within valid range
    const invalidIndices = panels.filter(
      p => p.panelIndex < this.MIN_PANELS || p.panelIndex > this.MAX_PANELS
    );
    if (invalidIndices.length > 0) {
      errors.push(
        `Invalid panel indices found: ${invalidIndices.map(p => p.panelIndex).join(', ')}`
      );
    }

    // Check for sequential ordering - no gaps allowed
    const sortedPanels = [...panels].sort((a, b) => a.panelIndex - b.panelIndex);
    for (let i = 0; i < sortedPanels.length; i++) {
      const expectedIndex = i + 1;
      const currentPanel = sortedPanels[i];
      if (currentPanel && currentPanel.panelIndex !== expectedIndex) {
        errors.push(
          `Panel sequence has gaps. Expected panel ${expectedIndex}, found panel ${currentPanel.panelIndex}`
        );
        break;
      }
    }

    // Check that panel 1 exists if there are any panels
    if (panels.length > 0 && !panels.some(p => p.panelIndex === 1)) {
      errors.push('Panel 1 must exist before other panels can be created');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Determines the next available panel index based on existing panels
   * 
   * Requirements: 1.4, 1.5, 9.2
   * 
   * @param panels - Array of existing panels
   * @returns The next panel index that can be created (1-7), or -1 if story is complete
   */
  getNextPanelIndex(panels: PanelData[]): number {
    // If no panels exist, start with panel 1
    if (panels.length === 0) {
      return 1;
    }

    // If we have 7 panels, the story is complete
    if (panels.length >= this.MAX_PANELS) {
      return -1;
    }

    // Find the highest completed panel index
    const completedPanels = panels.filter(p => this.isPanelComplete(p));
    
    if (completedPanels.length === 0) {
      // No completed panels, can only work on panel 1
      return panels.some(p => p.panelIndex === 1) ? -1 : 1;
    }

    const maxCompletedIndex = Math.max(
      ...completedPanels.map(p => p.panelIndex)
    );

    // Next panel is one after the highest completed panel
    const nextIndex = maxCompletedIndex + 1;

    // Return next index if within valid range, otherwise -1 (story complete)
    return nextIndex <= this.MAX_PANELS ? nextIndex : -1;
  }

  /**
   * Checks if a panel is complete and ready for the next panel to be created
   * 
   * Requirements: 1.5, 9.2
   * 
   * @param panel - The panel to check for completion
   * @returns true if the panel is complete, false otherwise
   */
  isPanelComplete(panel: PanelData): boolean {
    // Panel must have 'complete' status
    if (panel.status !== 'complete') {
      return false;
    }

    // Panel must have generated content
    if (!panel.generatedContent || panel.generatedContent.trim().length === 0) {
      return false;
    }

    // Panel must have a valid word count
    if (!panel.wordCount || panel.wordCount <= 0) {
      return false;
    }

    // Panel must have a title
    if (!panel.title || panel.title.trim().length === 0) {
      return false;
    }

    // Panel must have been generated (has generatedAt timestamp)
    if (!panel.metadata.generatedAt) {
      return false;
    }

    return true;
  }

  /**
   * Gets the total number of complete panels in a session
   * 
   * @param panels - Array of panels to count
   * @returns Number of complete panels
   */
  getCompletePanelCount(panels: PanelData[]): number {
    return panels.filter(p => this.isPanelComplete(p)).length;
  }

  /**
   * Checks if a story session is complete (has 7 complete panels)
   * 
   * Requirements: 1.2
   * 
   * @param panels - Array of panels in the session
   * @returns true if the story has 7 complete panels
   */
  isStoryComplete(panels: PanelData[]): boolean {
    return this.getCompletePanelCount(panels) === this.MAX_PANELS;
  }

  /**
   * Gets a user-friendly error message for why a panel cannot be created
   * 
   * Requirements: 9.4
   * 
   * @param panelIndex - The panel index that cannot be created
   * @param existingPanels - Array of existing panels
   * @returns Error message explaining why the panel cannot be created
   */
  getCreationErrorMessage(panelIndex: number, existingPanels: PanelData[]): string {
    if (panelIndex < this.MIN_PANELS || panelIndex > this.MAX_PANELS) {
      return `Panel index must be between ${this.MIN_PANELS} and ${this.MAX_PANELS}`;
    }

    if (panelIndex === 1) {
      if (existingPanels.some(p => p.panelIndex === 1)) {
        return 'Panel 1 already exists';
      }
      return 'Panel 1 can be created';
    }

    const previousPanelIndex = panelIndex - 1;
    const previousPanel = existingPanels.find(
      p => p.panelIndex === previousPanelIndex
    );

    if (!previousPanel) {
      return `Panel ${panelIndex} cannot be created because Panel ${previousPanelIndex} does not exist. Panels must be created sequentially.`;
    }

    if (!this.isPanelComplete(previousPanel)) {
      return `Panel ${panelIndex} cannot be created because Panel ${previousPanelIndex} is not complete. Please complete Panel ${previousPanelIndex} first.`;
    }

    return `Panel ${panelIndex} can be created`;
  }
}
