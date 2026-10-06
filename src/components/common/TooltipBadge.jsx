import React, { useState } from 'react';
import { Info } from 'lucide-react';

const GLOSSARY = {
  'degree': {
    term: 'Degree of a Vertex',
    definition: 'The number of edges incident to the vertex (for undirected graphs, self-loops count twice).',
    formula: 'deg(v) = |{ e ∈ E : v ∈ e }|',
  },
  'handshaking': {
    term: 'Handshaking Lemma',
    definition: 'In any undirected graph, the sum of all vertex degrees equals twice the total number of edges. Consequently, every graph has an even number of vertices with odd degree.',
    formula: '∑ deg(v) = 2|E|',
  },
  'chromatic-number': {
    term: 'Chromatic Number χ(G)',
    definition: 'The minimal number of colors needed to properly color the vertices of G such that no two adjacent vertices share the same color.',
    formula: 'χ(G) ≤ Δ(G) + 1 (Brooks\' Theorem)',
  },
  'planar-graph': {
    term: 'Planar Graph',
    definition: 'A graph that can be drawn in a single 2D plane such that no two edges intersect or cross each other except at their common vertices.',
    formula: 'E ≤ 3V - 6 (for V ≥ 3)',
  },
  'eulers-formula': {
    term: 'Euler\'s Formula',
    definition: 'For any connected planar graph drawn without edge crossings, the number of vertices V, edges E, and faces F satisfy Euler\'s polyhedral formula.',
    formula: 'V - E + F = 2',
  },
  'kuratowski': {
    term: 'Kuratowski\'s Theorem',
    definition: 'A finite graph is planar if and only if it contains no subgraph that is homeomorphic to (or a subdivision of) K₅ or K₃,₃.',
    formula: 'G is planar ⟺ G has no K₅ or K₃,₃ minor',
  },
  'adjacent': {
    term: 'Adjacent Vertices',
    definition: 'Two vertices u and v are adjacent (neighbors) if they are directly connected by an edge e = (u, v).',
    formula: 'u ∼ v ⟺ (u, v) ∈ E',
  },
  'connected': {
    term: 'Connected Graph',
    definition: 'A graph is connected if there exists a path between every pair of vertices. Otherwise, it consists of multiple disconnected components.',
    formula: '|Connected Components| = 1',
  },
  'bipartite': {
    term: 'Bipartite Graph',
    definition: 'A graph whose vertices can be partitioned into two disjoint sets such that every edge connects a vertex in the first set to one in the second. A graph is bipartite iff it contains no odd cycles.',
    formula: 'χ(G) ≤ 2',
  },
  'complete-graph': {
    term: 'Complete Graph (Kn)',
    definition: 'A simple graph where every pair of distinct vertices is connected by a unique edge. A complete graph on n vertices has n(n-1)/2 edges.',
    formula: '|E| = n(n-1)/2, χ(Kn) = n',
  },
};

export default function TooltipBadge({ termKey, label, children, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const data = GLOSSARY[termKey] || {
    term: label || termKey,
    definition: 'Mathematical definition for graph theory structure.',
  };

  return (
    <span className={`relative inline-flex items-center gap-1 ${className}`}>
      <span className="font-medium text-slate-200">{children || label || data.term}</span>
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="text-indigo-400 hover:text-indigo-300 focus:outline-none transition-colors"
        title="Click or hover for definition"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-900/95 border border-indigo-500/30 rounded-xl shadow-2xl backdrop-blur-md text-xs text-slate-200 pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95">
          <div className="font-semibold text-indigo-300 mb-1 flex items-center justify-between">
            <span>{data.term}</span>
            <span className="text-[10px] bg-indigo-950/80 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-800/50">DMS Concept</span>
          </div>
          <p className="text-slate-300 leading-relaxed mb-2">{data.definition}</p>
          {data.formula && (
            <div className="bg-slate-950/80 px-2 py-1.5 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300">
              {data.formula}
            </div>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </span>
  );
}
