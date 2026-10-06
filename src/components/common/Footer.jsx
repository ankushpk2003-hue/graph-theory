import React from 'react';
import { useGraph } from '../../context/GraphContext';

export default function Footer() {
  const { setActiveTab } = useGraph();

  return (
    <footer className="border-t border-[#1b2348] bg-[#070a16] py-8 px-4 sm:px-6 lg:px-8 mt-auto text-slate-400 text-xs">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Brand Details */}
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center p-[1px]">
              <div className="w-full h-full bg-[#080b18] rounded-[5px] flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              </div>
            </div>
            <span className="font-bold text-sm text-white">ColorCraft & PlanarPlay</span>
          </div>

          <p className="text-[11px] text-slate-500">
            Interactive DMS Learning Tool
          </p>

          <p className="text-xs text-slate-400 font-mono">
            Topic: Graph Representation, Coloring & Planarity
          </p>

          <p className="text-[11px] text-slate-500">
            Built as a DMS academic project.
          </p>

          {/* Nav Links */}
          <div className="flex items-center gap-4 pt-1 text-slate-400 text-xs flex-wrap">
            <button onClick={() => setActiveTab('home')} className="hover:text-purple-400 transition-colors">
              Home
            </button>
            <button onClick={() => setActiveTab('learn')} className="hover:text-purple-400 transition-colors">
              Learn
            </button>
            <button onClick={() => setActiveTab('graph-lab')} className="hover:text-purple-400 transition-colors">
              Graph Lab
            </button>
            <button onClick={() => setActiveTab('coloring-lab')} className="hover:text-purple-400 transition-colors">
              Coloring
            </button>
            <button onClick={() => setActiveTab('planarity-lab')} className="hover:text-purple-400 transition-colors">
              Planarity
            </button>
            <button onClick={() => setActiveTab('experiments')} className="hover:text-purple-400 transition-colors">
              Experiments
            </button>
            <button onClick={() => setActiveTab('challenges')} className="hover:text-purple-400 transition-colors">
              Challenges
            </button>
          </div>
        </div>

        {/* Right Wireframe Graphic */}
        <div className="hidden sm:block opacity-60 hover:opacity-100 transition-opacity">
          <svg width="180" height="110" viewBox="0 0 180 110" className="text-purple-500">
            {/* Geometric 3D Wireframe */}
            <line x1="30" y1="55" x2="70" y2="20" stroke="#6366f1" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="70" y1="20" x2="130" y2="20" stroke="#8b5cf6" strokeWidth="1.2" />
            <line x1="130" y1="20" x2="160" y2="55" stroke="#ec4899" strokeWidth="1.2" />
            <line x1="160" y1="55" x2="130" y2="90" stroke="#a855f7" strokeWidth="1.2" />
            <line x1="130" y1="90" x2="70" y2="90" stroke="#3b82f6" strokeWidth="1.2" />
            <line x1="70" y1="90" x2="30" y2="55" stroke="#10b981" strokeWidth="1.2" />
            <line x1="30" y1="55" x2="100" y2="55" stroke="#818cf8" strokeWidth="1" />
            <line x1="70" y1="20" x2="100" y2="55" stroke="#818cf8" strokeWidth="1" />
            <line x1="130" y1="20" x2="100" y2="55" stroke="#818cf8" strokeWidth="1" />
            <line x1="160" y1="55" x2="100" y2="55" stroke="#818cf8" strokeWidth="1" />
            <line x1="130" y1="90" x2="100" y2="55" stroke="#818cf8" strokeWidth="1" />
            <line x1="70" y1="90" x2="100" y2="55" stroke="#818cf8" strokeWidth="1" />

            <circle cx="30" cy="55" r="3" fill="#818cf8" />
            <circle cx="70" cy="20" r="3" fill="#a855f7" />
            <circle cx="130" cy="20" r="3" fill="#ec4899" />
            <circle cx="160" cy="55" r="3" fill="#38bdf8" />
            <circle cx="130" cy="90" r="3" fill="#10b981" />
            <circle cx="70" cy="90" r="3" fill="#f59e0b" />
            <circle cx="100" cy="55" r="3.5" fill="#ffffff" />
          </svg>
        </div>
      </div>
    </footer>
  );
}
