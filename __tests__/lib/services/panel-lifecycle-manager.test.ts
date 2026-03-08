/**
 * Unit tests for PanelLifecycleManager
 * 
 * Tests sequential panel creation, validation, and completion status
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { PanelLifecycleManager } from '@/lib/services/panel-lifecycle-manager';
import { PanelData } from '@/lib/types/story-session';

describe('PanelLifecycleManager', () => {
  let manager: PanelLifecycleManager;

  beforeEach(() => {
    manager = new PanelLifecycleManager();
  });

  // Helper function to create a mock panel
  const createMockPanel = (
    panelIndex: number,
    status: 'pending' | 'generating' | 'complete' | 'error' = 'complete',
    generatedContent: string = 'Test content',
    wordCount: number = 100
  ): PanelData => ({
    panelIndex,
    title: `Panel ${panelIndex}`,
    parameters: {},
    generatedContent,
    wordCount,
    status,
    metadata: {
      createdAt: new Date(),
      generatedAt: status === 'complete' ? new Date() : undefined,
      tokensUsed: {
        groq: 100,
        gemini: 200
      }
    }
  });

  describe('canCreatePanel', () => {
    it('should allow creating panel 1 when no panels exist', () => {
      expect(manager.canCreatePanel(1, [])).toBe(true);
    });

    it('should not allow creating panel 1 if it already exists', () => {
      const panels = [createMockPanel(1)];
      expect(manager.canCreatePanel(1, panels)).toBe(false);
    });

    it('should allow creating panel 2 when panel 1 is complete', () => {
      const panels = [createMockPanel(1)];
      expect(manager.canCreatePanel(2, panels)).toBe(true);
    });

    it('should not allow creating panel 2 when panel 1 does not exist', () => {
      expect(manager.canCreatePanel(2, [])).toBe(false);
    });

    it('should not allow creating panel 2 when panel 1 is not complete', () => {
      const panels = [createMockPanel(1, 'pending')];
      expect(manager.canCreatePanel(2, panels)).toBe(false);
    });

    it('should allow creating panel 7 when panel 6 is complete', () => {
      const panels = [
        createMockPanel(1),
        createMockPanel(2),
        createMockPanel(3),
        createMockPanel(4),
        createMockPanel(5),
        createMockPanel(6)
      ];
      expect(manager.canCreatePanel(7, panels)).toBe(true);
    });

    it('should not allow creating panel with index < 1', () => {
      expect(manager.canCreatePanel(0, [])).toBe(false);
      expect(manager.canCreatePanel(-1, [])).toBe(false);
    });

    it('should not allow creating panel with index > 7', () => {
      const panels = [
        createMockPanel(1),
        createMockPanel(2),
        createMockPanel(3),
        createMockPanel(4),
        createMockPanel(5),
        createMockPanel(6),
        createMockPanel(7)
      ];
      expect(manager.canCreatePanel(8, panels)).toBe(false);
    });

    it('should not allow skipping panels', () => {
      const panels = [createMockPanel(1)];
      expect(manager.canCreatePanel(3, panels)).toBe(false);
    });
  });

  describe('validatePanelSequence', () => {
    it('should validate an empty panel array', () => {
      const result = manager.validatePanelSequence([]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a single panel 1', () => {
      const panels = [createMockPanel(1)];
      const result = manager.validatePanelSequence(panels);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate sequential panels 1-7', () => {
      const panels = [
        createMockPanel(1),
        createMockPanel(2),
        createMockPanel(3),
        createMockPanel(4),
        createMockPanel(5),
        createMockPanel(6),
        createMockPanel(7)
      ];
      const result = manager.validatePanelSequence(panels);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect duplicate panel indices', () => {
      const panels = [
        createMockPanel(1),
        createMockPanel(1)
      ];
      const result = manager.validatePanelSequence(panels);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate panel indices detected');
    });

    it('should detect invalid panel indices', () => {
      const panels = [
        createMockPanel(0),
        createMockPanel(1)
      ];
      const result = manager.validatePanelSequence(panels);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid panel indices'))).toBe(true);
    });

    it('should detect gaps in panel sequence', () => {
      const panels = [
        createMockPanel(1),
        createMockPanel(3)
      ];
      const result = manager.validatePanelSequence(panels);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('gaps'))).toBe(true);
    });

    it('should detect missing panel 1', () => {
      const panels = [
        createMockPanel(2),
        createMockPanel(3)
      ];
      const result = manager.validatePanelSequence(panels);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Panel 1 must exist'))).toBe(true);
    });

    it('should validate panels in any order (sorts internally)', () => {
      const panels = [
        createMockPanel(3),
        createMockPanel(1),
        createMockPanel(2)
      ];
      const result = manager.validatePanelSequence(panels);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('getNextPanelIndex', () => {
    it('should return 1 when no panels exist', () => {
      expect(manager.getNextPanelIndex([])).toBe(1);
    });

    it('should return 2 when panel 1 is complete', () => {
      const panels = [createMockPanel(1)];
      expect(manager.getNextPanelIndex(panels)).toBe(2);
    });

    it('should return -1 when panel 1 exists but is not complete', () => {
      const panels = [createMockPanel(1, 'pending')];
      expect(manager.getNextPanelIndex(panels)).toBe(-1);
    });

    it('should return 7 when panels 1-6 are complete', () => {
      const panels = [
        createMockPanel(1),
        createMockPanel(2),
        createMockPanel(3),
        createMockPanel(4),
        createMockPanel(5),
        createMockPanel(6)
      ];
      expect(manager.getNextPanelIndex(panels)).toBe(7);
    });

    it('should return -1 when all 7 panels are complete', () => {
      const panels = [
        createMockPanel(1),
        createMockPanel(2),
        createMockPanel(3),
        createMockPanel(4),
        createMockPanel(5),
        createMockPanel(6),
        createMockPanel(7)
      ];
      expect(manager.getNextPanelIndex(panels)).toBe(-1);
    });

    it('should return correct index when some panels are incomplete', () => {
      const panels = [
        createMockPanel(1),
        createMockPanel(2),
        createMockPanel(3, 'generating')
      ];
      expect(manager.getNextPanelIndex(panels)).toBe(3);
    });

    it('should handle non-sequential panel order', () => {
      const panels = [
        createMockPanel(3),
        createMockPanel(1),
        createMockPanel(2)
      ];
      expect(manager.getNextPanelIndex(panels)).toBe(4);
    });
  });

  describe('isPanelComplete', () => {
    it('should return true for a complete panel', () => {
      const panel = createMockPanel(1);
      expect(manager.isPanelComplete(panel)).toBe(true);
    });

    it('should return false for a pending panel', () => {
      const panel = createMockPanel(1, 'pending');
      expect(manager.isPanelComplete(panel)).toBe(false);
    });

    it('should return false for a generating panel', () => {
      const panel = createMockPanel(1, 'generating');
      expect(manager.isPanelComplete(panel)).toBe(false);
    });

    it('should return false for an error panel', () => {
      const panel = createMockPanel(1, 'error');
      expect(manager.isPanelComplete(panel)).toBe(false);
    });

    it('should return false for a panel with no generated content', () => {
      const panel = createMockPanel(1, 'complete', '');
      expect(manager.isPanelComplete(panel)).toBe(false);
    });

    it('should return false for a panel with whitespace-only content', () => {
      const panel = createMockPanel(1, 'complete', '   ');
      expect(manager.isPanelComplete(panel)).toBe(false);
    });

    it('should return false for a panel with zero word count', () => {
      const panel = createMockPanel(1, 'complete', 'Test content', 0);
      expect(manager.isPanelComplete(panel)).toBe(false);
    });

    it('should return false for a panel with no title', () => {
      const panel = createMockPanel(1);
      panel.title = '';
      expect(manager.isPanelComplete(panel)).toBe(false);
    });

    it('should return false for a panel with no generatedAt timestamp', () => {
      const panel = createMockPanel(1);
      panel.metadata.generatedAt = undefined;
      expect(manager.isPanelComplete(panel)).toBe(false);
    });
  });

  describe('getCompletePanelCount', () => {
    it('should return 0 for empty array', () => {
      expect(manager.getCompletePanelCount([])).toBe(0);
    });

    it('should return correct count for all complete panels', () => {
      const panels = [
        createMockPanel(1),
        createMockPanel(2),
        createMockPanel(3)
      ];
      expect(manager.getCompletePanelCount(panels)).toBe(3);
    });

    it('should return correct count for mixed complete and incomplete panels', () => {
      const panels = [
        createMockPanel(1),
        createMockPanel(2, 'pending'),
        createMockPanel(3),
        createMockPanel(4, 'generating')
      ];
      expect(manager.getCompletePanelCount(panels)).toBe(2);
    });

    it('should return 0 when no panels are complete', () => {
      const panels = [
        createMockPanel(1, 'pending'),
        createMockPanel(2, 'generating')
      ];
      expect(manager.getCompletePanelCount(panels)).toBe(0);
    });
  });

  describe('isStoryComplete', () => {
    it('should return false for empty story', () => {
      expect(manager.isStoryComplete([])).toBe(false);
    });

    it('should return false for story with less than 7 panels', () => {
      const panels = [
        createMockPanel(1),
        createMockPanel(2),
        createMockPanel(3)
      ];
      expect(manager.isStoryComplete(panels)).toBe(false);
    });

    it('should return true for story with 7 complete panels', () => {
      const panels = [
        createMockPanel(1),
        createMockPanel(2),
        createMockPanel(3),
        createMockPanel(4),
        createMockPanel(5),
        createMockPanel(6),
        createMockPanel(7)
      ];
      expect(manager.isStoryComplete(panels)).toBe(true);
    });

    it('should return false for story with 7 panels but not all complete', () => {
      const panels = [
        createMockPanel(1),
        createMockPanel(2),
        createMockPanel(3),
        createMockPanel(4),
        createMockPanel(5),
        createMockPanel(6),
        createMockPanel(7, 'pending')
      ];
      expect(manager.isStoryComplete(panels)).toBe(false);
    });
  });

  describe('getCreationErrorMessage', () => {
    it('should return error for invalid panel index < 1', () => {
      const message = manager.getCreationErrorMessage(0, []);
      expect(message).toContain('must be between 1 and 7');
    });

    it('should return error for invalid panel index > 7', () => {
      const message = manager.getCreationErrorMessage(8, []);
      expect(message).toContain('must be between 1 and 7');
    });

    it('should return error when panel 1 already exists', () => {
      const panels = [createMockPanel(1)];
      const message = manager.getCreationErrorMessage(1, panels);
      expect(message).toContain('already exists');
    });

    it('should return error when previous panel does not exist', () => {
      const message = manager.getCreationErrorMessage(2, []);
      expect(message).toContain('Panel 1 does not exist');
      expect(message).toContain('sequentially');
    });

    it('should return error when previous panel is not complete', () => {
      const panels = [createMockPanel(1, 'pending')];
      const message = manager.getCreationErrorMessage(2, panels);
      expect(message).toContain('not complete');
      expect(message).toContain('complete Panel 1 first');
    });

    it('should return success message when panel can be created', () => {
      const panels = [createMockPanel(1)];
      const message = manager.getCreationErrorMessage(2, panels);
      expect(message).toContain('can be created');
    });
  });
});
