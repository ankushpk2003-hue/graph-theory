import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Trophy,
  HelpCircle,
  Lightbulb,
  PlusCircle,
  Link as LinkIcon,
  Trash2,
  Move,
  Dice5,
  Activity,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGraph } from '../context/GraphContext';
import GraphCanvas from '../components/canvas/GraphCanvas';
import {
  generatePathGraph,
  generateCycleGraph,
  generateCompleteGraph,
  generateCompleteBipartiteGraph,
  generateWheelGraph,
  generatePetersenGraph,
} from '../algorithms/graphTemplates';
import { computeExactChromaticNumber } from '../algorithms/coloringAlgorithms';
import { findCliques, checkHamiltonianCycle, validateEdgeColoring } from '../algorithms/graphAlgorithms';

export default function ChallengesPage() {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    degreesData,
    isConnected,
    isBipartiteGraph,
    planarityData,
    crossingsData,
    activeMode,
    setActiveMode,
    addNode,
    updateEdgeColor,
    resetColors,
    clearGraph,
  } = useGraph();

  const [activeChallengeId, setActiveChallengeId] = useState(1);
  const [completedChallenges, setCompletedChallenges] = useState(new Set());
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);

  // Multi-choice & sequence challenge states
  const [selectedOption, setSelectedOption] = useState(null);
  const [hamiltonianInputPath, setHamiltonianInputPath] = useState([]);
  const [selectedEdgePalette, setSelectedEdgePalette] = useState('#ef4444');

  const challenges = [
    {
      id: 1,
      title: 'Challenge 1: Vertex & Edge Constraints',
      topic: 'Ch. 1 Introduction',
      instruction: 'Construct a graph with exactly 5 vertices and 6 edges.',
      hint: 'Use the "Add Vertex" and "Add Edge" tools above the canvas to build a graph with |V|=5 and |E|=6.',
      initialSetup: () => {
        setNodes([
          { id: 'v1', label: 'A', x: 180, y: 140, color: null },
          { id: 'v2', label: 'B', x: 300, y: 80, color: null },
          { id: 'v3', label: 'C', x: 420, y: 140, color: null },
          { id: 'v4', label: 'D', x: 370, y: 280, color: null },
        ]);
        setEdges([
          { id: 'e1', source: 'v1', target: 'v2' },
          { id: 'e2', source: 'v2', target: 'v3' },
          { id: 'e3', source: 'v3', target: 'v4' },
        ]);
        setActiveMode('move');
      },
      check: () => {
        if (nodes.length === 5 && edges.length === 6) {
          return { passed: true, message: '🎉 Correct! You built a graph with |V| = 5 and |E| = 6.' };
        }
        return {
          passed: false,
          message: `Current: ${nodes.length} vertices and ${edges.length} edges. Required: exactly 5 vertices and 6 edges.`,
        };
      },
    },
    {
      id: 2,
      title: 'Challenge 2: Maximum Degree Constraint',
      topic: 'Ch. 1 Vertex Degrees',
      instruction: 'Construct a connected graph with at least 5 vertices where the maximum degree Δ(G) is exactly 3.',
      hint: 'Ensure no single vertex has more than 3 incident edges, and at least one vertex has degree 3.',
      initialSetup: () => {
        const p = generatePathGraph(5, 600, 360);
        setNodes(p.nodes);
        setEdges(p.edges);
        setActiveMode('move');
      },
      check: () => {
        if (nodes.length >= 5 && isConnected && degreesData.maxDegree === 3) {
          return { passed: true, message: '🎉 Excellent! Connected graph with Δ(G) = 3 achieved.' };
        }
        return {
          passed: false,
          message: `Current: ${nodes.length} vertices, connected: ${isConnected ? 'Yes' : 'No'}, max degree: ${degreesData.maxDegree}. Need connected with ≥ 5 vertices and Δ(G) = 3.`,
        };
      },
    },
    {
      id: 3,
      title: 'Challenge 3: 5-Cycle Construction',
      topic: 'Ch. 1 Paths & Cycles',
      instruction: 'Create a graph containing a cycle of length 5 (C₅).',
      hint: 'Connect 5 vertices in a closed loop (v₁-v₂-v₃-v₄-v₅-v₁).',
      initialSetup: () => {
        const p = generatePathGraph(5, 600, 360);
        setNodes(p.nodes);
        setEdges(p.edges);
        setActiveMode('move');
      },
      check: () => {
        if (nodes.length >= 5 && edges.length >= 5 && degreesData.minDegree >= 2) {
          return { passed: true, message: '🎉 Great work! Graph contains a 5-cycle C₅.' };
        }
        return {
          passed: false,
          message: 'Connect the 5 vertices in a closed loop so that every vertex in the cycle has degree ≥ 2.',
        };
      },
    },
    {
      id: 4,
      title: 'Challenge 4: Chromatic Lower Bound χ(G) ≥ 3',
      topic: 'Ch. 6 Colouring',
      instruction: 'Construct a graph that requires at least 3 colors (χ(G) ≥ 3).',
      hint: 'Any graph containing an odd cycle (such as a triangle K₃ or C₅) is not bipartite and requires ≥ 3 colors.',
      initialSetup: () => {
        const p = generatePathGraph(4, 600, 360);
        setNodes(p.nodes);
        setEdges(p.edges);
        setActiveMode('move');
      },
      check: () => {
        const chi = computeExactChromaticNumber(nodes, edges);
        if (chi >= 3) {
          return { passed: true, message: `🎉 Perfect! This graph has χ(G) = ${chi} ≥ 3 (contains an odd cycle/clique).` };
        }
        return {
          passed: false,
          message: `Current χ(G) = ${chi} (bipartite 2-colorable). Add an edge to form an odd cycle like K₃.`,
        };
      },
    },
    {
      id: 5,
      title: 'Challenge 5: Planar Embedding with V=6, E=8',
      topic: 'Ch. 5 Planar Graphs',
      instruction: 'Construct a planar graph with 6 vertices and 8 edges, and arrange it without edge crossings.',
      hint: 'By Euler’s theorem, E ≤ 3V - 6 = 12. 8 edges easily fits, but drag vertices to untangle all crossings!',
      initialSetup: () => {
        const c = generateCycleGraph(6, 600, 360);
        setNodes(c.nodes);
        setEdges(c.edges);
        setActiveMode('move');
      },
      check: () => {
        if (nodes.length === 6 && edges.length === 8 && crossingsData.crossingCount === 0) {
          return { passed: true, message: '🎉 Outstanding! Valid plane drawing with 6 vertices, 8 edges, and 0 crossings.' };
        }
        if (nodes.length === 6 && edges.length === 8 && crossingsData.crossingCount > 0) {
          return { passed: false, message: `Graph has 6V and 8E, but ${crossingsData.crossingCount} crossings remain. Drag vertices to untangle!` };
        }
        return { passed: false, message: `Current: ${nodes.length}V and ${edges.length}E. Required: exactly 6 vertices and 8 edges with 0 crossings.` };
      },
    },
    {
      id: 6,
      title: 'Challenge 6: Planarity Analysis of K₅',
      topic: 'Ch. 5 Kuratowski',
      instruction: 'Determine whether the complete graph K₅ is planar.',
      hint: 'In any simple connected planar graph with V ≥ 3, E ≤ 3V - 6. For K₅, V=5 and E=10. 10 > 3(5) - 6 = 9.',
      isMultipleChoice: true,
      options: ['Planar (Can be drawn without crossings)', 'Non-Planar (Inherently violates Euler bound E ≤ 3V - 6)'],
      correctOption: 1,
      initialSetup: () => {
        const k = generateCompleteGraph(5, 600, 360);
        setNodes(k.nodes);
        setEdges(k.edges);
        setActiveMode('move');
      },
      check: () => {
        if (selectedOption === 1) {
          return { passed: true, message: '🎉 Correct! K₅ is non-planar because E = 10 > 3(5) - 6 = 9, violating Euler planarity corollary.' };
        }
        return { passed: false, message: 'Incorrect. Try calculating the maximum edges a planar graph on 5 vertices can have.' };
      },
    },
    {
      id: 7,
      title: 'Challenge 7: Planarity Analysis of K₃,₃',
      topic: 'Ch. 5 Kuratowski',
      instruction: 'Determine whether the complete bipartite graph K₃,₃ (Three Utilities Problem) is planar.',
      hint: 'Since K₃,₃ has no triangles (girth ≥ 4), every planar face has ≥ 4 boundary edges, so E ≤ 2V - 4 = 8. For K₃,₃, E = 9 > 8.',
      isMultipleChoice: true,
      options: ['Planar (Crossing-free embedding exists)', 'Non-Planar (E = 9 exceeds bipartite planar bound 2V - 4 = 8)'],
      correctOption: 1,
      initialSetup: () => {
        const k = generateCompleteBipartiteGraph(3, 3, 600, 360);
        setNodes(k.nodes);
        setEdges(k.edges);
        setActiveMode('move');
      },
      check: () => {
        if (selectedOption === 1) {
          return { passed: true, message: '🎉 Correct! K₃,₃ is non-planar by Kuratowski’s Theorem and the bipartite girth bound 2V - 4.' };
        }
        return { passed: false, message: 'Incorrect. K₃,₃ is one of the two fundamental forbidden Kuratowski minors.' };
      },
    },
    {
      id: 8,
      title: 'Challenge 8: Maximum Clique Identification',
      topic: 'Ch. 6 Cliques',
      instruction: 'Analyze the loaded Wheel graph W₆ and determine its clique number ω(G).',
      hint: 'A clique is a pairwise adjacent set of vertices. In a wheel W₆ (hub connected to C₅), look at the hub and any perimeter edge.',
      isMultipleChoice: true,
      options: ['ω(G) = 2', 'ω(G) = 3 (Hub + 2 adjacent rim vertices form K₃)', 'ω(G) = 4', 'ω(G) = 6'],
      correctOption: 1,
      initialSetup: () => {
        const w = generateWheelGraph(6, 600, 360);
        setNodes(w.nodes);
        setEdges(w.edges);
        setActiveMode('move');
      },
      check: () => {
        if (selectedOption === 1) {
          return { passed: true, message: '🎉 Correct! In W₆ with odd rim C₅, maximum cliques are triangles K₃ formed by the center hub and 2 adjacent rim vertices.' };
        }
        return { passed: false, message: 'Incorrect. Look at the triangles formed between the central hub and the outer cycle.' };
      },
    },
    {
      id: 9,
      title: 'Challenge 9: Hamiltonian Cycle Construction',
      topic: 'Ch. 5 Cycles',
      instruction: 'Click vertices in order to trace a Hamiltonian Cycle in this graph.',
      hint: 'Visit each of the 5 vertices exactly once, then return to the starting vertex.',
      isHamiltonianChallenge: true,
      initialSetup: () => {
        const w = generateWheelGraph(5, 600, 360);
        setNodes(w.nodes);
        setEdges(w.edges);
        setHamiltonianInputPath([]);
        setActiveMode('move');
      },
      check: () => {
        const res = checkHamiltonianCycle(nodes, edges, hamiltonianInputPath);
        if (res.isHamiltonian) {
          return { passed: true, message: `🎉 Superb! ${res.message}` };
        }
        return { passed: false, message: res.message };
      },
    },
    {
      id: 10,
      title: 'Challenge 10: Proper Edge Colouring',
      topic: 'Ch. 6 Edge Colouring',
      instruction: 'Properly color all edges of K₄ such that incident edges receive distinct colors.',
      hint: 'By Vizing’s Theorem, K₄ (Δ = 3) can be edge-colored in either 3 or 4 colors. K₄ requires exactly 3 colors (Class 1).',
      isEdgeColoringChallenge: true,
      initialSetup: () => {
        const k = generateCompleteGraph(4, 600, 360);
        setNodes(k.nodes);
        setEdges(k.edges);
        setActiveMode('move');
      },
      check: () => {
        const res = validateEdgeColoring(nodes, edges);
        if (res.isProper && res.coloredEdgesCount === edges.length && res.colorsUsed <= 3) {
          return { passed: true, message: `🎉 Fantastic! You achieved a minimal proper edge coloring using ${res.colorsUsed} colors (Class 1 graph)!` };
        }
        if (res.isProper && res.coloredEdgesCount === edges.length) {
          return { passed: true, message: `🎉 Proper edge coloring with ${res.colorsUsed} colors.` };
        }
        return { passed: false, message: 'Edges sharing a common vertex must have distinct colors, and all edges must be colored.' };
      },
    },
    {
      id: 11,
      title: 'Challenge 11: Adjacency Matrix Verification',
      topic: 'Ch. 1 Matrix Representation',
      instruction: 'Construct a 4-vertex cycle graph C₄ (A-B-C-D-A) and inspect its symmetric 0-diagonal adjacency matrix.',
      hint: 'Vertices in C₄ have degree 2. The diagonal entries must be 0, and each row/column must sum to 2.',
      initialSetup: () => {
        setNodes([
          { id: 'v1', label: 'A', x: 200, y: 120, color: null },
          { id: 'v2', label: 'B', x: 400, y: 120, color: null },
          { id: 'v3', label: 'C', x: 400, y: 280, color: null },
          { id: 'v4', label: 'D', x: 200, y: 280, color: null },
        ]);
        setEdges([
          { id: 'e1', source: 'v1', target: 'v2' },
          { id: 'e2', source: 'v2', target: 'v3' },
          { id: 'e3', source: 'v3', target: 'v4' },
        ]);
        setActiveMode('move');
      },
      check: () => {
        if (nodes.length === 4 && edges.length === 4 && degreesData.minDegree === 2 && degreesData.maxDegree === 2) {
          return { passed: true, message: '🎉 Correct! Adjacency matrix of C₄ is symmetric with row sums equal to 2.' };
        }
        return { passed: false, message: 'Close the loop by adding an edge between A and D to complete C₄.' };
      },
    },
    {
      id: 12,
      title: 'Challenge 12: Euler Formula Verification on Cube',
      topic: 'Ch. 5 Platonic Solids',
      instruction: 'Inspect the planar embedding of the Cube Graph Q₃. Verify that V - E + F = 2.',
      hint: 'The cube graph has 8 vertices, 12 edges, and 6 faces (5 interior regions + 1 exterior unbounded region). 8 - 12 + 6 = 2.',
      isMultipleChoice: true,
      options: [
        'V=8, E=12, F=6 → 8 - 12 + 6 = 2 (Formula rigorously satisfied)',
        'V=6, E=8, F=4 → 6 - 8 + 4 = 2',
        'V=8, E=10, F=4 → 8 - 10 + 4 = 2',
      ],
      correctOption: 0,
      initialSetup: () => {
        setNodes([
          { id: 'v1', label: 'A', x: 180, y: 100, color: null },
          { id: 'v2', label: 'B', x: 420, y: 100, color: null },
          { id: 'v3', label: 'C', x: 420, y: 340, color: null },
          { id: 'v4', label: 'D', x: 180, y: 340, color: null },
          { id: 'v5', label: 'E', x: 250, y: 160, color: null },
          { id: 'v6', label: 'F', x: 350, y: 160, color: null },
          { id: 'v7', label: 'G', x: 350, y: 260, color: null },
          { id: 'v8', label: 'H', x: 250, y: 260, color: null },
        ]);
        setEdges([
          { id: 'e1', source: 'v1', target: 'v2' },
          { id: 'e2', source: 'v2', target: 'v3' },
          { id: 'e3', source: 'v3', target: 'v4' },
          { id: 'e4', source: 'v4', target: 'v1' },
          { id: 'e5', source: 'v5', target: 'v6' },
          { id: 'e6', source: 'v6', target: 'v7' },
          { id: 'e7', source: 'v7', target: 'v8' },
          { id: 'e8', source: 'v8', target: 'v5' },
          { id: 'e9', source: 'v1', target: 'v5' },
          { id: 'e10', source: 'v2', target: 'v6' },
          { id: 'e11', source: 'v3', target: 'v7' },
          { id: 'e12', source: 'v4', target: 'v8' },
        ]);
        setActiveMode('move');
      },
      check: () => {
        if (selectedOption === 0) {
          return { passed: true, message: '🎉 Correct! Cube Graph has V=8, E=12, F=6, satisfying Euler’s Formula: 8 - 12 + 6 = 2.' };
        }
        return { passed: false, message: 'Count the vertices (8) and edges (12) of the 3D cube planar net.' };
      },
    },
  ];

  const currentChallenge = challenges.find(c => c.id === activeChallengeId) || challenges[0];

  const handleSelectChallenge = (id) => {
    setActiveChallengeId(id);
    setFeedback(null);
    setShowHint(false);
    setSelectedOption(null);
    setHamiltonianInputPath([]);
    const target = challenges.find(c => c.id === id);
    if (target && target.initialSetup) {
      target.initialSetup();
    }
  };

  const handleCheckAnswer = () => {
    const res = currentChallenge.check();
    setFeedback(res);
    if (res.passed) {
      setCompletedChallenges(prev => new Set([...prev, activeChallengeId]));
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  const handleReset = () => {
    setFeedback(null);
    setShowHint(false);
    setSelectedOption(null);
    setHamiltonianInputPath([]);
    resetColors();
    currentChallenge.initialSetup();
  };

  const handleHamiltonianNodeClick = (nodeId) => {
    if (
      hamiltonianInputPath.includes(nodeId) &&
      hamiltonianInputPath.length > 0 &&
      nodeId === hamiltonianInputPath[0] &&
      hamiltonianInputPath.length === nodes.length
    ) {
      setHamiltonianInputPath([...hamiltonianInputPath, nodeId]);
      return;
    }
    if (hamiltonianInputPath.includes(nodeId)) return;
    setHamiltonianInputPath([...hamiltonianInputPath, nodeId]);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1b2348] pb-4 gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[11px] font-mono font-medium text-purple-400">
            <Trophy className="w-3.5 h-3.5" />
            <span>12 Graded Problem Sets</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>DMS Practice Challenges</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Solve collegiate discrete mathematics problems using the interactive construction tools below.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-slate-300 bg-[#111736] px-3.5 py-1.5 rounded-xl border border-[#1e2752] flex items-center gap-2">
            <span className="text-slate-400">Completed:</span>
            <span className="text-emerald-400 font-bold">{completedChallenges.size} / 12</span>
          </div>
        </div>
      </div>

      {/* 2-Column Challenge Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Challenge Prompt & Actions */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                  {currentChallenge.topic}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  #{currentChallenge.id} of {challenges.length}
                </span>
              </div>
              <h3 className="font-bold text-sm text-white">{currentChallenge.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#090d20] p-3 rounded-xl border border-[#171f42]">
                {currentChallenge.instruction}
              </p>
            </div>

            {/* Multiple Choice Options */}
            {currentChallenge.isMultipleChoice && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono text-slate-400 block">Select Conclusion:</span>
                {currentChallenge.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-all leading-relaxed ${
                      selectedOption === idx
                        ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-md shadow-purple-600/20'
                        : 'bg-[#121937] border-[#1f2852] text-slate-300 hover:bg-[#161e40]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Hamiltonian Cycle Sequence Input */}
            {currentChallenge.isHamiltonianChallenge && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono text-slate-400 block">Click Vertices in Order:</span>
                <div className="flex flex-wrap gap-1.5">
                  {nodes.map(n => (
                    <button
                      key={n.id}
                      onClick={() => handleHamiltonianNodeClick(n.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        hamiltonianInputPath.includes(n.id)
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-[#141b3a] text-slate-300 hover:bg-[#1a234c]'
                      }`}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
                <div className="text-xs font-mono text-sky-400 bg-[#090d20] p-2 rounded-lg border border-[#171f42] break-words">
                  Path:{' '}
                  {hamiltonianInputPath.length > 0
                    ? hamiltonianInputPath.map(id => nodes.find(n => n.id === id)?.label).join(' → ')
                    : '(Select vertices above)'}
                </div>
              </div>
            )}

            {/* Edge Coloring Palette */}
            {currentChallenge.isEdgeColoringChallenge && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono text-slate-400 block">Select Active Edge Color & Click Edges:</span>
                <div className="flex items-center gap-2">
                  {['#ef4444', '#3b82f6', '#10b981', '#f59e0b'].map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedEdgePalette(color)}
                      style={{ backgroundColor: color }}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        selectedEdgePalette === color ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110 opacity-80'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Hint Box */}
            {showHint && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{currentChallenge.hint}</span>
              </div>
            )}

            {/* Result Feedback */}
            {feedback && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  feedback.passed
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                }`}
              >
                <p className="font-bold">{feedback.message}</p>
              </div>
            )}

            {/* Actions: Check Answer & Reset & Hint */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleCheckAnswer}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
              >
                Check Answer
              </button>
              <button
                onClick={() => setShowHint(!showHint)}
                className="p-2.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-amber-400 border border-[#212c5b]"
                title="Toggle Hint"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                className="px-3.5 py-2.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-slate-300 font-semibold text-xs border border-[#212c5b]"
              >
                Reset
              </button>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-[#182046] text-xs">
              <button
                disabled={activeChallengeId === 1}
                onClick={() => handleSelectChallenge(activeChallengeId - 1)}
                className="flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {challenges.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectChallenge(c.id)}
                    className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center transition-colors ${
                      c.id === activeChallengeId
                        ? 'bg-purple-600 text-white'
                        : completedChallenges.has(c.id)
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-[#121937] text-slate-500'
                    }`}
                  >
                    {c.id}
                  </button>
                ))}
              </div>

              <button
                disabled={activeChallengeId === challenges.length}
                onClick={() => handleSelectChallenge(activeChallengeId + 1)}
                className="flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Construction Canvas */}
        <div className="lg:col-span-8 space-y-3">
          {/* Construction Toolbar Strip */}
          <div className="p-3 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Action Tools */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveMode('move')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                  activeMode === 'move' || activeMode === 'select'
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : 'bg-[#141a38] text-slate-300 hover:text-white hover:bg-[#1a224a]'
                }`}
              >
                <Move className="w-3.5 h-3.5 text-purple-300" />
                <span>Move</span>
              </button>

              <button
                onClick={() => setActiveMode('add-vertex')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                  activeMode === 'add-vertex'
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : 'bg-[#141a38] text-slate-300 hover:text-white hover:bg-[#1a224a]'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
                <span>+ Vertex</span>
              </button>

              <button
                onClick={() => setActiveMode('add-edge')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                  activeMode === 'add-edge'
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : 'bg-[#141a38] text-slate-300 hover:text-white hover:bg-[#1a224a]'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Edge</span>
              </button>

              <button
                onClick={() => setActiveMode('delete-vertex')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                  activeMode === 'delete-vertex'
                    ? 'bg-rose-600 text-white font-bold shadow'
                    : 'bg-[#141a38] text-slate-300 hover:text-rose-300 hover:bg-[#1a224a]'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete Node</span>
              </button>

              <button
                onClick={() => setActiveMode('delete-edge')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                  activeMode === 'delete-edge'
                    ? 'bg-rose-600 text-white font-bold shadow'
                    : 'bg-[#141a38] text-slate-300 hover:text-rose-300 hover:bg-[#1a224a]'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Delete Edge</span>
              </button>
            </div>

            {/* Live Telemetry Metrics */}
            <div className="flex items-center gap-3 font-mono text-[11px] bg-[#090d20] px-3 py-1.5 rounded-xl border border-[#171f40] text-slate-300">
              <span title="Number of Vertices">
                |V|: <strong className="text-sky-400">{nodes.length}</strong>
              </span>
              <span title="Number of Edges">
                |E|: <strong className="text-emerald-400">{edges.length}</strong>
              </span>
              <span title="Maximum Degree">
                Δ: <strong className="text-amber-400">{degreesData.maxDegree}</strong>
              </span>
              <span title="Connectedness">
                {isConnected ? <span className="text-emerald-400">Connected</span> : <span className="text-rose-400">Disconnected</span>}
              </span>
            </div>
          </div>

          <GraphCanvas
            height={460}
            onEdgeClick={currentChallenge.isEdgeColoringChallenge ? (edge) => updateEdgeColor(edge.id, selectedEdgePalette) : undefined}
          />
        </div>
      </div>
    </div>
  );
}


