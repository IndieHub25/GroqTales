/**
 * Canvas Utilities
 * Helper functions for managing canvas state, nodes, edges, and operations
 */

import {
  CanvasNode,
  CanvasEdge,
  CanvasState,
  CanvasView,
  CanvasNodeType,
  CanvasEdgeType,
  TimelineNode,
  ComicPanel,
} from '@/types/canvas';

/**
 * Canvas State Initialization
 */
export function createEmptyCanvasState(): CanvasState {
  return {
    nodes: [],
    edges: [],
    view: {
      zoom: 1,
      panX: 0,
      panY: 0,
    },
    isDragging: false,
    mode: 'edit',
  };
}

/**
 * Node Management Functions
 */

export function createNode(
  type: CanvasNodeType,
  label: string,
  x: number,
  y: number,
  width: number = 120,
  height: number = 60,
  metadata?: Record<string, any>
): CanvasNode {
  return {
    id: generateId(),
    type,
    label,
    x,
    y,
    width,
    height,
    metadata,
    isSelected: false,
  };
}

export function addNode(state: CanvasState, node: CanvasNode): CanvasState {
  return {
    ...state,
    nodes: [...state.nodes, node],
  };
}

export function updateNode(state: CanvasState, nodeId: string, updates: Partial<CanvasNode>): CanvasState {
  return {
    ...state,
    nodes: state.nodes.map(n => (n.id === nodeId ? { ...n, ...updates } : n)),
  };
}

export function deleteNode(state: CanvasState, nodeId: string): CanvasState {
  const newNodes = state.nodes.filter(n => n.id !== nodeId);
  const newEdges = state.edges.filter(e => e.from !== nodeId && e.to !== nodeId);

  return {
    ...state,
    nodes: newNodes,
    edges: newEdges,
    selectedNodeId: state.selectedNodeId === nodeId ? undefined : state.selectedNodeId,
  };
}

export function moveNode(state: CanvasState, nodeId: string, x: number, y: number): CanvasState {
  return updateNode(state, nodeId, { x, y });
}

export function selectNode(state: CanvasState, nodeId: string | undefined): CanvasState {
  const nodes = state.nodes.map(n => ({
    ...n,
    isSelected: n.id === nodeId,
  }));

  return {
    ...state,
    nodes,
    selectedNodeId: nodeId,
  };
}

export function getNodeById(state: CanvasState, nodeId: string): CanvasNode | undefined {
  return state.nodes.find(n => n.id === nodeId);
}

export function getNodesByType(state: CanvasState, type: CanvasNodeType): CanvasNode[] {
  return state.nodes.filter(n => n.type === type);
}

/**
 * Edge Management Functions
 */

export function createEdge(
  from: string,
  to: string,
  type: CanvasEdgeType = 'sequence',
  label?: string
): CanvasEdge {
  return {
    id: generateId(),
    from,
    to,
    type,
    label,
    curved: false,
    dashed: false,
  };
}

export function addEdge(state: CanvasState, edge: CanvasEdge): CanvasState {
  // Check if edge already exists
  const exists = state.edges.some(e => e.from === edge.from && e.to === edge.to);
  if (exists) return state;

  return {
    ...state,
    edges: [...state.edges, edge],
  };
}

export function deleteEdge(state: CanvasState, edgeId: string): CanvasState {
  return {
    ...state,
    edges: state.edges.filter(e => e.id !== edgeId),
  };
}

export function deleteEdgesBetweenNodes(
  state: CanvasState,
  fromNodeId: string,
  toNodeId: string
): CanvasState {
  return {
    ...state,
    edges: state.edges.filter(e => !(e.from === fromNodeId && e.to === toNodeId)),
  };
}

export function getEdgeById(state: CanvasState, edgeId: string): CanvasEdge | undefined {
  return state.edges.find(e => e.id === edgeId);
}

export function getConnectedNodes(state: CanvasState, nodeId: string): {
  incoming: CanvasNode[];
  outgoing: CanvasNode[];
} {
  const incoming = state.nodes.filter(n =>
    state.edges.some(e => e.from === n.id && e.to === nodeId)
  );
  const outgoing = state.nodes.filter(n =>
    state.edges.some(e => e.from === nodeId && e.to === n.id)
  );

  return { incoming, outgoing };
}

/**
 * View Management (Zoom & Pan)
 */

export function zoomIn(state: CanvasState, factor: number = 1.1): CanvasState {
  return {
    ...state,
    view: {
      ...state.view,
      zoom: Math.min(state.view.zoom * factor, 3), // Max zoom 300%
    },
  };
}

export function zoomOut(state: CanvasState, factor: number = 1.1): CanvasState {
  return {
    ...state,
    view: {
      ...state.view,
      zoom: Math.max(state.view.zoom / factor, 0.5), // Min zoom 50%
    },
  };
}

export function resetZoom(state: CanvasState): CanvasState {
  return {
    ...state,
    view: {
      ...state.view,
      zoom: 1,
    },
  };
}

export function pan(state: CanvasState, deltaX: number, deltaY: number): CanvasState {
  return {
    ...state,
    view: {
      ...state.view,
      panX: state.view.panX + deltaX,
      panY: state.view.panY + deltaY,
    },
  };
}

export function centerView(state: CanvasState): CanvasState {
  return {
    ...state,
    view: {
      zoom: 1,
      panX: 0,
      panY: 0,
    },
  };
}

/**
 * Selection Management
 */

export function getSelectedNode(state: CanvasState): CanvasNode | undefined {
  return state.nodes.find(n => n.isSelected);
}

export function clearSelection(state: CanvasState): CanvasState {
  return {
    ...state,
    nodes: state.nodes.map(n => ({ ...n, isSelected: false })),
    selectedNodeId: undefined,
    selectedEdgeId: undefined,
  };
}

/**
 * Mode Management
 */

export function setCanvasMode(state: CanvasState, mode: 'view' | 'edit' | 'connection'): CanvasState {
  return {
    ...state,
    mode,
  };
}

/**
 * Layout & Organization
 */

export function autoLayoutLinear(state: CanvasState, spacing: number = 200): CanvasState {
  let newNodes = [...state.nodes];

  // Find start node or use first node
  let currentNode = newNodes.find(n => n.type === 'start');
  if (!currentNode && newNodes.length > 0) {
    currentNode = newNodes[0];
  }

  if (!currentNode) return state;

  let xPos = 100;
  let yPos = 200;
  const visited = new Set<string>();
  const queue = [currentNode.id];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (!nodeId || visited.has(nodeId)) continue;

    visited.add(nodeId);
    const node = newNodes.find(n => n.id === nodeId);
    if (node) {
      node.x = xPos;
      node.y = yPos;
      xPos += spacing;

      // Add connected nodes to queue
      const edges = state.edges.filter(e => e.from === nodeId);
      edges.forEach(e => {
        if (!visited.has(e.to)) {
          queue.push(e.to);
        }
      });
    }
  }

  return {
    ...state,
    nodes: newNodes,
  };
}

export function autoLayoutHierarchical(state: CanvasState): CanvasState {
  const levels: Map<string, number> = new Map();
  const visited = new Set<string>();

  function assignLevel(nodeId: string, level: number): void {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    levels.set(nodeId, level);

    const edges = state.edges.filter(e => e.from === nodeId);
    edges.forEach(e => {
      assignLevel(e.to, level + 1);
    });
  }

  // Start from start nodes
  const startNodes = state.nodes.filter(n => n.type === 'start');
  if (startNodes.length === 0 && state.nodes.length > 0) {
    assignLevel(state.nodes[0].id, 0);
  } else {
    startNodes.forEach(n => assignLevel(n.id, 0));
  }

  // Assign positions
  const levelNodeMap: Map<number, string[]> = new Map();
  levels.forEach((level, nodeId) => {
    if (!levelNodeMap.has(level)) {
      levelNodeMap.set(level, []);
    }
    levelNodeMap.get(level)!.push(nodeId);
  });

  const newNodes = state.nodes.map(n => {
    const level = levels.get(n.id) ?? 0;
    const nodesAtLevel = levelNodeMap.get(level) ?? [];
    const index = nodesAtLevel.indexOf(n.id);

    return {
      ...n,
      x: level * 250 + 100,
      y: (index - (nodesAtLevel.length - 1) / 2) * 150 + 300,
    };
  });

  return {
    ...state,
    nodes: newNodes,
  };
}

/**
 * Validation & Analysis
 */

export function getOrphanedNodes(state: CanvasState): CanvasNode[] {
  return state.nodes.filter(n => {
    const hasConnection = state.edges.some(e => e.from === n.id || e.to === n.id);
    return !hasConnection && n.type !== 'start' && n.type !== 'end';
  });
}

export function detectCycles(state: CanvasState): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const edges = state.edges.filter(e => e.from === nodeId);
    for (const edge of edges) {
      if (!visited.has(edge.to)) {
        if (hasCycle(edge.to)) return true;
      } else if (recursionStack.has(edge.to)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of state.nodes) {
    if (!visited.has(node.id)) {
      if (hasCycle(node.id)) return true;
    }
  }

  return false;
}

export function getCanvasMetrics(state: CanvasState): {
  nodeCount: number;
  edgeCount: number;
  averageConnectionsPerNode: number;
  hasOrphanedNodes: boolean;
  hasCycles: boolean;
} {
  return {
    nodeCount: state.nodes.length,
    edgeCount: state.edges.length,
    averageConnectionsPerNode:
      state.nodes.length > 0
        ? state.edges.length / state.nodes.length
        : 0,
    hasOrphanedNodes: getOrphanedNodes(state).length > 0,
    hasCycles: detectCycles(state),
  };
}

/**
 * Comic-Specific Helpers
 */

export function createComicPanel(
  panelNumber: number,
  sceneDescription: string,
  dialogue: string = '',
  notes: string = ''
): ComicPanel {
  return {
    id: generateId(),
    type: 'panel',
    panelNumber,
    label: `Panel ${panelNumber}`,
    sceneDescription,
    dialogue,
    notes,
    x: (panelNumber % 3) * 200 + 50,
    y: Math.floor(panelNumber / 3) * 200 + 50,
    width: 180,
    height: 180,
    isSelected: false,
  };
}

export function reorderComicPanels(state: CanvasState): CanvasState {
  const panels = state.nodes.filter(n => n.type === 'panel') as ComicPanel[];
  const sortedPanels = panels.sort((a, b) => a.panelNumber - b.panelNumber);

  let newNodes = [...state.nodes];
  sortedPanels.forEach((panel, index) => {
    const nodeIndex = newNodes.findIndex(n => n.id === panel.id);
    if (nodeIndex !== -1) {
      newNodes[nodeIndex] = {
        ...newNodes[nodeIndex],
        x: (index % 3) * 200 + 50,
        y: Math.floor(index / 3) * 200 + 50,
        order: index + 1,
      };
    }
  });

  return {
    ...state,
    nodes: newNodes,
  };
}

/**
 * Utility Functions
 */

export function generateId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateBoundingBox(
  nodes: CanvasNode[]
): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  const minX = Math.min(...nodes.map(n => n.x));
  const minY = Math.min(...nodes.map(n => n.y));
  const maxX = Math.max(...nodes.map(n => n.x + n.width));
  const maxY = Math.max(...nodes.map(n => n.y + n.height));

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function fitToView(state: CanvasState, viewportWidth: number, viewportHeight: number): CanvasState {
  if (state.nodes.length === 0) return state;

  const bbox = calculateBoundingBox(state.nodes);
  const padding = 50;

  const zoomX = (viewportWidth - padding * 2) / bbox.width;
  const zoomY = (viewportHeight - padding * 2) / bbox.height;
  const zoom = Math.min(zoomX, zoomY, 2); // Max 200%

  const panX = -bbox.minX * zoom + padding;
  const panY = -bbox.minY * zoom + padding;

  return {
    ...state,
    view: {
      zoom,
      panX,
      panY,
    },
  };
}

export function exportCanvasAsJSON(state: CanvasState): string {
  return JSON.stringify(state, null, 2);
}

export function importCanvasFromJSON(json: string): CanvasState | null {
  try {
    return JSON.parse(json) as CanvasState;
  } catch {
    return null;
  }
}

export function cloneNode(node: CanvasNode, offsetX: number = 50, offsetY: number = 50): CanvasNode {
  return {
    ...JSON.parse(JSON.stringify(node)),
    id: generateId(),
    x: node.x + offsetX,
    y: node.y + offsetY,
    isSelected: false,
  };
}

export function duplicateNode(state: CanvasState, nodeId: string): CanvasState {
  const node = getNodeById(state, nodeId);
  if (!node) return state;

  const clonedNode = cloneNode(node);
  return addNode(state, clonedNode);
}
