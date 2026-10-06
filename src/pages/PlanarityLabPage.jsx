import React, { useState } from 'react';
import { CheckCircle2, XCircle, Sparkles, RefreshCw, Layers, ShieldCheck, Zap } from 'lucide-react';
import { useGraph } from '../context/GraphContext';
import GraphCanvas from '../components/canvas/GraphCanvas';
import MiniGraphCanvas from '../components/canvas/MiniGraphCanvas';
import {
  generateCompleteGraph,
  generateCompleteBipartiteGraph,
  generateWheelGraph,
  generateCycleGraph,
} from '../algorithms/graphTemplates';

export default function PlanarityLabPage() {
  const {
    nodes,
    edges,
    planarityData,
    crossingsData,
    loadGraphTemplate,
    setActiveTab,
  } = useGraph();

  const [activePlanarTab, setActivePlanarTab] = useState('predefined'); // 'build', 'predefined', 'check'
  const [checkedAnimation, setCheckedAnimation] = useState(false);

  // Predefined graph models for the 3 benchmark cards
  const k4Model = generateCompleteGraph(4, 120, 80);
  const k5Model = generateCompleteGraph(5, 120, 80);
  const k33Model = generateCompleteBipartiteGraph(3, 3, 120, 80);

  const handleCheckPlanarity = () => {
    setCheckedAnimation(true);
    setTimeout(() => setCheckedAnimation(false), 800);
  };

  const handleUntangleK4 = () => {
    loadGraphTemplate('complete', { n: 4, tangled: true });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Planarity Lab</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Check if a graph is planar using Euler's formula bounds and Kuratowski's theorem.
        </p>
      </div>

      {/* Tabs: [Build Graph] [Predefined Graphs] [Check Planarity] */}
      <div className="flex items-center gap-2 border-b border-[#1b2348] pb-1">
        {[
          { id: 'predefined', label: 'Predefined Benchmarks' },
          { id: 'check', label: 'Kuratowski & Euler Analysis' },
          { id: 'build', label: 'Open in Full Graph Lab' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'build') {
                setActiveTab('graph-lab');
              } else {
                setActivePlanarTab(tab.id);
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePlanarTab === tab.id
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Predefined Benchmarks Row (K4, K5, K3,3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* K4 Card */}
        <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-white">Complete Graph K₄</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Planar</span>
            </span>
          </div>

          <div className="bg-[#090d20] p-2 rounded-xl border border-[#171f40] flex items-center justify-center">
            <MiniGraphCanvas
              nodes={k4Model.nodes}
              edges={k4Model.edges}
              width={140}
              height={75}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => loadGraphTemplate('complete', { n: 4 })}
              className="py-1.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-purple-300 hover:text-white text-xs font-semibold border border-[#212c5b] transition-colors"
            >
              Load Untangled
            </button>
            <button
              onClick={handleUntangleK4}
              className="py-1.5 rounded-xl bg-[#19143a] hover:bg-[#251d54] text-amber-300 hover:text-white text-xs font-semibold border border-[#3b2b73] transition-colors"
            >
              Load Tangled
            </button>
          </div>
        </div>

        {/* K5 Card */}
        <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-white">Complete Graph K₅</span>
            <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>Non-Planar</span>
            </span>
          </div>

          <div className="bg-[#090d20] p-2 rounded-xl border border-[#171f40] flex items-center justify-center">
            <MiniGraphCanvas
              nodes={k5Model.nodes}
              edges={k5Model.edges}
              width={140}
              height={75}
            />
          </div>

          <button
            onClick={() => loadGraphTemplate('complete', { n: 5 })}
            className="w-full py-1.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-rose-300 hover:text-white text-xs font-semibold border border-[#212c5b] transition-colors"
          >
            Load K₅ (Kuratowski Minor)
          </button>
        </div>

        {/* K3,3 Card */}
        <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-white">Complete Bipartite K₃,₃</span>
            <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>Non-Planar</span>
            </span>
          </div>

          <div className="bg-[#090d20] p-2 rounded-xl border border-[#171f40] flex items-center justify-center">
            <MiniGraphCanvas
              nodes={k33Model.nodes}
              edges={k33Model.edges}
              width={140}
              height={75}
            />
          </div>

          <button
            onClick={() => loadGraphTemplate('bipartite', { m: 3, n: 3 })}
            className="w-full py-1.5 rounded-xl bg-[#141b3a] hover:bg-[#1a234c] text-rose-300 hover:text-white text-xs font-semibold border border-[#212c5b] transition-colors"
          >
            Load K₃,₃ (Utilities Problem)
          </button>
        </div>
      </div>

      {/* Bottom 3-Panel Layout Matching Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Current Graph Canvas */}
        <div className="lg:col-span-6 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Interactive Planar Canvas
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Drag vertices to test plane embeddings
            </span>
          </div>
          <GraphCanvas height={380} highlightCrossings={true} />
        </div>

        {/* Center: Planarity Result */}
        <div className="lg:col-span-3 space-y-3 text-xs">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Planarity Result
          </h3>

          <div className={`p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-3 transition-all ${
            checkedAnimation ? 'scale-[1.02] ring-2 ring-purple-500' : ''
          }`}>
            {planarityData.isPlanar ? (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>PLANAR</span>
                </div>
                <p className="text-[11px] text-emerald-400/90 leading-relaxed">
                  This graph is planar. It can be embedded in a plane with 0 edge crossings.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>NON-PLANAR</span>
                </div>
                <p className="text-[11px] text-rose-400/90 leading-relaxed">
                  {nodes.length >= 5 && edges.length >= 10
                    ? 'Contains K₅ or K₃,₃ subdivision. By Kuratowski’s theorem, it is inherently non-planar.'
                    : planarityData.reason}
                </p>
              </div>
            )}

            <div className="font-mono text-slate-400 text-[11px] space-y-1 pt-1 bg-[#090d20] p-2.5 rounded-xl border border-[#171f40]">
              <div className="flex justify-between">
                <span>Layout Crossings:</span>
                <span className={crossingsData.crossingCount === 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {crossingsData.crossingCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Max Edges Bound (3V-6):</span>
                <span className="text-slate-200 font-bold">
                  {Math.max(0, 3 * nodes.length - 6)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Euler Equation (V-E+F):</span>
                <span className="text-purple-400 font-bold">2</span>
              </div>
            </div>

            <button
              onClick={handleCheckPlanarity}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all mt-1 flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Verify Planarity</span>
            </button>
          </div>
        </div>

        {/* Right: Important Note Box */}
        <div className="lg:col-span-3 space-y-3 text-xs">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Topological Principle
          </h3>

          <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-2 text-slate-300 leading-relaxed">
            <p className="text-[11px] text-slate-300 font-semibold">
              Plane Drawing ≠ Planar Graph
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              A <strong className="text-white">plane graph</strong> is a particular geometric drawing with 0 crossings. A <strong className="text-white">planar graph</strong> is an abstract graph that can be drawn as a plane graph. Changing coordinates does not alter planarity!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

