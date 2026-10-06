import React from 'react';
import { useGraph } from '../context/GraphContext';
import GraphCanvas from '../components/canvas/GraphCanvas';
import Toolbar from '../components/panels/Toolbar';
import GraphInfoPanel from '../components/panels/GraphInfoPanel';

export default function GraphLabPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Graph Lab
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Build, modify and explore graphs interactively. View real-time properties and statistics.
        </p>
      </div>

      {/* 3-Column Layout Matching Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Tools & Generator (Width ~ 3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <Toolbar />
        </div>

        {/* Center Column: Graph Canvas (Width ~ 6 cols) */}
        <div className="lg:col-span-6">
          <GraphCanvas height={560} showTipBar={true} />
        </div>

        {/* Right Column: Information & Degree Table (Width ~ 3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <GraphInfoPanel />
        </div>
      </div>
    </div>
  );
}
