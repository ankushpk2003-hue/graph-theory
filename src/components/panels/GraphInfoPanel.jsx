import React from 'react';
import { useGraph } from '../../context/GraphContext';

export default function GraphInfoPanel() {
  const {
    nodes,
    edges,
    degreesData,
    isConnected,
    components,
    planarityData,
    selectedNodeInfo,
  } = useGraph();

  const n = nodes.length;
  const m = edges.length;

  // Prepare degree table rows sorted by label
  const degreeRows = nodes.map(node => ({
    id: node.id,
    label: node.label || node.id,
    degree: degreesData.degrees[node.id] || 0,
    color: node.color,
  }));
  degreeRows.sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Card 1: Graph Information */}
      <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-2.5">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-[#182046] pb-2">
          Graph Information
        </h3>

        <div className="space-y-1.5 font-mono text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Vertices (n)</span>
            <span className="text-slate-100 font-bold">{n}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Edges (m)</span>
            <span className="text-slate-100 font-bold">{m}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Connected</span>
            <span className="flex items-center gap-1 font-sans">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span className={isConnected ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                {isConnected ? 'Yes' : 'No'}
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Max Degree</span>
            <span className="text-slate-100 font-bold">{degreesData.maxDegree}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Min Degree</span>
            <span className="text-slate-100 font-bold">{degreesData.minDegree}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Average Degree</span>
            <span className="text-slate-100 font-bold">{degreesData.avgDegree}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Components</span>
            <span className="text-slate-100 font-bold">{components.length}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Planar</span>
            <span className="flex items-center gap-1 font-sans">
              <span className={`w-2 h-2 rounded-full ${planarityData.isPlanar ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span className={planarityData.isPlanar ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                {planarityData.isPlanar ? 'Yes' : 'No'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Degree Table */}
      <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-2.5">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-[#182046] pb-2">
          Degree Table
        </h3>

        <div className="max-h-40 overflow-y-auto pr-1">
          {degreeRows.length === 0 ? (
            <p className="text-slate-500 text-center py-2 text-xs">No vertices.</p>
          ) : (
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-slate-500 text-left border-b border-[#182046]/60">
                  <th className="py-1 font-sans">Vertex</th>
                  <th className="py-1 text-right font-sans">Degree</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161e40]/50 text-slate-300">
                {degreeRows.map(row => (
                  <tr key={row.id}>
                    <td className="py-1 flex items-center gap-1.5 font-bold text-slate-200">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: row.color || '#a855f7' }}
                      />
                      {row.label}
                    </td>
                    <td className="py-1 text-right text-slate-200">{row.degree}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Card 3: Selected Vertex */}
      <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-2">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-[#182046] pb-2">
          Selected Vertex
        </h3>

        {selectedNodeInfo ? (
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Vertex:</span>
              <span className="font-bold font-mono text-purple-400">
                {selectedNodeInfo.node.label || selectedNodeInfo.node.id}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Degree:</span>
              <span className="font-bold font-mono text-slate-200">{selectedNodeInfo.degree}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Neighbors:</span>
              <span className="font-mono text-sky-300 font-semibold">
                {selectedNodeInfo.neighbors.length > 0
                  ? selectedNodeInfo.neighbors.map(n => n.label || n.id).join(', ')
                  : 'None (isolated)'}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-2 text-center text-slate-500 text-xs">
            <p className="font-medium text-slate-400">None selected</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Click a vertex to see details</p>
          </div>
        )}
      </div>
    </div>
  );
}
