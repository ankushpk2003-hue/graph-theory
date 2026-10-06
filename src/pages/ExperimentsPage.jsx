import React, { useState } from 'react';
import {
  ArrowRight,
  Play,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  Layers,
  Palette,
  Eye,
  Zap,
  PlusCircle,
  Link as LinkIcon,
  Trash2,
  Move,
  MousePointer,
  Circle,
  RefreshCw,
  Sliders,
  Scissors,
  Flame,
} from 'lucide-react';
import { useGraph } from '../context/GraphContext';
import GraphCanvas from '../components/canvas/GraphCanvas';
import { runGreedyColoring, computeExactChromaticNumber, COLOR_PALETTE } from '../algorithms/coloringAlgorithms';
import {
  generatePathGraph,
  generateCycleGraph,
  generateCompleteGraph,
  generateCompleteBipartiteGraph,
  generateRandomGraph,
  generateWheelGraph,
  generateStarGraph,
  generatePetersenGraph,
} from '../algorithms/graphTemplates';
import { checkHamiltonianCycle, findCliques, validateEdgeColoring, runGreedyEdgeColoring } from '../algorithms/graphAlgorithms';

export default function ExperimentsPage() {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    degreesData,
    isConnected,
    planarityData,
    crossingsData,
    loadGraphTemplate,
    setFullColoring,
    updateEdgeColor,
    resetColors,
    activeMode,
    setActiveMode,
    selectedColor,
    setSelectedColor,
  } = useGraph();

  const [activeExp, setActiveExp] = useState(1);

  // Exp 1 State: Edge addition/degree impact
  const [exp1History, setExp1History] = useState([
    { action: 'Initial State', v: 5, e: 5, sumDeg: 10, maxDeg: 2, avgDeg: '2.00' },
  ]);

  // Exp 5 State: Hamiltonian Cycle Finder
  const [hamiltonianPath, setHamiltonianPath] = useState([]);
  const [hamiltonianResult, setHamiltonianResult] = useState(null);

  // Exp 7 State: Edge Coloring
  const [selectedEdgeColor, setSelectedEdgeColor] = useState('#ef4444');
  const edgePalette = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Exp 8 State: 5-Region Map Coloring
  const [mapColors, setMapColors] = useState({
    A: '#1e293b',
    B: '#1e293b',
    C: '#1e293b',
    D: '#1e293b',
    E: '#1e293b',
  });
  const [selectedMapPalette, setSelectedMapPalette] = useState('#ef4444');
  const [mapGraphMode, setMapGraphMode] = useState(false);

  const experimentsList = [
    {
      id: 1,
      number: '01',
      title: 'Edge Addition & Degrees',
      subtitle: 'How adding an edge alters vertex degrees and the Handshaking Lemma',
      badge: 'Ch. 1 Degrees',
    },
    {
      id: 2,
      number: '02',
      title: 'Chromatic Numbers',
      subtitle: 'Comparing color bounds across benchmark graph families',
      badge: 'Ch. 6 Colouring',
    },
    {
      id: 3,
      number: '03',
      title: 'Untangle K₄ Plane Graph',
      subtitle: 'Eliminating edge crossings to create a true plane embedding',
      badge: 'Ch. 5 Planarity',
    },
    {
      id: 4,
      number: '04',
      title: "Euler's Formula Dynamic",
      subtitle: 'Testing V - E + F = 2 in real-time as the graph mutates',
      badge: 'Ch. 5 Euler',
    },
    {
      id: 5,
      number: '05',
      title: 'Hamiltonian Cycle Hunt',
      subtitle: 'Trace a closed spanning cycle visiting every vertex exactly once',
      badge: 'Ch. 5 Cycles',
    },
    {
      id: 6,
      number: '06',
      title: 'Construct a Clique',
      subtitle: 'Building complete subgraphs and observing the clique lower bound',
      badge: 'Ch. 6 Cliques',
    },
    {
      id: 7,
      number: '07',
      title: 'Proper Edge Colouring',
      subtitle: 'Coloring edges sharing common endpoints & Vizing’s Theorem',
      badge: 'Ch. 6 Edge Colors',
    },
    {
      id: 8,
      number: '08',
      title: 'Four-Color Map Explorer',
      subtitle: 'Dual region coloring and converting territorial maps to planar graphs',
      badge: 'Ch. 6 Maps',
    },
  ];

  // Handlers for Exp 1
  const handleRecordExp1 = () => {
    const entry = {
      action: `Graph (${nodes.length}V, ${edges.length}E)`,
      v: nodes.length,
      e: edges.length,
      sumDeg: degreesData.sumDegrees,
      maxDeg: degreesData.maxDegree,
      avgDeg: degreesData.avgDegree,
    };
    setExp1History(prev => [entry, ...prev.slice(0, 5)]);
  };

  // Handlers for Exp 5: Hamiltonian Sequence
  const handleSelectVertexForHamiltonian = (nodeId) => {
    if (hamiltonianPath.includes(nodeId) && hamiltonianPath.length > 0 && nodeId === hamiltonianPath[0] && hamiltonianPath.length === nodes.length) {
      // Completed cycle!
      const fullPath = [...hamiltonianPath, nodeId];
      setHamiltonianPath(fullPath);
      const res = checkHamiltonianCycle(nodes, edges, fullPath);
      setHamiltonianResult(res);
      return;
    }

    if (hamiltonianPath.includes(nodeId)) {
      return;
    }

    const nextPath = [...hamiltonianPath, nodeId];
    setHamiltonianPath(nextPath);
    const res = checkHamiltonianCycle(nodes, edges, nextPath);
    setHamiltonianResult(res);
  };

  const handleResetHamiltonian = () => {
    setHamiltonianPath([]);
    setHamiltonianResult(null);
  };

  // Handlers for Exp 7: Edge Coloring
  const handleEdgeClickForColor = (edgeId) => {
    updateEdgeColor(edgeId, selectedEdgeColor);
  };

  const handleGreedyEdgeColoring = () => {
    const res = runGreedyEdgeColoring(nodes, edges);
    res.edgeColoring.forEach((color, edgeId) => {
      updateEdgeColor(edgeId, color);
    });
  };

  // Handlers for Exp 8: Map Coloring
  const handleColorRegion = (region) => {
    setMapColors(prev => ({
      ...prev,
      [region]: selectedMapPalette,
    }));
  };

  // Map Adjacency Validation
  const mapAdjacencies = [
    ['A', 'B'],
    ['A', 'C'],
    ['A', 'D'],
    ['B', 'C'],
    ['B', 'E'],
    ['C', 'D'],
    ['C', 'E'],
    ['D', 'E'],
  ];

  const checkMapConflicts = () => {
    const conflicts = [];
    mapAdjacencies.forEach(([r1, r2]) => {
      const c1 = mapColors[r1];
      const c2 = mapColors[r2];
      if (c1 !== '#1e293b' && c2 !== '#1e293b' && c1 === c2) {
        conflicts.push(`${r1} & ${r2}`);
      }
    });
    return conflicts;
  };

  const mapConflicts = checkMapConflicts();
  const allRegionsColored = Object.values(mapColors).every(c => c !== '#1e293b');

  // Shared Toolbar Component for Experiments
  const renderExperimentToolbar = (extraTools = null) => {
    return (
      <div className="p-3 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-2 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Main Action Mode Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveMode('move')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                activeMode === 'move'
                  ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                  : 'bg-[#141a38] text-slate-300 hover:text-white hover:bg-[#1a224a]'
              }`}
              title="Move & Drag Vertices"
            >
              <Move className="w-3.5 h-3.5 text-purple-300" />
              <span>Move</span>
            </button>

            <button
              onClick={() => setActiveMode('select')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                activeMode === 'select'
                  ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                  : 'bg-[#141a38] text-slate-300 hover:text-white hover:bg-[#1a224a]'
              }`}
              title="Select & Inspect Nodes"
            >
              <MousePointer className="w-3.5 h-3.5 text-indigo-400" />
              <span>Select</span>
            </button>

            <button
              onClick={() => setActiveMode('add-vertex')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                activeMode === 'add-vertex'
                  ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                  : 'bg-[#141a38] text-slate-300 hover:text-white hover:bg-[#1a224a]'
              }`}
              title="Click Canvas to Add Vertex"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>+ Vertex</span>
            </button>

            <button
              onClick={() => setActiveMode('add-edge')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                activeMode === 'add-edge'
                  ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                  : 'bg-[#141a38] text-slate-300 hover:text-white hover:bg-[#1a224a]'
              }`}
              title="Click Two Vertices to Connect with an Edge"
            >
              <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Edge</span>
            </button>

            <button
              onClick={() => setActiveMode('delete-vertex')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                activeMode === 'delete-vertex'
                  ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/30'
                  : 'bg-[#141a38] text-slate-300 hover:text-white hover:bg-[#1a224a]'
              }`}
              title="Click Vertex to Delete"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete Node</span>
            </button>

            <button
              onClick={() => setActiveMode('delete-edge')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                activeMode === 'delete-edge'
                  ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/30'
                  : 'bg-[#141a38] text-slate-300 hover:text-white hover:bg-[#1a224a]'
              }`}
              title="Click Edge to Delete"
            >
              <Scissors className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete Edge</span>
            </button>

            <button
              onClick={() => setActiveMode('color-vertex')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                activeMode === 'color-vertex'
                  ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                  : 'bg-[#141a38] text-slate-300 hover:text-white hover:bg-[#1a224a]'
              }`}
              title="Click Vertex to Color"
            >
              <Palette className="w-3.5 h-3.5 text-pink-400" />
              <span>Color Node</span>
            </button>
          </div>

          {/* Quick Clear & Reset Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setNodes([]);
                setEdges([]);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-[#141a38] hover:bg-rose-950/50 hover:text-rose-300 text-slate-400 font-mono text-[11px] border border-[#212c5b]"
              title="Clear Canvas"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Dynamic Color Palette & Invariants Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#182046]/60">
          <div className="flex items-center gap-2">
            {activeMode === 'color-vertex' && (
              <div className="flex items-center gap-1 bg-[#090d20] px-2 py-1 rounded-xl border border-[#171f40]">
                <span className="text-[10px] text-slate-400 font-mono mr-1">Palette:</span>
                {COLOR_PALETTE.slice(0, 6).map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-4 h-4 rounded-full transition-transform ${
                      selectedColor === c.hex ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            )}
            <span className="text-[11px] text-slate-400 font-mono">
              {activeMode === 'move' && '🖱️ Drag vertices to rearrange or untangle layout'}
              {activeMode === 'select' && '👆 Click any node or edge to inspect details'}
              {activeMode === 'add-vertex' && '✨ Click anywhere on the canvas to place a new vertex'}
              {activeMode === 'add-edge' && '🔗 Click first vertex, then click second vertex to join'}
              {activeMode === 'delete-vertex' && '🗑️ Click any vertex to remove it and its edges'}
              {activeMode === 'delete-edge' && '✂️ Click any edge to remove the connection'}
              {activeMode === 'color-vertex' && '🎨 Click vertices to paint with selected color'}
            </span>
          </div>

          {/* Real-time Invariant Chips */}
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800 text-sky-300 font-bold">
              |V|: {nodes.length}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-bold">
              |E|: {edges.length}
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-purple-300 font-bold">
              ∑deg: {degreesData.sumDegrees}
            </span>
            <span
              className={`px-2 py-0.5 rounded border font-bold ${
                crossingsData.crossingCount === 0
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border-amber-800'
              }`}
            >
              {crossingsData.crossingCount === 0 ? '0 Crossings (Plane)' : `${crossingsData.crossingCount} Crossings`}
            </span>
          </div>
        </div>

        {extraTools}
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-[11px] font-mono font-medium text-purple-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Experiments · Chapters 1, 5, 6</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Graph Theory Laboratory Experiments
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
          Conduct directed empirical experiments testing vertex degrees, graph chromatic numbers, Kuratowski planarity, Hamiltonian cycle traversals, clique invariants, and map duals. Full interactive construction tools are provided for every experiment.
        </p>
      </div>

      {/* 8 Horizontal Selectable Experiment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {experimentsList.map(card => {
          const isActive = activeExp === card.id;
          return (
            <div
              key={card.id}
              onClick={() => {
                setActiveExp(card.id);
                if (card.id === 1) loadGraphTemplate('cycle', { n: 5 });
                if (card.id === 3) loadGraphTemplate('complete', { n: 4, tangled: true });
                if (card.id === 5) loadGraphTemplate('wheel', { n: 5 });
                if (card.id === 6) loadGraphTemplate('petersen');
                if (card.id === 7) loadGraphTemplate('complete', { n: 4 });
              }}
              className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all space-y-3 ${
                isActive
                  ? 'bg-[#121838] border-purple-500 shadow-xl shadow-purple-600/15 ring-1 ring-purple-500/50'
                  : 'bg-[#0e1329] border-[#1b2347] hover:border-purple-500/40 hover:bg-[#111736]'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                    EXP {card.number}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{card.badge}</span>
                </div>
                <h3 className="font-bold text-xs text-white pt-1">{card.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {card.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-purple-400 pt-1">
                <span>Launch Experiment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= EXPERIMENT 1: DEGREES & HANDSHAKING ================= */}
      {activeExp === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-[#182046] pb-2">
                Experiment 1: Edge Addition & Degrees
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add edges between vertices on the canvas. Observe how every single edge added increases the sum of all degrees by exactly 2 (The Handshaking Lemma: <span className="font-mono text-purple-400">∑ deg(v) = 2|E|</span>).
              </p>

              <div className="space-y-1.5 font-mono text-xs bg-[#090d20] p-3 rounded-xl border border-[#171f40] text-slate-300">
                <div className="flex justify-between">
                  <span>Vertices |V|:</span>
                  <span className="text-sky-400 font-bold">{nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Edges |E|:</span>
                  <span className="text-emerald-400 font-bold">{edges.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sum of Degrees ∑deg(v):</span>
                  <span className="text-purple-400 font-bold">{degreesData.sumDegrees}</span>
                </div>
                <div className="flex justify-between border-t border-[#161e40] pt-1">
                  <span>2 × |E| Check:</span>
                  <span className="text-purple-300 font-bold">{2 * edges.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Degree Δ(G):</span>
                  <span className="text-amber-400 font-bold">{degreesData.maxDegree}</span>
                </div>
                <div className="flex justify-between">
                  <span>Min Degree δ(G):</span>
                  <span className="text-slate-400 font-bold">{degreesData.minDegree}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => loadGraphTemplate('path', { n: 5 })}
                  className="py-1.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-xs font-semibold text-slate-200"
                >
                  Load Path P₅
                </button>
                <button
                  onClick={() => loadGraphTemplate('cycle', { n: 5 })}
                  className="py-1.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-xs font-semibold text-slate-200"
                >
                  Load Cycle C₅
                </button>
              </div>

              <button
                onClick={handleRecordExp1}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30"
              >
                Record State in Observation Log
              </button>
            </div>

            {/* Observation Log */}
            <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-[#182046] pb-2">
                Empirical Observation Log
              </h4>
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-slate-500 text-left">
                    <th className="py-1 font-sans">State</th>
                    <th className="py-1">|V|</th>
                    <th className="py-1">|E|</th>
                    <th className="py-1">∑deg</th>
                    <th className="py-1 text-right">Δ(G)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161e40]/50 text-slate-300">
                  {exp1History.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1 font-bold text-white text-[11px]">{r.action}</td>
                      <td className="py-1 text-sky-400">{r.v}</td>
                      <td className="py-1 text-emerald-400">{r.e}</td>
                      <td className="py-1 text-purple-400 font-bold">{r.sumDeg}</td>
                      <td className="py-1 text-right text-amber-400">{r.maxDeg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-3">
            {renderExperimentToolbar()}
            <GraphCanvas height={460} />
          </div>
        </div>
      )}

      {/* ================= EXPERIMENT 2: CHROMATIC NUMBERS ================= */}
      {activeExp === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-[#182046] pb-2">
                Experiment 2: Chromatic Number Bounds
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Observe the difference between the greedy upper bound <span className="font-mono text-amber-400">Δ(G)+1</span>, Welsh-Powell greedy assignment, and the true chromatic number <span className="font-mono text-purple-400">χ(G)</span>.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => loadGraphTemplate('path', { n: 6 })}
                  className="py-1.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-xs font-semibold text-slate-200"
                >
                  Path P₆ (χ=2)
                </button>
                <button
                  onClick={() => loadGraphTemplate('cycle', { n: 5 })}
                  className="py-1.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-xs font-semibold text-slate-200"
                >
                  Odd Cycle C₅ (χ=3)
                </button>
                <button
                  onClick={() => loadGraphTemplate('wheel', { n: 6 })}
                  className="py-1.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-xs font-semibold text-slate-200"
                >
                  Wheel W₆ (χ=4)
                </button>
                <button
                  onClick={() => loadGraphTemplate('petersen')}
                  className="py-1.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-xs font-semibold text-slate-200"
                >
                  Petersen (χ=3)
                </button>
              </div>

              <button
                onClick={() => {
                  const res = runGreedyColoring(nodes, edges, 'welsh-powell');
                  setFullColoring(res.coloring);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30"
              >
                Apply Welsh-Powell Greedy Coloring
              </button>

              <div className="p-3 rounded-xl bg-[#090d20] border border-[#171f40] space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Degree Δ(G):</span>
                  <span className="text-amber-400 font-bold">{degreesData.maxDegree}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Greedy Bound (Δ+1):</span>
                  <span className="text-slate-200">{degreesData.maxDegree + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Computed χ(G):</span>
                  <span className="text-purple-400 font-bold">
                    {computeExactChromaticNumber(nodes, edges)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-3">
            {renderExperimentToolbar()}
            <GraphCanvas height={460} />
          </div>
        </div>
      )}

      {/* ================= EXPERIMENT 3: UNTANGLE K4 ================= */}
      {activeExp === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-[#182046] pb-2">
                Experiment 3: Plane Drawing of K₄
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drag the vertices of <span className="font-mono text-purple-400 font-bold">K₄</span> on the canvas so that no edges intersect. A graph is <strong className="text-white">planar</strong> if it possesses at least one crossing-free drawing (<strong className="text-white">plane graph</strong>).
              </p>

              <div className="p-4 rounded-xl bg-[#090d20] border border-[#171f40] text-center space-y-1">
                <span className="text-xs text-slate-400 block font-mono">Current Edge Crossings</span>
                <span
                  className={`text-4xl font-black font-mono ${
                    crossingsData.crossingCount === 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {crossingsData.crossingCount}
                </span>
                {crossingsData.crossingCount === 0 ? (
                  <p className="text-xs text-emerald-400 font-bold pt-1">
                    🎉 Plane Graph Achieved! 0 crossings.
                  </p>
                ) : (
                  <p className="text-[11px] text-amber-300/80 pt-1">
                    Move the central diagonal vertex outside the perimeter triangle.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => loadGraphTemplate('complete', { n: 4, tangled: true })}
                  className="py-2 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-xs font-semibold text-slate-200"
                >
                  Reload Tangled K₄
                </button>
                <button
                  onClick={() => loadGraphTemplate('complete', { n: 5 })}
                  className="py-2 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold hover:bg-rose-900/60"
                >
                  Try K₅ (Impossible)
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-3">
            {renderExperimentToolbar()}
            <GraphCanvas height={460} highlightCrossings={true} />
          </div>
        </div>
      )}

      {/* ================= EXPERIMENT 4: EULER'S FORMULA DYNAMIC ================= */}
      {activeExp === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-[#182046] pb-2">
                Experiment 4: Euler's Formula V - E + F = 2
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                For any connected plane graph, Euler's formula strictly holds: <span className="font-mono text-purple-400 font-bold">V - E + F = 2</span>. Modify vertices/edges and watch the equation balance dynamically.
              </p>

              <div className="p-4 rounded-xl bg-[#090d20] border border-[#171f40] space-y-2">
                <div className="text-center">
                  <span className="text-xs text-slate-400 font-mono block">Euler Equation Balance</span>
                  <div className="text-lg font-mono font-bold text-white pt-1">
                    <span className="text-sky-400">{nodes.length}</span> (V) -{' '}
                    <span className="text-emerald-400">{edges.length}</span> (E) +{' '}
                    <span className="text-amber-400">
                      {Math.max(1, edges.length - nodes.length + 2)}
                    </span>{' '}
                    (F) ={' '}
                    <span className="text-purple-400 font-black">2</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 text-center text-xs font-mono pt-2 border-t border-[#171f40]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Vertices</span>
                    <span className="text-sky-400 font-bold">{nodes.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Edges</span>
                    <span className="text-emerald-400 font-bold">{edges.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Faces</span>
                    <span className="text-amber-400 font-bold">
                      {Math.max(1, edges.length - nodes.length + 2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => loadGraphTemplate('cycle', { n: 4 })}
                  className="py-1.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-xs font-semibold text-slate-200"
                >
                  Square (F=2)
                </button>
                <button
                  onClick={() => loadGraphTemplate('wheel', { n: 5 })}
                  className="py-1.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-xs font-semibold text-slate-200"
                >
                  Wheel W₅ (F=5)
                </button>
                <button
                  onClick={() => loadGraphTemplate('tetrahedron')}
                  className="py-1.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-xs font-semibold text-slate-200"
                >
                  Tetrahedron (F=4)
                </button>
                <button
                  onClick={() => loadGraphTemplate('cube')}
                  className="py-1.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-xs font-semibold text-slate-200"
                >
                  Cube (F=6)
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-3">
            {renderExperimentToolbar()}
            <GraphCanvas height={460} />
          </div>
        </div>
      )}

      {/* ================= EXPERIMENT 5: HAMILTONIAN CYCLE ================= */}
      {activeExp === 5 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-[#182046] pb-2">
                Experiment 5: Hamiltonian Cycle Finder
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click nodes in order below to construct a <strong className="text-white">Hamiltonian Cycle</strong> (a closed path that visits every vertex in G exactly once and returns to the origin).
              </p>

              <div className="p-3 rounded-xl bg-[#090d20] border border-[#171f40] space-y-2">
                <span className="text-[11px] font-mono text-slate-400 block">Click Vertices in Sequence:</span>
                <div className="flex flex-wrap gap-1.5">
                  {nodes.map(n => (
                    <button
                      key={n.id}
                      onClick={() => handleSelectVertexForHamiltonian(n.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        hamiltonianPath.includes(n.id)
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'bg-[#141b3a] text-slate-300 hover:bg-[#1a234c]'
                      }`}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#171f40]">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Current Walk:</span>
                  <div className="text-xs font-mono text-sky-400 break-words font-semibold">
                    {hamiltonianPath.length > 0
                      ? hamiltonianPath.map(id => nodes.find(n => n.id === id)?.label).join(' → ')
                      : '(Select vertices above)'}
                  </div>
                </div>
              </div>

              {hamiltonianResult && (
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    hamiltonianResult.isHamiltonian
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  <p className="font-bold">{hamiltonianResult.message}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetHamiltonian}
                  className="flex-1 py-2 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-slate-300 text-xs font-semibold"
                >
                  Reset Sequence
                </button>
                <button
                  onClick={() => {
                    handleResetHamiltonian();
                    loadGraphTemplate('wheel', { n: 5 });
                  }}
                  className="py-2 px-3 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-slate-300 text-xs font-semibold"
                >
                  Load Wheel W₅
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-3">
            {renderExperimentToolbar()}
            <GraphCanvas height={460} />
          </div>
        </div>
      )}

      {/* ================= EXPERIMENT 6: CONSTRUCT A CLIQUE ================= */}
      {activeExp === 6 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-[#182046] pb-2">
                Experiment 6: Cliques & Clique Number ω(G)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A <strong className="text-white">clique</strong> is a complete subgraph where every pair of vertices is adjacent. The clique number <span className="font-mono text-purple-400 font-bold">ω(G)</span> is a fundamental lower bound for chromatic number: <span className="font-mono text-purple-400">χ(G) ≥ ω(G)</span>.
              </p>

              {(() => {
                const cliqueData = findCliques(nodes, edges);
                return (
                  <div className="p-3 rounded-xl bg-[#090d20] border border-[#171f40] space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Clique Number ω(G):</span>
                      <span className="text-purple-400 font-black text-sm">{cliqueData.maxCliqueSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Chromatic Bound:</span>
                      <span className="text-emerald-400 font-bold">χ(G) ≥ {cliqueData.maxCliqueSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Maximal Cliques:</span>
                      <span className="text-slate-300">{cliqueData.cliques.length}</span>
                    </div>
                    {cliqueData.maxClique && (
                      <div className="pt-1 border-t border-[#171f40]">
                        <span className="text-slate-500 text-[10px] block">Maximum Clique Vertices:</span>
                        <span className="text-amber-400 font-bold">
                          {cliqueData.maxClique.map(id => nodes.find(n => n.id === id)?.label).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => loadGraphTemplate('complete', { n: 4 })}
                  className="py-1.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-xs font-semibold text-slate-200"
                >
                  Complete K₄ (ω=4)
                </button>
                <button
                  onClick={() => loadGraphTemplate('petersen')}
                  className="py-1.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-xs font-semibold text-slate-200"
                >
                  Petersen (ω=2)
                </button>
                <button
                  onClick={() => loadGraphTemplate('wheel', { n: 6 })}
                  className="py-1.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-xs font-semibold text-slate-200"
                >
                  Wheel W₆ (ω=3)
                </button>
                <button
                  onClick={() => loadGraphTemplate('bipartite', { n1: 3, n2: 3 })}
                  className="py-1.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-xs font-semibold text-slate-200"
                >
                  K3,3 (ω=2)
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-3">
            {renderExperimentToolbar()}
            <GraphCanvas height={460} />
          </div>
        </div>
      )}

      {/* ================= EXPERIMENT 7: EDGE COLORING ================= */}
      {activeExp === 7 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-[#182046] pb-2">
                Experiment 7: Edge Colouring & Vizing's Theorem
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                In a <strong className="text-white">proper edge coloring</strong>, no two incident edges (sharing a vertex) can have the same color. By <strong className="text-white">Vizing’s Theorem</strong>: <span className="font-mono text-purple-400">Δ(G) ≤ χ'(G) ≤ Δ(G) + 1</span>.
              </p>

              {/* Edge Color Palette */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-slate-400 block">Select Edge Color Palette:</span>
                <div className="flex items-center gap-2">
                  {edgePalette.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedEdgeColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        selectedEdgeColor === color ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110 opacity-80'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {(() => {
                const edgeVal = validateEdgeColoring(nodes, edges);
                return (
                  <div className="p-3 rounded-xl bg-[#090d20] border border-[#171f40] space-y-2 text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Coloring Status:</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          edgeVal.isProper
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {edgeVal.isProper ? '✓ Proper Edge Coloring' : '❌ Conflict Detected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Colors Used:</span>
                      <span className="text-purple-400 font-bold">{edgeVal.colorsUsed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vizing Range [Δ, Δ+1]:</span>
                      <span className="text-slate-200">
                        [{degreesData.maxDegree}, {degreesData.maxDegree + 1}]
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGreedyEdgeColoring}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30"
                >
                  Run Greedy Edge Colorer
                </button>
                <button
                  onClick={resetColors}
                  className="py-2.5 px-3 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-slate-300 text-xs font-semibold"
                >
                  Clear Colors
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-3">
            {renderExperimentToolbar()}
            <div className="text-xs text-slate-400 font-mono bg-[#0e1329] p-2.5 rounded-xl border border-[#1b2347]">
              💡 Tip: Click on any edge in the canvas below to paint it with the active edge color palette.
            </div>
            <GraphCanvas height={460} onEdgeClick={handleEdgeClickForColor} />
          </div>
        </div>
      )}

      {/* ================= EXPERIMENT 8: MAP COLORING ================= */}
      {activeExp === 8 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-[#182046] pb-2">
                Experiment 8: 4-Color Map Theorem & Dual
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The celebrated <strong className="text-white">Four Colour Theorem</strong> (Appel & Haken 1976) guarantees every planar map requires at most 4 colors so adjacent regions differ.
              </p>

              {/* Color Palette */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-slate-400 block">Select Map Palette (Max 4 Colors):</span>
                <div className="flex items-center gap-2">
                  {['#ef4444', '#3b82f6', '#10b981', '#f59e0b'].map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedMapPalette(color)}
                      style={{ backgroundColor: color }}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        selectedMapPalette === color ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110 opacity-80'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Status Report */}
              <div className="p-3 rounded-xl bg-[#090d20] border border-[#171f40] space-y-1.5 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Map Coloring:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      mapConflicts.length === 0 && allRegionsColored
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : mapConflicts.length > 0
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-[#141b3a] text-slate-400'
                    }`}
                  >
                    {mapConflicts.length === 0 && allRegionsColored
                      ? '✓ Valid 4-Coloring!'
                      : mapConflicts.length > 0
                      ? `❌ Conflict: ${mapConflicts[0]}`
                      : 'Incomplete'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMapGraphMode(!mapGraphMode)}
                  className="flex-1 py-2.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-slate-200 font-semibold text-xs border border-[#212c5b]"
                >
                  {mapGraphMode ? 'Show Map View' : 'Convert Map to Dual Graph'}
                </button>
                <button
                  onClick={() =>
                    setMapColors({
                      A: '#1e293b',
                      B: '#1e293b',
                      C: '#1e293b',
                      D: '#1e293b',
                      E: '#1e293b',
                    })
                  }
                  className="py-2.5 px-3 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-slate-300 text-xs font-semibold"
                >
                  Reset Map
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl flex items-center justify-center min-h-[460px]">
            {!mapGraphMode ? (
              <div className="w-full max-w-[500px] aspect-[4/3] relative">
                <svg viewBox="0 0 500 380" className="w-full h-full">
                  {/* Region A */}
                  <polygon
                    points="50,50 250,50 200,180 50,180"
                    fill={mapColors.A}
                    stroke="#475569"
                    strokeWidth="3"
                    className="cursor-pointer hover:opacity-90 transition-colors"
                    onClick={() => handleColorRegion('A')}
                  />
                  <text x="120" y="110" fill="white" fontSize="16" fontWeight="bold">Region A</text>

                  {/* Region B */}
                  <polygon
                    points="250,50 450,50 450,180 300,180 200,180"
                    fill={mapColors.B}
                    stroke="#475569"
                    strokeWidth="3"
                    className="cursor-pointer hover:opacity-90 transition-colors"
                    onClick={() => handleColorRegion('B')}
                  />
                  <text x="340" y="110" fill="white" fontSize="16" fontWeight="bold">Region B</text>

                  {/* Region C (Center) */}
                  <polygon
                    points="200,180 300,180 350,280 150,280"
                    fill={mapColors.C}
                    stroke="#475569"
                    strokeWidth="3"
                    className="cursor-pointer hover:opacity-90 transition-colors"
                    onClick={() => handleColorRegion('C')}
                  />
                  <text x="220" y="240" fill="white" fontSize="16" fontWeight="bold">Region C</text>

                  {/* Region D (Bottom Left) */}
                  <polygon
                    points="50,180 200,180 150,280 50,330"
                    fill={mapColors.D}
                    stroke="#475569"
                    strokeWidth="3"
                    className="cursor-pointer hover:opacity-90 transition-colors"
                    onClick={() => handleColorRegion('D')}
                  />
                  <text x="100" y="260" fill="white" fontSize="16" fontWeight="bold">Region D</text>

                  {/* Region E (Bottom Right) */}
                  <polygon
                    points="450,180 300,180 350,280 450,330"
                    fill={mapColors.E}
                    stroke="#475569"
                    strokeWidth="3"
                    className="cursor-pointer hover:opacity-90 transition-colors"
                    onClick={() => handleColorRegion('E')}
                  />
                  <text x="360" y="260" fill="white" fontSize="16" fontWeight="bold">Region E</text>
                </svg>
              </div>
            ) : (
              <div className="w-full max-w-[500px] aspect-[4/3] relative">
                <svg viewBox="0 0 500 380" className="w-full h-full">
                  {/* Dual Graph Edges */}
                  <line x1="120" y1="110" x2="340" y2="110" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="120" y1="110" x2="230" y2="230" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="120" y1="110" x2="100" y2="250" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="340" y1="110" x2="230" y2="230" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="340" y1="110" x2="380" y2="250" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="230" y1="230" x2="100" y2="250" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="230" y1="230" x2="380" y2="250" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 4" />

                  {/* Dual Graph Vertices */}
                  {[
                    { id: 'A', x: 120, y: 110, label: "v_A" },
                    { id: 'B', x: 340, y: 110, label: "v_B" },
                    { id: 'C', x: 230, y: 230, label: "v_C" },
                    { id: 'D', x: 100, y: 250, label: "v_D" },
                    { id: 'E', x: 380, y: 250, label: "v_E" },
                  ].map(v => (
                    <g key={v.id}>
                      <circle cx={v.x} cy={v.y} r="18" fill={mapColors[v.id] !== '#1e293b' ? mapColors[v.id] : '#334155'} stroke="#818cf8" strokeWidth="2" />
                      <text x={v.x} y={v.y + 4} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                        {v.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
