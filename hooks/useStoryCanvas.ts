/**
 * useStoryCanvas Hook
 * Manages canvas state for story creation across text, comic, and AI story routes
 * Handles persistence, initialization, and common operations
 */

import { useState, useCallback, useEffect } from 'react';
import { CanvasState } from '@/types/canvas';
import * as canvasUtils from '@/lib/canvas-utils';

interface UseStoryCanvasOptions {
  storageKey?: string;
  autoLoad?: boolean;
  autoSave?: boolean;
}

export function useStoryCanvas(options: UseStoryCanvasOptions = {}) {
  const {
    storageKey = 'storyCanvasState',
    autoLoad = true,
    autoSave = true,
  } = options;

  const [canvasState, setCanvasState] = useState<CanvasState>(createEmptyCanvasState());
  const [isDirty, setIsDirty] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load canvas state from storage on mount
  useEffect(() => {
    if (!autoLoad) {
      setHasLoaded(true);
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const loaded = JSON.parse(stored) as CanvasState;
        setCanvasState(loaded);
      }
    } catch (error) {
      console.error('Failed to load canvas state:', error);
    }

    setHasLoaded(true);
  }, [storageKey, autoLoad]);

  // Auto-save when state changes
  useEffect(() => {
    if (!autoSave || !isDirty || !hasLoaded) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(canvasState));
        setIsDirty(false);
      } catch (error) {
        console.error('Failed to save canvas state:', error);
      }
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timer);
  }, [canvasState, isDirty, autoSave, storageKey, hasLoaded]);

  // Wrapped state setter that marks as dirty
  const updateCanvasState = useCallback((newState: CanvasState) => {
    setCanvasState(newState);
    setIsDirty(true);
  }, []);

  // Canvas operations
  const addNode = useCallback(
    (type, label, x, y, width?, height?, metadata?) => {
      const node = canvasUtils.createNode(type, label, x, y, width, height, metadata);
      updateCanvasState(canvasUtils.addNode(canvasState, node));
      return node;
    },
    [canvasState, updateCanvasState]
  );

  const removeNode = useCallback(
    (nodeId: string) => {
      updateCanvasState(canvasUtils.deleteNode(canvasState, nodeId));
    },
    [canvasState, updateCanvasState]
  );

  const updateNode = useCallback(
    (nodeId: string, updates) => {
      updateCanvasState(canvasUtils.updateNode(canvasState, nodeId, updates));
    },
    [canvasState, updateCanvasState]
  );

  const moveNode = useCallback(
    (nodeId: string, x: number, y: number) => {
      updateCanvasState(canvasUtils.moveNode(canvasState, nodeId, x, y));
    },
    [canvasState, updateCanvasState]
  );

  const addEdge = useCallback(
    (fromId: string, toId: string, type?, label?) => {
      const edge = canvasUtils.createEdge(fromId, toId, type, label);
      updateCanvasState(canvasUtils.addEdge(canvasState, edge));
      return edge;
    },
    [canvasState, updateCanvasState]
  );

  const removeEdge = useCallback(
    (edgeId: string) => {
      updateCanvasState(canvasUtils.deleteEdge(canvasState, edgeId));
    },
    [canvasState, updateCanvasState]
  );

  const clear = useCallback(() => {
    updateCanvasState(canvasUtils.createEmptyCanvasState());
  }, [updateCanvasState]);

  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }, [storageKey]);

  const save = useCallback(async () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(canvasState));
      setIsDirty(false);
      return true;
    } catch (error) {
      console.error('Failed to save canvas state:', error);
      return false;
    }
  }, [canvasState, storageKey]);

  const load = useCallback(async () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const loaded = JSON.parse(stored) as CanvasState;
        setCanvasState(loaded);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load canvas state:', error);
      return false;
    }
  }, [storageKey]);

  const autoLayout = useCallback(() => {
    updateCanvasState(canvasUtils.autoLayoutLinear(canvasState));
  }, [canvasState, updateCanvasState]);

  const fitToView = useCallback((width: number, height: number) => {
    updateCanvasState(canvasUtils.fitToView(canvasState, width, height));
  }, [canvasState, updateCanvasState]);

  return {
    // State
    canvasState,
    setCanvasState: updateCanvasState,
    isDirty,
    hasLoaded,

    // Node operations
    addNode,
    removeNode,
    updateNode,
    moveNode,

    // Edge operations
    addEdge,
    removeEdge,

    // Canvas operations
    clear,
    clearStorage,
    save,
    load,
    autoLayout,
    fitToView,
  };
}

// Helper function for initializing empty canvas state
function createEmptyCanvasState(): CanvasState {
  return canvasUtils.createEmptyCanvasState();
}

export default useStoryCanvas;
