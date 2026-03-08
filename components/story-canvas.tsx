'use client';

import React,{ useRef, useEffect, useState, useCallback } from 'react';
import { CanvasNode, CanvasEdge, CanvasState } from '@/types/canvas';
import * as canvasUtils from '@/lib/canvas-utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ZoomIn,
  ZoomOut,
  Home,
  Copy,
  Trash2,
  Move,
  Link2,
} from 'lucide-react';
import styles from '@/styles/canvas.module.css';

/**
 * StoryCanvas Component
 * A reusable, interactive canvas for visualizing and editing story structure
 * Used across text stories, comics, and AI story generation
 */

interface StoryCanvasProps {
  state: CanvasState;
  onChange: (newState: CanvasState) => void;
  width?: number;
  height?: number;
  readOnly?: boolean;
  onNodeClick?: (nodeId: string) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
  showMinimap?: boolean;
  showLabels?: boolean;
  gridSnap?: boolean;
}

export const StoryCanvas: React.FC<StoryCanvasProps> = ({
  state,
  onChange,
  width = 1000,
  height = 600,
  readOnly = false,
  onNodeClick,
  onNodeDoubleClick,
  onEdgeClick,
  showMinimap = true,
  showLabels = true,
  gridSnap = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCreatingEdge, setIsCreatingEdge] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle node drag start
  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      if (readOnly) return;
      e.preventDefault();
      e.stopPropagation();

      setIsDraggingNode(nodeId);
      const node = canvasUtils.getNodeById(state, nodeId);
      if (node) {
        setDragOffset({
          x: e.clientX - node.x,
          y: e.clientY - node.y,
        });
      }

      // Update selection
      if (!e.ctrlKey && !e.metaKey) {
        onChange(canvasUtils.selectNode(state, nodeId));
      }
    },
    [state, readOnly, onChange]
  );

  // Handle mouse move for dragging
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      if (isDraggingNode) {
        const box = svgRef.current?.getBoundingClientRect();
        if (box) {
          let newX = (e.clientX - box.left - dragOffset.x) / state.view.zoom;
          let newY = (e.clientY - box.top - dragOffset.y) / state.view.zoom;

          // Grid snap
          if (gridSnap) {
            const gridSize = 20;
            newX = Math.round(newX / gridSize) * gridSize;
            newY = Math.round(newY / gridSize) * gridSize;
          }

          onChange(canvasUtils.moveNode(state, isDraggingNode, newX - state.view.panX, newY - state.view.panY));
        }
      }
    },
    [isDraggingNode, dragOffset, state, onChange, gridSnap]
  );

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDraggingNode(null);
  };

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target === svgRef.current) {
      onChange(canvasUtils.clearSelection(state));
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readOnly) return;

      const selected = canvasUtils.getSelectedNode(state);

      if (e.key === 'Delete' && selected) {
        e.preventDefault();
        onChange(canvasUtils.deleteNode(state, selected.id));
      } else if (e.key === 'd' && (e.ctrlKey || e.metaKey) && selected) {
        e.preventDefault();
        onChange(canvasUtils.duplicateNode(state, selected.id));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, readOnly, onChange]);

  // Calculate transform
  const transform = `translate(${state.view.panX}, ${state.view.panY}) scale(${state.view.zoom})`;

  return (
    <div className={styles.canvasContainer}>
      {/* Canvas SVG */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className={styles.canvas}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="0.5" />
          </pattern>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#999" />
          </marker>
        </defs>

        <rect width={width} height={height} fill="url(#grid)" />

        {/* Transformed container */}
        <g transform={transform}>
          {/* Render edges */}
          {state.edges.map(edge => (
            <CanvasEdgeComponent
              key={edge.id}
              edge={edge}
              nodes={state.nodes}
              isSelected={edge.id === state.selectedEdgeId}
              onClick={() => {
                state.selectedEdgeId = edge.id;
                onEdgeClick?.(edge.id);
              }}
            />
          ))}

          {/* Render nodes */}
          {state.nodes.map(node => (
            <CanvasNodeComponent
              key={node.id}
              node={node}
              isSelected={node.isSelected}
              isDragging={isDraggingNode === node.id}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onClick={() => {
                onNodeClick?.(node.id);
              }}
              onDoubleClick={() => {
                onNodeDoubleClick?.(node.id);
              }}
              showLabel={showLabels}
              readOnly={readOnly}
            />
          ))}
        </g>
      </svg>

      {/* Toolbar */}
      {!readOnly && (
        <div className={styles.toolbar}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={styles.toolbarButton}
                  onClick={() => onChange(canvasUtils.zoomIn(state))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In (Ctrl + +)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={styles.toolbarButton}
                  onClick={() => onChange(canvasUtils.zoomOut(state))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out (Ctrl + -)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={styles.toolbarButton}
                  onClick={() => onChange(canvasUtils.centerView(state))}
                >
                  <Home className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Center View (Ctrl + 0)</TooltipContent>
            </Tooltip>

            <div className={styles.separator} />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={styles.toolbarButton}
                  disabled={!canvasUtils.getSelectedNode(state)}
                  onClick={() => {
                    const selected = canvasUtils.getSelectedNode(state);
                    if (selected) {
                      onChange(canvasUtils.duplicateNode(state, selected.id));
                    }
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate (Ctrl + D)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={styles.toolbarButton}
                  disabled={!canvasUtils.getSelectedNode(state)}
                  onClick={() => {
                    const selected = canvasUtils.getSelectedNode(state);
                    if (selected) {
                      onChange(canvasUtils.deleteNode(state, selected.id));
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete (Delete)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Info panel */}
      <div className={styles.infoPanel}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Nodes:</span>
          <span className={styles.metricValue}>{state.nodes.length}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Connections:</span>
          <span className={styles.metricValue}>{state.edges.length}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Zoom:</span>
          <span className={styles.metricValue}>{Math.round(state.view.zoom * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Canvas Node Component
 */
interface CanvasNodeComponentProps {
  node: CanvasNode;
  isSelected: boolean;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: () => void;
  onDoubleClick: () => void;
  showLabel: boolean;
  readOnly: boolean;
}

const CanvasNodeComponent: React.FC<CanvasNodeComponentProps> = ({
  node,
  isSelected,
  isDragging,
  onMouseDown,
  onClick,
  onDoubleClick,
  showLabel,
  readOnly,
}) => {
  const nodeColors: Record<string, string> = {
    'story-beat': '#FF6B6B',
    'chapter': '#4ECDC4',
    'scene': '#95E1D3',
    'character': '#FFE66D',
    'decision-point': '#FF8787',
    'timeline-event': '#C7CEEA',
    'panel': '#95B8D1',
    'act': '#73A1D9',
    'start': '#51CF66',
    'end': '#FF6B6B',
  };

  const color = node.color || nodeColors[node.type] || '#95B8D1';

  return (
    <g
      key={node.id}
      transform={`translate(${node.x}, ${node.y})`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={{ cursor: readOnly ? 'pointer' : 'grab' }}
    >
      {/* Node shape */}
      <rect
        width={node.width}
        height={node.height}
        rx="8"
        fill={color}
        fillOpacity={isSelected ? 0.9 : 0.7}
        strokeWidth={isSelected ? 3 : 2}
        stroke={isSelected ? '#000' : 'rgba(0, 0, 0, 0.3)'}
        onMouseDown={onMouseDown}
        style={{
          filter: isDragging ? 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))' : 'none',
          transition: isDragging ? 'none' : 'all 0.2s ease',
        }}
      />

      {/* Icon if provided */}
      {node.icon && (
        <text
          x={node.width / 2}
          y={node.height / 2 - 15}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="24"
        >
          {node.icon}
        </text>
      )}

      {/* Label */}
      {showLabel && (
        <text
          x={node.width / 2}
          y={node.height / 2 + (node.icon ? 8 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="13"
          fontWeight="500"
          fill="#000"
          style={{ pointerEvents: 'none' }}
        >
          {node.label}
        </text>
      )}
    </g>
  );
};

/**
 * Canvas Edge Component
 */
interface CanvasEdgeComponentProps {
  edge: CanvasEdge;
  nodes: CanvasNode[];
  isSelected: boolean;
  onClick: () => void;
}

const CanvasEdgeComponent: React.FC<CanvasEdgeComponentProps> = ({
  edge,
  nodes,
  isSelected,
  onClick,
}) => {
  const fromNode = nodes.find(n => n.id === edge.from);
  const toNode = nodes.find(n => n.id === edge.to);

  if (!fromNode || !toNode) return null;

  const x1 = fromNode.x + fromNode.width / 2;
  const y1 = fromNode.y + fromNode.height / 2;
  const x2 = toNode.x + toNode.width / 2;
  const y2 = toNode.y + toNode.height / 2;

  // Calculate control points for curved edges
  const controlX = (x1 + x2) / 2;
  const controlY = Math.max(y1, y2) + 80;

  const edgeColors: Record<string, string> = {
    'sequence': '#999',
    'flashback': '#FFB6C1',
    'parallel': '#FFE66D',
    'causality': '#FF6B6B',
    'relationship': '#95E1D3',
  };

  const strokeColor = edgeColors[edge.type] || '#999';

  return (
    <g key={edge.id} onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Edge line */}
      <path
        d={
          edge.curved
            ? `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`
            : `M ${x1} ${y1} L ${x2} ${y2}`
        }
        stroke={strokeColor}
        strokeWidth={isSelected ? 3 : 2}
        fill="none"
        strokeDasharray={edge.dashed ? '5,5' : 'none'}
        markerEnd="url(#arrowhead)"
      />

      {/* Edge label */}
      {edge.label && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 10}
          textAnchor="middle"
          fontSize="12"
          fill={strokeColor}
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          {edge.label}
        </text>
      )}
    </g>
  );
};
