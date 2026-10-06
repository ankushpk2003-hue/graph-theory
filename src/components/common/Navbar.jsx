import React from 'react';
import {
  Sparkles,
} from 'lucide-react';
import { useGraph } from '../../context/GraphContext';

export default function Navbar() {
  const { activeTab, setActiveTab } = useGraph();

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'learn', label: 'Learn' },
    { id: 'graph-lab', label: 'Graph Lab' },
    { id: 'coloring-lab', label: 'Coloring' },
    { id: 'planarity-lab', label: 'Planarity' },
    { id: 'experiments', label: 'Experiments' },
    { id: 'challenges', label: 'Challenges' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1b2244] bg-[#090d1f]/95 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          {/* Geometric graph polygon logo */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-[#0a0e22] rounded-[6.5px] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="6" cy="6" r="2.5" fill="#38bdf8" />
                <circle cx="18" cy="6" r="2.5" fill="#a855f7" />
                <circle cx="12" cy="18" r="2.5" fill="#34d399" />
                <line x1="6" y1="6" x2="18" y2="6" stroke="#818cf8" strokeWidth="1.5" />
                <line x1="6" y1="6" x2="12" y2="18" stroke="#818cf8" strokeWidth="1.5" />
                <line x1="18" y1="6" x2="12" y2="18" stroke="#818cf8" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
          <span className="font-extrabold text-base tracking-tight text-white group-hover:text-purple-300 transition-colors">
            ColorCraft & PlanarPlay
          </span>
        </button>

        {/* Center / Right Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative py-1 transition-colors ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-[-19px] left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Far Right Actions / Empty placeholder */}
        <div className="flex items-center gap-3">
        </div>
      </div>

      {/* Mobile Submenu Bar */}
      <div className="md:hidden border-t border-[#1b2244] bg-[#090d1f] px-2 py-2 flex items-center justify-around overflow-x-auto text-xs">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                isActive ? 'text-purple-400 font-bold bg-[#141b3a]' : 'text-slate-400'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
