import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  calculateDegrees,
  getConnectedComponents,
  isGraphConnected,
  isBipartite,
  isTree,
  getAdjacencyMatrix,
  getAdjacencyList,
  calculateDensity,
  getNextVertexLabel,
} from '../algorithms/graphAlgorithms';
import { validateColoring, computeChromaticNumber } from '../algorithms/coloringAlgorithms';
import { checkPlanarity, detectEdgeCrossings } from '../algorithms/planarityAlgorithms';
import {
  generatePathGraph,
  generateCycleGraph,
  generateCompleteGraph,
  generateCompleteBipartiteGraph,
  generateStarGraph,
  generateWheelGraph,
  generateTreeGraph,
  generatePetersenGraph,
  generateDisconnectedGraph,
  generateRandomGraph,
} from '../algorithms/graphTemplates';

const GraphContext = createContext(null);

// Default benchmark graph matching user mockup exactly (5 vertices, 7 edges)
const DEFAULT_INITIAL_GRAPH = {
  name: 'Default Explorer Graph',
  description: '5 vertices and 7 edges with degrees ranging from 2 to 4. Planar and connected.',
  nodes: [
    { id: 'v1', label: 'A', x: 300, y: 110, color: '#a855f7' },
    { id: 'v2', label: 'B', x: 170, y: 230, color: '#3b82f6' },
    { id: 'v3', label: 'C', x: 430, y: 230, color: '#10b981' },
    { id: 'v4', label: 'D', x: 210, y: 390, color: '#f59e0b' },
    { id: 'v5', label: 'E', x: 390, y: 400, color: '#ef4444' },
  ],
  edges: [
    { id: 'e1_2', source: 'v1', target: 'v2' },
    { id: 'e1_3', source: 'v1', target: 'v3' },
    { id: 'e1_4', source: 'v1', target: 'v4' },
    { id: 'e1_5', source: 'v1', target: 'v5' },
    { id: 'e2_4', source: 'v2', target: 'v4' },
    { id: 'e3_5', source: 'v3', target: 'v5' },
    { id: 'e4_5', source: 'v4', target: 'v5' },
  ],
};

export function GraphProvider({ children }) {
  // Navigation state
  const [activeTab, setActiveTab] = useState('home');

  // Core Graph State
  const [nodes, setNodes] = useState(DEFAULT_INITIAL_GRAPH.nodes);
  const [edges, setEdges] = useState(DEFAULT_INITIAL_GRAPH.edges);
  const [graphTitle, setGraphTitle] = useState(DEFAULT_INITIAL_GRAPH.name);
  const [graphDescription, setGraphDescription] = useState(DEFAULT_INITIAL_GRAPH.description);

  // Interaction / Selection state
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [activeMode, setActiveMode] = useState('move'); // 'move', 'select', 'add-vertex', 'add-edge', 'delete-vertex', 'delete-edge', 'color'
  const [edgeSourceId, setEdgeSourceId] = useState(null);
  const [activePaletteColor, setActivePaletteColor] = useState('#a855f7');

  // Node operations
  const addNode = useCallback((x, y, customLabel = null) => {
    setNodes(prev => {
      const label = customLabel || getNextVertexLabel(prev);
      const newId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
      const palette = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
      const defaultColor = palette[prev.length % palette.length];
      return [
        ...prev,
        {
          id: newId,
          label,
          x: Math.round(x),
          y: Math.round(y),
          color: defaultColor,
        },
      ];
    });
  }, []);

  const updateNodePosition = useCallback((id, x, y) => {
    setNodes(prev =>
      prev.map(node => (node.id === id ? { ...node, x: Math.round(x), y: Math.round(y) } : node))
    );
  }, []);

  const renameNode = useCallback((id, newLabel) => {
    if (!newLabel || !newLabel.trim()) return;
    setNodes(prev =>
      prev.map(node => (node.id === id ? { ...node, label: newLabel.trim() } : node))
    );
  }, []);

  const deleteNode = useCallback((id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
    setSelectedNodeId(prev => (prev === id ? null : prev));
    setEdgeSourceId(prev => (prev === id ? null : prev));
  }, []);

  const addEdge = useCallback((sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId) return false;

    setEdges(prev => {
      const exists = prev.some(
        e =>
          (e.source === sourceId && e.target === targetId) ||
          (e.source === targetId && e.target === sourceId)
      );
      if (exists) return prev;

      const newEdgeId = `e_${sourceId}_${targetId}_${Date.now()}`;
      return [...prev, { id: newEdgeId, source: sourceId, target: targetId }];
    });
    return true;
  }, []);

  const deleteEdge = useCallback((edgeId) => {
    setEdges(prev => prev.filter(e => e.id !== edgeId));
  }, []);

  const clearGraph = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setEdgeSourceId(null);
    setGraphTitle('Empty Canvas');
    setGraphDescription('Canvas cleared. Click "Add Vertex" to start constructing a graph.');
  }, []);

  const setNodeColor = useCallback((nodeId, colorHex) => {
    setNodes(prev =>
      prev.map(n => (n.id === nodeId ? { ...n, color: colorHex } : n))
    );
  }, []);

  const clearAllColors = useCallback(() => {
    setNodes(prev => prev.map(n => ({ ...n, color: null })));
  }, []);

  const setFullColoring = useCallback((coloringMap) => {
    setNodes(prev =>
      prev.map(n => ({
        ...n,
        color: coloringMap[n.id] !== undefined ? coloringMap[n.id] : n.color,
      }))
    );
  }, []);

  const loadGraphTemplate = useCallback((templateType, params = {}, canvasWidth = 600, canvasHeight = 480) => {
    let result;
    switch (templateType) {
      case 'path':
        result = generatePathGraph(params.n || 5, canvasWidth, canvasHeight);
        break;
      case 'cycle':
        result = generateCycleGraph(params.n || 5, canvasWidth, canvasHeight);
        break;
      case 'complete':
        result = generateCompleteGraph(params.n || 4, canvasWidth, canvasHeight, params.tangled || false);
        break;
      case 'bipartite':
        result = generateCompleteBipartiteGraph(params.m || 3, params.n || 3, canvasWidth, canvasHeight);
        break;
      case 'star':
        result = generateStarGraph(params.n || 6, canvasWidth, canvasHeight);
        break;
      case 'wheel':
        result = generateWheelGraph(params.n || 6, canvasWidth, canvasHeight);
        break;
      case 'tree':
        result = generateTreeGraph(canvasWidth, canvasHeight);
        break;
      case 'petersen':
        result = generatePetersenGraph(canvasWidth, canvasHeight);
        break;
      case 'disconnected':
        result = generateDisconnectedGraph(canvasWidth, canvasHeight);
        break;
      case 'random':
        result = generateRandomGraph(params.n || 6, params.density || 0.4, canvasWidth, canvasHeight);
        break;
      default:
        result = DEFAULT_INITIAL_GRAPH;
    }

    setNodes(result.nodes);
    setEdges(result.edges);
    setGraphTitle(result.name);
    setGraphDescription(result.description);
    setSelectedNodeId(null);
    setEdgeSourceId(null);
  }, []);

  // Computed Properties
  const degreesData = useMemo(() => calculateDegrees(nodes, edges), [nodes, edges]);
  const components = useMemo(() => getConnectedComponents(nodes, edges), [nodes, edges]);
  const isConnected = useMemo(() => isGraphConnected(nodes, edges), [nodes, edges]);
  const isBipartiteGraph = useMemo(() => isBipartite(nodes, edges), [nodes, edges]);
  const isTreeGraph = useMemo(() => isTree(nodes, edges), [nodes, edges]);
  const density = useMemo(() => calculateDensity(nodes, edges), [nodes, edges]);
  const adjacencyMatrix = useMemo(() => getAdjacencyMatrix(nodes, edges), [nodes, edges]);
  const adjacencyList = useMemo(() => getAdjacencyList(nodes, edges), [nodes, edges]);

  const coloringValidation = useMemo(() => validateColoring(nodes, edges), [nodes, edges]);
  const chromaticData = useMemo(() => computeChromaticNumber(nodes, edges), [nodes, edges]);
  const planarityData = useMemo(() => checkPlanarity(nodes, edges), [nodes, edges]);
  const crossingsData = useMemo(() => detectEdgeCrossings(nodes, edges), [nodes, edges]);

  const selectedNodeInfo = useMemo(() => {
    if (!selectedNodeId) return null;
    const node = nodes.find(n => n.id === selectedNodeId);
    if (!node) return null;

    const neighborIds = adjacencyList.get(node.id) || [];
    const neighbors = neighborIds
      .map(id => nodes.find(n => n.id === id))
      .filter(Boolean);

    const incidentEdges = edges.filter(
      e => e.source === node.id || e.target === node.id
    );

    return {
      node,
      degree: degreesData.degrees[node.id] || 0,
      neighbors,
      incidentEdges,
    };
  }, [selectedNodeId, nodes, edges, adjacencyList, degreesData]);

  const value = {
    activeTab,
    setActiveTab,
    nodes,
    setNodes,
    edges,
    setEdges,
    graphTitle,
    setGraphTitle,
    graphDescription,
    setGraphDescription,
    activeMode,
    setActiveMode,
    selectedNodeId,
    setSelectedNodeId,
    hoveredNodeId,
    setHoveredNodeId,
    edgeSourceId,
    setEdgeSourceId,
    activePaletteColor,
    setActivePaletteColor,
    addNode,
    updateNodePosition,
    renameNode,
    deleteNode,
    addEdge,
    deleteEdge,
    clearGraph,
    setNodeColor,
    clearAllColors,
    setFullColoring,
    loadGraphTemplate,
    degreesData,
    components,
    isConnected,
    isBipartiteGraph,
    isTreeGraph,
    density,
    adjacencyMatrix,
    adjacencyList,
    coloringValidation,
    chromaticData,
    planarityData,
    crossingsData,
    selectedNodeInfo,
  };

  return <GraphContext.Provider value={value}>{children}</GraphContext.Provider>;
}

export function useGraph() {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraph must be used within a GraphProvider');
  }
  return context;
}
