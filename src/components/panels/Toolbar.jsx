import React, { useState } from 'react';
import {
  PlusCircle,
  Link,
  Trash2,
  Edit3,
  RotateCcw,
  Dice5,
  Sparkles,
} from 'lucide-react';
import { useGraph } from '../../context/GraphContext';
import Modal from '../common/Modal';

export default function Toolbar() {
  const {
    activeMode,
    setActiveMode,
    clearGraph,
    loadGraphTemplate,
    selectedNodeId,
    nodes,
    renameNode,
  } = useGraph();

  // Generator parameters
  const [generatorType, setGeneratorType] = useState('random');
  const [genVertices, setGenVertices] = useState(6);
  const [genDensity, setGenDensity] = useState(0.4);

  // Modals
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const handleOpenRename = () => {
    if (!selectedNodeId) return;
    const node = nodes.find(n => n.id === selectedNodeId);
    setNewLabel(node?.label || '');
    setIsRenameModalOpen(true);
  };

  const handleConfirmRename = (e) => {
    e.preventDefault();
    if (selectedNodeId && newLabel.trim()) {
      renameNode(selectedNodeId, newLabel.trim());
      setIsRenameModalOpen(false);
    }
  };

  const handleGenerate = () => {
    if (generatorType === 'random') {
      loadGraphTemplate('random', { n: genVertices, density: genDensity });
    } else if (generatorType === 'complete') {
      loadGraphTemplate('complete', { n: genVertices });
    } else if (generatorType === 'cycle') {
      loadGraphTemplate('cycle', { n: genVertices });
    } else if (generatorType === 'path') {
      loadGraphTemplate('path', { n: genVertices });
    } else if (generatorType === 'bipartite') {
      loadGraphTemplate('bipartite', { m: 3, n: 3 });
    } else if (generatorType === 'wheel') {
      loadGraphTemplate('wheel', { n: genVertices });
    } else if (generatorType === 'star') {
      loadGraphTemplate('star', { n: genVertices });
    } else if (generatorType === 'tree') {
      loadGraphTemplate('tree');
    } else if (generatorType === 'petersen') {
      loadGraphTemplate('petersen');
    }
  };

  return (
    <div className="space-y-4">
      {/* Card 1: Construction Tools */}
      <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
          Construction Tools
        </h3>

        <div className="space-y-1.5">
          <button
            onClick={() => setActiveMode('add-vertex')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'add-vertex'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-[#141a38] text-slate-300 hover:text-white hover:bg-[#1a224a]'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-purple-400" />
            <span>Add Vertex</span>
          </button>

          <button
            onClick={() => setActiveMode('add-edge')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'add-edge'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-[#141a38] text-slate-300 hover:text-white hover:bg-[#1a224a]'
            }`}
          >
            <Link className="w-4 h-4 text-sky-400" />
            <span>Add Edge</span>
          </button>

          <button
            onClick={() => setActiveMode('delete-vertex')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'delete-vertex'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-[#141a38] text-slate-300 hover:text-rose-300 hover:bg-[#1a224a]'
            }`}
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Delete Vertex</span>
          </button>

          <button
            onClick={() => setActiveMode('delete-edge')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'delete-edge'
                ? 'bg-rose-700 text-white shadow-md shadow-rose-700/30'
                : 'bg-[#141a38] text-slate-300 hover:text-rose-300 hover:bg-[#1a224a]'
            }`}
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Delete Edge</span>
          </button>

          <button
            onClick={handleOpenRename}
            disabled={!selectedNodeId}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedNodeId
                ? 'bg-[#141a38] text-slate-200 hover:text-white hover:bg-[#1a224a]'
                : 'bg-[#10142c] text-slate-500 cursor-not-allowed'
            }`}
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span>Rename Vertex</span>
          </button>

          <button
            onClick={() => setIsClearModalOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#141a38] text-slate-300 hover:text-rose-300 hover:bg-[#1a224a] transition-all"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Clear Graph</span>
          </button>

          <button
            onClick={() => loadGraphTemplate('random', { n: 6, density: 0.45 })}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#141a38] text-slate-300 hover:text-white hover:bg-[#1a224a] transition-all"
          >
            <Dice5 className="w-4 h-4 text-purple-400" />
            <span>Random Graph</span>
          </button>
        </div>
      </div>

      {/* Card 2: Graph Generator */}
      <div className="p-4 rounded-2xl bg-[#0e1329] border border-[#1b2347] shadow-xl space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
          Graph Generator
        </h3>

        <div className="space-y-2.5 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Type:</label>
            <select
              value={generatorType}
              onChange={(e) => setGeneratorType(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-[#0a0e22] border border-[#1d2752] text-slate-200 text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="random">Random Graph</option>
              <option value="complete">Complete Graph (Kn)</option>
              <option value="cycle">Cycle Graph (Cn)</option>
              <option value="path">Path Graph (Pn)</option>
              <option value="bipartite">Complete Bipartite (K3,3)</option>
              <option value="wheel">Wheel Graph (Wn)</option>
              <option value="star">Star Graph (Sn)</option>
              <option value="tree">Binary Tree</option>
              <option value="petersen">Petersen Graph</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>Vertices:</span>
              <span className="font-mono text-purple-400 font-bold">{genVertices}</span>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              value={genVertices}
              onChange={(e) => setGenVertices(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {generatorType === 'random' && (
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>Edge Density:</span>
                <span className="font-mono text-cyan-400 font-bold">{genDensity}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={genDensity}
                onChange={(e) => setGenDensity(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all mt-1"
          >
            Generate
          </button>
        </div>
      </div>

      {/* Clear Graph Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Clear Graph Canvas?"
        subtitle="This will remove all vertices and edges from the canvas."
      >
        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          Are you sure you want to clear the entire graph?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setIsClearModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-[#151c3d]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              clearGraph();
              setIsClearModalOpen(false);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
          >
            Clear
          </button>
        </div>
      </Modal>

      {/* Rename Vertex Modal */}
      <Modal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        title="Rename Selected Vertex"
        subtitle="Enter new label for vertex"
      >
        <form onSubmit={handleConfirmRename} className="space-y-4">
          <input
            type="text"
            maxLength="4"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 bg-[#090d22] border border-[#1e2752] rounded-xl text-white font-mono text-sm focus:outline-none focus:border-purple-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRenameModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-[#151c3d]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
