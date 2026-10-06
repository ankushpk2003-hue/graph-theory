import React, { useRef, useState, useCallback } from 'react';
import { useGraph } from '../../context/GraphContext';
import { ZoomIn, ZoomOut, Maximize2, MousePointer, Move, Info } from 'lucide-react';

export default function GraphCanvas({
  readOnly = false,
  highlightConflicts = true,
  highlightCrossings = false,
  customNodeColors = null,
  onNodeClickCustom = null,
  onEdgeClickCustom = null,
  onCanvasClickCustom = null,
  showLabels = true,
  height = 540,
  showTipBar = true,
}) {
  const {
    nodes,
    edges,
    addNode,
    updateNodePosition,
    deleteNode,
    addEdge,
    deleteEdge,
    selectedNodeId,
    setSelectedNodeId,
    hoveredNodeId,
    setHoveredNodeId,
    activeMode,
    setActiveMode,
    edgeSourceId,
    setEdgeSourceId,
    activePaletteColor,
    setNodeColor,
    coloringValidation,
    crossingsData,
    adjacencyList,
  } = useGraph();

  const svgRef = useRef(null);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Convert client coordinates to SVG viewBox canvas space using getScreenCTM
  const getCanvasCoords = useCallback((clientX, clientY) => {
    if (!svgRef.current) return { x: clientX, y: clientY };
    const pt = svgRef.current.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (ctm) {
      const transformed = pt.matrixTransform(ctm.inverse());
      return {
        x: (transformed.x - pan.x) / zoom,
        y: (transformed.y - pan.y) / zoom,
      };
    }
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 600;
    const y = ((clientY - rect.top) / rect.height) * 500;
    return { x: (x - pan.x) / zoom, y: (y - pan.y) / zoom };
  }, [pan, zoom]);

  const handlePointerMove = (e) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setMousePos(coords);

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (draggingNodeId && !readOnly) {
      const newX = coords.x - dragOffset.x;
      const newY = coords.y - dragOffset.y;
      updateNodePosition(draggingNodeId, newX, newY);
    }
  };

  const handlePointerUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  const handleCanvasClick = (e) => {
    if (e.target.tagName !== 'svg' && !e.target.classList.contains('canvas-bg')) return;

    if (onCanvasClickCustom) {
      onCanvasClickCustom(e);
      return;
    }

    const coords = getCanvasCoords(e.clientX, e.clientY);

    if (activeMode === 'add-vertex' && !readOnly) {
      addNode(coords.x, coords.y);
    } else if (activeMode === 'add-edge') {
      setEdgeSourceId(null);
    } else if (activeMode === 'select' || activeMode === 'move') {
      setSelectedNodeId(null);
    }
  };

  const handleNodePointerDown = (node, e) => {
    e.stopPropagation();

    if (onNodeClickCustom) {
      onNodeClickCustom(node);
      return;
    }

    if (activeMode === 'delete-vertex' && !readOnly) {
      deleteNode(node.id);
      return;
    }

    if (activeMode === 'color' && !readOnly) {
      setNodeColor(node.id, activePaletteColor);
      return;
    }

    if (activeMode === 'add-edge' && !readOnly) {
      if (!edgeSourceId) {
        setEdgeSourceId(node.id);
      } else if (edgeSourceId !== node.id) {
        addEdge(edgeSourceId, node.id);
        setEdgeSourceId(null);
      }
      return;
    }

    // Default select & drag mode
    setSelectedNodeId(node.id);
    if (!readOnly) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setDraggingNodeId(node.id);
      setDragOffset({
        x: coords.x - node.x,
        y: coords.y - node.y,
      });
    }
  };

  const handleEdgeClick = (edge, e) => {
    e.stopPropagation();

    if (onEdgeClickCustom) {
      onEdgeClickCustom(edge);
      return;
    }

    if (activeMode === 'delete-edge' && !readOnly) {
      deleteEdge(edge.id);
    }
  };

  const activeFocusId = hoveredNodeId || selectedNodeId;
  const activeNeighbors = activeFocusId
    ? new Set(adjacencyList.get(activeFocusId) || [])
    : new Set();

  const edgeSourceNode = edgeSourceId ? nodes.find(n => n.id === edgeSourceId) : null;

  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(2.5, z + 0.2));
  const handleZoomOut = () => setZoom(z => Math.max(0.4, z - 0.2));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#1b2348] bg-[#090d20] shadow-2xl select-none flex flex-col">
      {/* Top Floating Mini Bar (Move / Select switch) */}
      <div className="absolute top-3.5 left-4 z-10 flex items-center gap-2.5 pointer-events-auto">
        <div className="flex items-center bg-[#0d122b]/95 p-1 rounded-xl border border-[#1f2956] shadow-xl backdrop-blur-md text-xs">
          <button
            onClick={() => setActiveMode('move')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeMode === 'move'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-600/30 ring-1 ring-purple-400/50'
                : 'text-slate-400 hover:text-white hover:bg-[#151c3f]'
            }`}
            title="Move vertices by dragging"
          >
            <Move className="w-3.5 h-3.5" />
            <span>Move</span>
          </button>
          <button
            onClick={() => setActiveMode('select')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeMode === 'select'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-600/30 ring-1 ring-purple-400/50'
                : 'text-slate-400 hover:text-white hover:bg-[#151c3f]'
            }`}
            title="Select vertices to inspect properties"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Select</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d122b]/90 border border-[#1f2956] backdrop-blur-md text-[11px] text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span>
            {activeMode === 'move' && 'Drag vertices to reposition them'}
            {activeMode === 'select' && 'Click a vertex to inspect its details'}
            {activeMode === 'add-vertex' && 'Click canvas to add a new vertex'}
            {activeMode === 'add-edge' && (edgeSourceId ? 'Click second vertex to connect' : 'Click first vertex')}
            {activeMode === 'delete-vertex' && 'Click any vertex to delete it'}
            {activeMode === 'delete-edge' && 'Click any edge line to delete it'}
            {activeMode === 'color' && 'Click vertices to apply active palette color'}
          </span>
        </div>
      </div>


      {/* SVG Canvas Area with viewBox */}
      <svg
        ref={svgRef}
        viewBox="0 0 600 500"
        preserveAspectRatio="xMidYMid meet"
        className="w-full cursor-crosshair canvas-bg block touch-none flex-1"
        style={{ height: `${height}px` }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleCanvasClick}
      >
        <defs>
          <pattern id="grid-dots-custom" width="25" height="25" patternUnits="userSpaceOnUse">
            <circle cx="12.5" cy="12.5" r="1" fill="#202a54" opacity="0.6" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid-dots-custom)" className="canvas-bg" />

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Edges */}
          {edges.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const isIncident =
              activeFocusId &&
              (edge.source === activeFocusId || edge.target === activeFocusId);
            const isConflicting =
              highlightConflicts && coloringValidation.conflictingEdgeIds.has(edge.id);
            const isCrossed =
              highlightCrossings && crossingsData.crossedEdgeIds.has(edge.id);

            let strokeColor = '#475569';
            let strokeWidth = 2.4;
            let strokeDasharray = 'none';

            if (isConflicting) {
              strokeColor = '#ef4444';
              strokeWidth = 3.5;
              strokeDasharray = '6,4';
            } else if (isIncident) {
              strokeColor = '#818cf8';
              strokeWidth = 3;
            } else if (isCrossed) {
              strokeColor = '#f59e0b';
              strokeWidth = 2.8;
            }

            return (
              <g key={edge.id} className="cursor-pointer" onClick={(e) => handleEdgeClick(edge, e)}>
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke="transparent"
                  strokeWidth="18"
                />
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeLinecap="round"
                  className={isConflicting ? 'animate-pulse' : 'transition-colors duration-150'}
                />
              </g>
            );
          })}

          {/* Rubber-band Line for adding edge */}
          {activeMode === 'add-edge' && edgeSourceNode && (
            <line
              x1={edgeSourceNode.x}
              y1={edgeSourceNode.y}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke="#a855f7"
              strokeWidth="2.5"
              strokeDasharray="5,5"
              strokeLinecap="round"
              className="pointer-events-none"
            />
          )}

          {/* Crossings points */}
          {highlightCrossings &&
            crossingsData.crossings.map((cross, idx) =>
              cross.point ? (
                <g key={`cross_${idx}`} className="pointer-events-none">
                  <circle cx={cross.point.x} cy={cross.point.y} r="5" fill="#f59e0b" opacity="0.9" />
                  <circle
                    cx={cross.point.x}
                    cy={cross.point.y}
                    r="9"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    className="animate-ping"
                  />
                </g>
              ) : null
            )}

          {/* Vertices / Nodes */}
          {nodes.map((node, i) => {
            const isSelected = selectedNodeId === node.id;
            const isNeighbor = activeNeighbors.has(node.id);
            const isEdgeSource = edgeSourceId === node.id;
            const isConflictingNode =
              highlightConflicts && coloringValidation.conflictingNodeIds.has(node.id);

            const defaultPalette = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];
            const defaultNodeColor = defaultPalette[i % defaultPalette.length];

            const fillColor =
              customNodeColors && customNodeColors[node.id] !== undefined
                ? customNodeColors[node.id]
                : node.color || defaultNodeColor;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer"
                onPointerDown={(e) => handleNodePointerDown(node, e)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              >
                {/* Soft colored outer glow */}
                <circle
                  r="28"
                  fill={fillColor}
                  opacity="0.3"
                  className="transition-all duration-300"
                />

                {/* Outer Ring for Selected / Edge Source / Conflict */}
                {(isSelected || isEdgeSource || isConflictingNode) && (
                  <circle
                    r="26"
                    fill="none"
                    stroke={
                      isConflictingNode
                        ? '#ef4444'
                        : isEdgeSource
                        ? '#a855f7'
                        : '#ffffff'
                    }
                    strokeWidth="2.5"
                    strokeDasharray={isEdgeSource ? '4,4' : 'none'}
                    className={isEdgeSource ? 'animate-spin' : isConflictingNode ? 'animate-pulse' : ''}
                  />
                )}

                {/* Neighbor highlight */}
                {isNeighbor && !isSelected && (
                  <circle
                    r="24"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    opacity="0.8"
                    strokeDasharray="2,2"
                  />
                )}

                {/* Node Main Circle */}
                <circle
                  r="19"
                  fill={fillColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeOpacity="0.9"
                  className="transition-transform duration-150 hover:scale-110 active:scale-95 shadow-2xl"
                />

                {/* Label */}
                {showLabels && (
                  <text
                    dy="0.35em"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                    className="pointer-events-none select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                  >
                    {node.label || node.id}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Bottom-Right Controls [ - ] [ + ] [ ⛶ ] */}
      <div className="absolute bottom-12 right-4 flex items-center gap-1 p-1 rounded-xl bg-[#111735]/90 border border-[#1d2752] backdrop-blur-sm shadow-xl z-10">
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#18214a] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#18214a] transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetView}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#18214a] transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Hint / Tip Bar */}
      {showTipBar && (
        <div className="px-4 py-2.5 bg-[#0a0e24] border-t border-[#161f44] flex items-center gap-2 text-[11px] text-slate-400">
          <span className="text-amber-400">💡</span>
          <span>
            <strong className="text-slate-300">Tip:</strong> You can drag vertices to move them. Use the toolbar on the left to add or remove elements.
          </span>
        </div>
      )}
    </div>
  );
}
