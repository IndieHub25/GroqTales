/**
 * Canvas and Story Structure Types
 * Used for all canvas-based story builders across comic, text, and AI story routes
 */

/**
 * Canvas Node Types - represent story elements on the canvas
 */
export type CanvasNodeType = 
  | 'story-beat'      // A key plot point or narrative beat
  | 'chapter'         // Chapter or section
  | 'scene'           // Individual scene
  | 'character'       // Character introduction/focus
  | 'decision-point'  // Branching decision
  | 'timeline-event'  // Timeline event
  | 'panel'           // Comic panel (for comics only)
  | 'act'             // Act in the story structure
  | 'start'           // Story start
  | 'end';            // Story end

export interface CanvasNode {
  id: string;
  type: CanvasNodeType;
  label: string;
  description?: string;
  content?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected?: boolean;
  order?: number; // For linear sequences
  color?: string;
  icon?: string;
  metadata?: Record<string, any>;
}

/**
 * Canvas Edge Types - represent connections between nodes
 */
export type CanvasEdgeType = 'sequence' | 'flashback' | 'parallel' | 'causality' | 'relationship';

export interface CanvasEdge {
  id: string;
  from: string; // Node id
  to: string;   // Node id
  type: CanvasEdgeType;
  label?: string;
  curved?: boolean;
  dashed?: boolean;
}

/**
 * Canvas State and Configuration
 */
export interface CanvasView {
  zoom: number;
  panX: number;
  panY: number;
}

export interface CanvasState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  view: CanvasView;
  selectedNodeId?: string;
  selectedEdgeId?: string;
  isDragging: boolean;
  mode: 'view' | 'edit' | 'connection';
}

/**
 * Story Structure Presets
 */
export interface StoryStructurePreset {
  name: string;
  description: string;
  defaultNodes: CanvasNode[];
  defaultEdges: CanvasEdge[];
  icon: string;
}

export const STORY_STRUCTURE_PRESETS: Record<string, StoryStructurePreset> = {
  'three-act': {
    name: 'Three-Act Structure',
    description: 'Classic setup-confrontation-resolution structure',
    icon: '📊',
    defaultNodes: [
      { id: 'start', type: 'start', label: 'Story Start', x: 50, y: 200, width: 120, height: 60 },
      { id: 'act-1', type: 'act', label: 'Act One: Setup', x: 250, y: 100, width: 150, height: 80, color: '#FFE66D' },
      { id: 'act-2', type: 'act', label: 'Act Two: Confrontation', x: 500, y: 50, width: 150, height: 80, color: '#4ECDC4' },
      { id: 'act-3', type: 'act', label: 'Act Three: Resolution', x: 750, y: 100, width: 150, height: 80, color: '#95E1D3' },
      { id: 'end', type: 'end', label: 'Story End', x: 950, y: 200, width: 120, height: 60 },
    ],
    defaultEdges: [
      { id: 'e1', from: 'start', to: 'act-1', type: 'sequence' },
      { id: 'e2', from: 'act-1', to: 'act-2', type: 'sequence' },
      { id: 'e3', from: 'act-2', to: 'act-3', type: 'sequence' },
      { id: 'e4', from: 'act-3', to: 'end', type: 'sequence' },
    ],
  },
  'five-act': {
    name: 'Five-Act Structure',
    description: 'Exposition-rising-climax-falling-denouement',
    icon: '📖',
    defaultNodes: [
      { id: 'start', type: 'start', label: 'Start', x: 50, y: 200, width: 100, height: 60 },
      { id: 'act-1', type: 'act', label: 'Exposition', x: 200, y: 100, width: 120, height: 70 },
      { id: 'act-2', type: 'act', label: 'Rising Action', x: 380, y: 50, width: 120, height: 70 },
      { id: 'act-3', type: 'act', label: 'Climax', x: 560, y: 100, width: 120, height: 70, color: '#FF6B6B' },
      { id: 'act-4', type: 'act', label: 'Falling Action', x: 740, y: 150, width: 120, height: 70 },
      { id: 'act-5', type: 'act', label: 'Denouement', x: 920, y: 200, width: 120, height: 70 },
      { id: 'end', type: 'end', label: 'End', x: 1100, y: 200, width: 100, height: 60 },
    ],
    defaultEdges: [
      { id: 'e1', from: 'start', to: 'act-1', type: 'sequence' },
      { id: 'e2', from: 'act-1', to: 'act-2', type: 'sequence' },
      { id: 'e3', from: 'act-2', to: 'act-3', type: 'sequence' },
      { id: 'e4', from: 'act-3', to: 'act-4', type: 'sequence' },
      { id: 'e5', from: 'act-4', to: 'act-5', type: 'sequence' },
      { id: 'e6', from: 'act-5', to: 'end', type: 'sequence' },
    ],
  },
  'hero-journey': {
    name: 'Hero\'s Journey',
    description: 'Monomyth: call-crossing-tests-ordeal-return',
    icon: '🏆',
    defaultNodes: [
      { id: 'start', type: 'start', label: 'Ordinary World', x: 50, y: 200, width: 120, height: 60 },
      { id: 'beat1', type: 'story-beat', label: 'Call to Adventure', x: 250, y: 120, width: 130, height: 60 },
      { id: 'beat2', type: 'story-beat', label: 'Crossing the Threshold', x: 450, y: 80, width: 130, height: 60 },
      { id: 'beat3', type: 'story-beat', label: 'Tests & Allies', x: 650, y: 100, width: 130, height: 60 },
      { id: 'beat4', type: 'story-beat', label: 'Ordeal', x: 850, y: 180, width: 130, height: 60, color: '#FF6B6B' },
      { id: 'beat5', type: 'story-beat', label: 'Reward & Return', x: 1050, y: 240, width: 130, height: 60 },
      { id: 'end', type: 'end', label: 'New Ordinary World', x: 1250, y: 200, width: 130, height: 60 },
    ],
    defaultEdges: [
      { id: 'e1', from: 'start', to: 'beat1', type: 'sequence' },
      { id: 'e2', from: 'beat1', to: 'beat2', type: 'sequence' },
      { id: 'e3', from: 'beat2', to: 'beat3', type: 'sequence' },
      { id: 'e4', from: 'beat3', to: 'beat4', type: 'sequence' },
      { id: 'e5', from: 'beat4', to: 'beat5', type: 'sequence' },
      { id: 'e6', from: 'beat5', to: 'end', type: 'sequence' },
    ],
  },
  'chapter-timeline': {
    name: 'Chapter Timeline',
    description: 'Linear sequence of chapters for easy navigation',
    icon: '📚',
    defaultNodes: [
      { id: 'ch-1', type: 'chapter', label: 'Chapter 1', x: 100, y: 200, width: 100, height: 60, order: 1 },
      { id: 'ch-2', type: 'chapter', label: 'Chapter 2', x: 250, y: 200, width: 100, height: 60, order: 2 },
      { id: 'ch-3', type: 'chapter', label: 'Chapter 3', x: 400, y: 200, width: 100, height: 60, order: 3 },
    ],
    defaultEdges: [
      { id: 'e1', from: 'ch-1', to: 'ch-2', type: 'sequence' },
      { id: 'e2', from: 'ch-2', to: 'ch-3', type: 'sequence' },
    ],
  },
};

/**
 * Comic-specific Canvas Types
 */
export interface ComicPanel extends CanvasNode {
  type: 'panel';
  panelNumber: number;
  sceneDescription: string;
  dialogue: string;
  notes: string;
  imageUrl?: string;
  artistNotes?: string;
}

export interface ComicPageLayout {
  panelsPerPage: number;
  panelArrangement: 'grid' | 'custom' | 'dynamic';
}

/**
 * Story Timeline Node
 */
export interface TimelineNode extends CanvasNode {
  timestamp?: string;
  duration?: string;
  isCurrentEvent?: boolean;
}

/**
 * Canvas Export/Import Formats
 */
export interface CanvasSnapshot {
  version: string;
  timestamp: string;
  storyType: 'text' | 'comic' | 'ai-story';
  canvasState: CanvasState;
  metadata: {
    title?: string;
    description?: string;
    author?: string;
    tags?: string[];
  };
}
