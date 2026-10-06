import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, RotateCcw, Sparkles, Layers, ShieldCheck, MapPin } from 'lucide-react';
import { useGraph } from '../context/GraphContext';
import GraphCanvas from '../components/canvas/GraphCanvas';
import {
  COLOR_PALETTE,
  runGreedyColoring,
  checkVertexCriticality,
} from '../algorithms/coloringAlgorithms';
import {
  validateEdgeColoring,
  runGreedyEdgeColoring,
  findCliques,
} from '../algorithms/graphAlgorithms';

export default function ColoringLabPage() {
  const {
    nodes,
    edges,
    coloringValidation,
    chromaticData,
    degreesData,
    setNodeColor,
    clearAllColors,
    setFullColoring,
  } = useGraph();

  // Mode: 'vertex', 'edge', 'cliques', 'critical', 'map'
  const [labMode, setLabMode] = useState('vertex');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0].hex);
  const [stepTrace, setStepTrace] = useState([]);
  const [edgeColors, setEdgeColors] = useState({});
  const [customNodeColors, setCustomNodeColors] = useState(null);

  // Map coloring state (5 stylized regions)
  const [mapRegions, setMapRegions] = useState({
    r1: '#3b82f6', // North
    r2: '#10b981', // West
    r3: '#f59e0b', // Center
    r4: '#a855f7', // East
    r5: '#ef4444', // South
  });

  // Edge coloring validation
  const edgeValidation = validateEdgeColoring(nodes, edges, edgeColors);

  // Cliques calculation
  const cliquesData = findCliques(nodes, edges);

  // Critical graph calculation
  const criticalityData = checkVertexCriticality(nodes, edges);

  useEffect(() => {
    const res = runGreedyColoring(nodes, edges, 'welsh-powell');
    setStepTrace(res.steps);
  }, [nodes, edges]);

  const handleRunGreedyVertex = () => {
    const res = runGreedyColoring(nodes, edges, 'welsh-powell');
    setFullColoring(res.coloring);
    setCustomNodeColors(null);
  };

  const handleRunGreedyEdge = () => {
    const res = runGreedyEdgeColoring(nodes, edges);
    setEdgeColors(res.edgeColors);
  };

  const handleReset = () => {
    clearAllColors();
    setEdgeColors({});
    setCustomNodeColors(null);
  };

  const handleNodeClick = (node) => {
    if (labMode === 'vertex') {
      setNodeColor(node.id, selectedColor);
    }
  };

  const handleEdgeClick = (edge) => {
    if (labMode === 'edge') {
      setEdgeColors(prev => ({ ...prev, [edge.id]: selectedColor }));
    }
  };

  // Map region click
  const handleMapRegionClick = (regionKey) => {
    setMapRegions(prev => ({ ...prev, [regionKey]: selectedColor }));
  };

  // Map validation (r3 borders all others; r1 borders r2, r4; r5 borders r2, r4)
  const isMapValid =
    mapRegions.r3 !== mapRegions.r1 &&
    mapRegions.r3 !== mapRegions.r2 &&
    mapRegions.r3 !== mapRegions.r4 &&
    mapRegions.r3 !== mapRegions.r5 &&
    mapRegions.r1 !== mapRegions.r2 &&
    mapRegions.r1 !== mapRegions.r4 &&
    mapRegions.r5 !== mapRegions.r2 &&
    mapRegions.r5 !== mapRegions.r4;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5 animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Colouring Lab</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Explore Vertex Colouring, Edge Colouring, Cliques, Criticality, and Map Colouring (Chapter 6).
        </p>
      </div>

      {/* Module Mode Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1b2348] pb-1 overflow-x-auto">
        {[
          { id: 'vertex', label: '6.1 Vertex Colouring' },
          { id: 'edge', label: '6.5 Edge Colouring' },
          { id: 'cliques', label: '6.4 Cliques & ω(G)' },
          { id: 'critical', label: '6.3 Critical Graphs' },
          { id: 'map', label: '6.6 Map Colouring' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setLabMode(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              labMode === tab.id
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Palette & Lab Settings */}
        <div className="lg:col-span-3 space-y-4 text-xs">
          {/* Palette Card */}
          <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-[#182046] pb-2">
              Color Palette
            </h3>

            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PALETTE.map(color => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.hex)}
                  style={{ backgroundColor: color.hex }}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    selectedColor === color.hex ? 'scale-125 ring-2 ring-white shadow-lg' : 'opacity-85 hover:opacity-100'
                  }`}
                  title={color.name}
                />
              ))}
            </div>

            <button
              onClick={handleReset}
              className="w-full py-1.5 rounded-lg bg-[#141b3a] hover:bg-[#1a234c] text-slate-300 text-xs font-medium transition-colors"
            >
              Clear Colors
            </button>
          </div>

          {/* Dynamic Status Card Based on Selected Lab Mode */}
          {labMode === 'vertex' && (
            <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-2.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-[#182046] pb-2">
                Vertex Colouring Status
              </h3>

              {coloringValidation.isValid && coloringValidation.isComplete ? (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Proper Colouring</span>
                  </div>
                  <p className="text-[11px] text-emerald-400/80">
                    No adjacent vertices share the same color.
                  </p>
                </div>
              ) : !coloringValidation.isValid ? (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Invalid Colouring</span>
                  </div>
                  <p className="text-[11px] text-rose-400/80">
                    Adjacent vertices share the same color.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Partial Colouring</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Click vertices to apply colors.
                  </p>
                </div>
              )}

              <button
                onClick={handleRunGreedyVertex}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all mt-1"
              >
                Run Greedy Algorithm
              </button>
            </div>
          )}

          {labMode === 'edge' && (
            <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-2.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-[#182046] pb-2">
                Edge Colouring (Vizing)
              </h3>

              {edgeValidation.isValid && edgeValidation.isComplete ? (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Proper Edge Colouring</span>
                  </div>
                  <p className="text-[11px] text-emerald-400/80">
                    Incident edges have distinct colors.
                  </p>
                </div>
              ) : !edgeValidation.isValid ? (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Invalid Edge Colouring</span>
                  </div>
                  <p className="text-[11px] text-rose-400/80">
                    Adjacent edges share the same color.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                  Click edges to color them manually.
                </div>
              )}

              <div className="font-mono text-xs text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Max Degree Δ(G):</span>
                  <span className="text-purple-400 font-bold">{degreesData.maxDegree}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vizing Range:</span>
                  <span className="text-emerald-400 font-bold">{degreesData.maxDegree} ≤ χ'(G) ≤ {degreesData.maxDegree + 1}</span>
                </div>
              </div>

              <button
                onClick={handleRunGreedyEdge}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30"
              >
                Run Greedy Edge Colouring
              </button>
            </div>
          )}

          {labMode === 'cliques' && (
            <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-2.5 font-mono">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-[#182046] pb-2 font-sans">
                Cliques & ω(G) Bound
              </h3>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Max Clique Size ω(G):</span>
                <span className="text-purple-400 font-bold">{cliquesData.maxCliqueSize}</span>
              </div>
              <div className="p-2.5 bg-[#090d20] rounded-xl border border-[#171f40] text-center text-amber-300 text-xs">
                χ(G) ≥ ω(G) = {cliquesData.maxCliqueSize}
              </div>
            </div>
          )}

          {labMode === 'critical' && (
            <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-2.5 text-xs">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-[#182046] pb-2">
                Critical Graph Tester
              </h3>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {criticalityData.description}
              </p>
            </div>
          )}

          {labMode === 'map' && (
            <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-2.5 text-xs">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-[#182046] pb-2">
                Map Four Colour Theorem
              </h3>
              {isMapValid ? (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-bold">
                  ✓ Valid Map Colouring! No adjacent countries share color.
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 font-bold">
                  ❌ Conflict: Bordering countries have identical color.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Column: Graph Canvas / Map View */}
        <div className="lg:col-span-6">
          {labMode !== 'map' ? (
            <GraphCanvas
              height={560}
              customNodeColors={customNodeColors}
              onNodeClickCustom={handleNodeClick}
              onEdgeClickCustom={handleEdgeClick}
              highlightConflicts={labMode === 'vertex'}
            />
          ) : (
            /* Interactive Stylized Map Visualization */
            <div className="p-6 rounded-2xl bg-[#090d20] border border-[#1b2347] shadow-2xl flex flex-col items-center justify-center space-y-4 min-h-[560px]">
              <h3 className="font-bold text-sm text-white">Stylized 5-Region Continental Map</h3>
              <p className="text-xs text-slate-400 text-center max-w-md">
                Click regions to color them from the palette. The Four Colour Theorem guarantees that 4 colors suffice for any planar map.
              </p>

              <svg width="400" height="340" viewBox="0 0 400 340" className="rounded-2xl border border-[#1e2752] bg-[#0c112a]">
                {/* Region 1: North */}
                <path
                  d="M100,40 L300,40 L350,110 L200,120 L50,110 Z"
                  fill={mapRegions.r1}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="cursor-pointer hover:opacity-85 transition-opacity"
                  onClick={() => handleMapRegionClick('r1')}
                />
                <text x="200" y="80" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="13">Region 1 (North)</text>

                {/* Region 2: West */}
                <path
                  d="M50,110 L200,120 L180,230 L50,230 Z"
                  fill={mapRegions.r2}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="cursor-pointer hover:opacity-85 transition-opacity"
                  onClick={() => handleMapRegionClick('r2')}
                />
                <text x="110" y="175" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="13">Region 2 (West)</text>

                {/* Region 3: Central Hub */}
                <polygon
                  points="200,120 280,140 250,220 180,230"
                  fill={mapRegions.r3}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="cursor-pointer hover:opacity-85 transition-opacity"
                  onClick={() => handleMapRegionClick('r3')}
                />
                <text x="225" y="175" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="13">Region 3 (Center)</text>

                {/* Region 4: East */}
                <path
                  d="M350,110 L200,120 L280,140 L250,220 L350,230 Z"
                  fill={mapRegions.r4}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="cursor-pointer hover:opacity-85 transition-opacity"
                  onClick={() => handleMapRegionClick('r4')}
                />
                <text x="310" y="175" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="13">Region 4 (East)</text>

                {/* Region 5: South */}
                <path
                  d="M50,230 L180,230 L250,220 L350,230 L300,300 L100,300 Z"
                  fill={mapRegions.r5}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="cursor-pointer hover:opacity-85 transition-opacity"
                  onClick={() => handleMapRegionClick('r5')}
                />
                <text x="200" y="270" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="13">Region 5 (South)</text>
              </svg>
            </div>
          )}
        </div>

        {/* Right Column: Mathematical Explanations & Cliques Details */}
        <div className="lg:col-span-3 space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-[#182046] pb-2">
              Theoretical Invariants
            </h3>

            <div className="space-y-2 font-mono text-slate-300">
              <div className="flex justify-between">
                <span>Computed χ(G):</span>
                <span className="text-purple-400 font-bold">{chromaticData.exact !== null ? chromaticData.exact : '≤ ' + stepTrace.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Clique Number ω(G):</span>
                <span className="text-sky-400 font-bold">{cliquesData.maxCliqueSize}</span>
              </div>
              <div className="flex justify-between">
                <span>Max Degree Δ(G):</span>
                <span className="text-amber-400 font-bold">{degreesData.maxDegree}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#182046] text-slate-400 text-[11px] leading-relaxed">
              <strong className="text-slate-300 block mb-1">Fundamental Bounds:</strong>
              ω(G) ≤ χ(G) ≤ Δ(G) + 1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
