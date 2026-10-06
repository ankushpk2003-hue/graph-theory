import React from 'react';
import {
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useGraph } from '../context/GraphContext';

export default function HomePage() {
  const { setActiveTab } = useGraph();

  // Custom node network for the hero visualization (matching the mockup exactly)
  const heroNodes = [
    { id: '1', x: 260, y: 50, color: '#38bdf8' }, // Cyan
    { id: '2', x: 190, y: 110, color: '#f59e0b' }, // Amber
    { id: '3', x: 330, y: 120, color: '#10b981' }, // Green
    { id: '4', x: 380, y: 90, color: '#ec4899' }, // Pink
    { id: '5', x: 220, y: 220, color: '#f59e0b' }, // Amber
    { id: '6', x: 350, y: 200, color: '#8b5cf6' }, // Purple
    { id: '7', x: 390, y: 220, color: '#f97316' }, // Orange
    { id: '8', x: 190, y: 290, color: '#a855f7' }, // Violet
    { id: '9', x: 270, y: 310, color: '#38bdf8' }, // Cyan
  ];

  const heroEdges = [
    { source: '1', target: '2' },
    { source: '1', target: '3' },
    { source: '1', target: '4' },
    { source: '2', target: '3' },
    { source: '2', target: '5' },
    { source: '3', target: '4' },
    { source: '3', target: '6' },
    { source: '4', target: '7' },
    { source: '5', target: '6' },
    { source: '5', target: '8' },
    { source: '6', target: '7' },
    { source: '6', target: '9' },
    { source: '7', target: '9' },
    { source: '8', target: '9' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[460px]">
        {/* Left Column Text */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              ColorCraft & <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
                PlanarPlay
              </span>
            </h1>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-slate-200">
            Explore Graph Theory by Building It.
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
            Construct graphs, experiment with coloring, analyze graph properties, and investigate planarity through interactive visual experiments.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('graph-lab')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
            >
              <span>Explore Graph Lab</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('learn')}
              className="px-5 py-3 rounded-xl bg-[#111732] hover:bg-[#182046] text-slate-200 border border-[#212b58] font-medium text-xs transition-all"
            >
              Learn Concepts
            </button>
          </div>
        </div>

        {/* Right Column Visual Graphic */}
        <div className="lg:col-span-6 flex items-center justify-center relative">
          {/* Organic Teal & Purple Background Blob */}
          <div className="relative w-full max-w-[480px] h-[360px] flex items-center justify-center">
            <div className="absolute inset-4 rounded-3xl bg-gradient-to-br from-teal-900/30 via-indigo-950/50 to-purple-900/40 blur-2xl -z-10" />

            <svg viewBox="0 0 460 360" className="w-full h-full drop-shadow-2xl">
              {/* Organic background shapes */}
              <path
                d="M120,60 C200,20 380,40 400,160 C420,280 280,340 160,320 C60,300 40,160 120,60 Z"
                fill="#0f1938"
                opacity="0.85"
              />
              <path
                d="M180,90 C260,50 360,80 370,180 C380,280 260,310 180,280 C100,250 100,130 180,90 Z"
                fill="#152048"
                opacity="0.6"
              />

              {/* Edges */}
              {heroEdges.map((e, idx) => {
                const u = heroNodes.find(n => n.id === e.source);
                const v = heroNodes.find(n => n.id === e.target);
                return (
                  <line
                    key={idx}
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke="#475569"
                    strokeWidth="2"
                    strokeOpacity="0.75"
                  />
                );
              })}

              {/* Nodes */}
              {heroNodes.map(node => (
                <g key={node.id}>
                  {/* Subtle outer glow */}
                  <circle cx={node.x} cy={node.y} r="14" fill={node.color} opacity="0.25" />
                  {/* Main node */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="8.5"
                    fill={node.color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* 3 Bottom Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Card 1: Graph Construction */}
        <div
          onClick={() => setActiveTab('graph-lab')}
          className="group cursor-pointer p-6 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-cyan-500/40 hover:bg-[#121936] transition-all duration-200 shadow-xl flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="6" cy="6" r="3" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="12" cy="18" r="3" />
                <line x1="8.5" y1="7.5" x2="15.5" y2="7.5" />
                <line x1="7.5" y1="8.5" x2="10.5" y2="15.5" />
                <line x1="16.5" y1="8.5" x2="13.5" y2="15.5" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
              Graph Construction
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Build and manipulate graphs with an intuitive interface.
            </p>
          </div>
          <div className="pt-2 text-cyan-400 font-semibold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Graph Coloring */}
        <div
          onClick={() => setActiveTab('coloring-lab')}
          className="group cursor-pointer p-6 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-pink-500/40 hover:bg-[#121936] transition-all duration-200 shadow-xl flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="13.5" cy="6.5" r="2.5" fill="#f43f5e" />
                <circle cx="17.5" cy="10.5" r="2.5" fill="#38bdf8" />
                <circle cx="8.5" cy="7.5" r="2.5" fill="#eab308" />
                <circle cx="6.5" cy="12.5" r="2.5" fill="#10b981" />
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.5-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H16c3.3 0 6-2.7 6-6 0-5.5-4.5-9.6-10-9.6z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors">
              Graph Coloring
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Apply coloring algorithms and explore the chromatic number.
            </p>
          </div>
          <div className="pt-2 text-pink-400 font-semibold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Planarity Testing */}
        <div
          onClick={() => setActiveTab('planarity-lab')}
          className="group cursor-pointer p-6 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-emerald-500/40 hover:bg-[#121936] transition-all duration-200 shadow-xl flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              Planarity Testing
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Discover if a graph can be drawn without edge crossings.
            </p>
          </div>
          <div className="pt-2 text-emerald-400 font-semibold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
