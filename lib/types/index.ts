/**
 * Central export file for ComicCraft AI Story Studio types
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 4.1, 4.2
 */

export type {
  // Story Session Types
  StorySession,
  PanelData,
  PanelParameters,
  
  // Story Memory Types
  StoryMemory,
  CharacterMemory,
  WorldBuildingMemory,
  EventMemory,
  
  // Backend Integration Types
  BackendPayload,
  
  // Validation Types
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './story-session';
