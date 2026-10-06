/**
 * Graph Colouring Algorithms
 * Inspired by Chapter 6 of "A First Look at Graph Theory" (Clark & Holton)
 */

import { getAdjacencyList, calculateDegrees, isBipartite } from './graphAlgorithms';

export const COLOR_PALETTE = [
  { id: 'c1', name: 'Coral Red', hex: '#ef4444' },
  { id: 'c2', name: 'Azure Blue', hex: '#3b82f6' },
  { id: 'c3', name: 'Emerald Green', hex: '#10b981' },
  { id: 'c4', name: 'Amber Yellow', hex: '#f59e0b' },
  { id: 'c5', name: 'Amethyst Purple', hex: '#a855f7' },
  { id: 'c6', name: 'Rose Pink', hex: '#ec4899' },
  { id: 'c7', name: 'Cyan Teal', hex: '#06b6d4' },
  { id: 'c8', name: 'Sunset Orange', hex: '#f97316' },
];

/**
 * Chapter 6.1: Validates Vertex Colouring
 */
export function validateColoring(nodes, edges, nodeColors = {}) {
  const conflicts = [];
  const conflictingNodeIds = new Set();
  const conflictingEdgeIds = new Set();

  let coloredCount = 0;
  const usedColors = new Set();

  nodes.forEach(node => {
    const color = nodeColors[node.id] || node.color;
    if (color) {
      coloredCount++;
      usedColors.add(color);
    }
  });

  edges.forEach(edge => {
    const colorU = nodeColors[edge.source] || nodes.find(n => n.id === edge.source)?.color;
    const colorV = nodeColors[edge.target] || nodes.find(n => n.id === edge.target)?.color;

    if (colorU && colorV && colorU === colorV && edge.source !== edge.target) {
      conflicts.push({
        edgeId: edge.id,
        source: edge.source,
        target: edge.target,
        color: colorU,
      });
      conflictingNodeIds.add(edge.source);
      conflictingNodeIds.add(edge.target);
      conflictingEdgeIds.add(edge.id);
    }
  });

  const isComplete = nodes.length > 0 && coloredCount === nodes.length;
  const isValid = conflicts.length === 0;

  return {
    isValid,
    isComplete,
    isProper: isValid && isComplete,
    conflicts,
    conflictingNodeIds,
    conflictingEdgeIds,
    uniqueColorsCount: usedColors.size,
    coloredCount,
    totalNodes: nodes.length,
  };
}

/**
 * Chapter 6.2: Greedy Colouring Algorithm with Step-by-Step generator
 */
export function runGreedyColoring(nodes, edges, ordering = 'welsh-powell') {
  if (nodes.length === 0) {
    return { coloring: {}, colorCount: 0, steps: [] };
  }

  const adj = getAdjacencyList(nodes, edges);
  const { degrees } = calculateDegrees(nodes, edges);

  let orderedNodes = [...nodes];
  if (ordering === 'welsh-powell') {
    orderedNodes.sort((a, b) => (degrees[b.id] || 0) - (degrees[a.id] || 0));
  } else if (ordering === 'natural') {
    orderedNodes.sort((a, b) => (a.label || a.id).localeCompare(b.label || b.id));
  } else if (ordering === 'random') {
    orderedNodes.sort(() => Math.random() - 0.5);
  }

  const coloring = {};
  const steps = [];

  orderedNodes.forEach((node, idx) => {
    const neighborIds = adj.get(node.id) || [];
    const usedColors = new Set();
    const neighborDetails = [];

    neighborIds.forEach(nId => {
      const neighborNode = nodes.find(n => n.id === nId);
      const nColor = coloring[nId];
      if (nColor) {
        usedColors.add(nColor);
        neighborDetails.push({
          id: nId,
          label: neighborNode?.label || nId,
          color: nColor,
        });
      }
    });

    let assignedColor = null;
    let colorIndex = 0;

    for (let i = 0; i < COLOR_PALETTE.length; i++) {
      if (!usedColors.has(COLOR_PALETTE[i].hex)) {
        assignedColor = COLOR_PALETTE[i].hex;
        colorIndex = i;
        break;
      }
    }

    if (!assignedColor) {
      let candidate = 0;
      while (true) {
        const hex = `hsl(${candidate * 55}, 70%, 50%)`;
        if (!usedColors.has(hex)) {
          assignedColor = hex;
          colorIndex = candidate;
          break;
        }
        candidate++;
      }
    }

    coloring[node.id] = assignedColor;

    const colorObj = COLOR_PALETTE[colorIndex] || { name: `Color #${colorIndex + 1}`, hex: assignedColor };

    let explanation = '';
    if (neighborDetails.length === 0) {
      explanation = `Vertex ${node.label || node.id} has no colored neighbors yet. Smallest available color assigned: ${colorObj.name}.`;
    } else {
      const neighborNames = neighborDetails
        .map(n => `${n.label} (${COLOR_PALETTE.find(c => c.hex === n.color)?.name || 'Custom'})`)
        .join(', ');
      explanation = `Vertex ${node.label || node.id} neighbors already use: ${neighborNames}. Smallest available color: ${colorObj.name}.`;
    }

    steps.push({
      stepNumber: idx + 1,
      totalSteps: orderedNodes.length,
      nodeId: node.id,
      nodeLabel: node.label || node.id,
      degree: degrees[node.id] || 0,
      assignedColor,
      assignedColorName: colorObj.name,
      assignedColorHex: assignedColor,
      neighborDetails,
      usedNeighborColors: Array.from(usedColors),
      explanation,
      partialColoring: { ...coloring },
    });
  });

  const uniqueColors = new Set(Object.values(coloring));

  return {
    coloring,
    colorCount: uniqueColors.size,
    steps,
    orderedNodes: orderedNodes.map(n => ({ id: n.id, label: n.label || n.id })),
  };
}

/**
 * Chapter 6.3: Critical Graphs Analysis
 * A graph is vertex-critical if removing any vertex decreases the chromatic number.
 */
export function checkVertexCriticality(nodes, edges) {
  const originalChi = computeChromaticNumber(nodes, edges).exact;
  if (originalChi === null || originalChi <= 1) {
    return {
      isCritical: false,
      originalChi,
      criticalNodes: [],
      description: 'Graph has chromatic number ≤ 1 or is too large to compute criticality.',
    };
  }

  const criticalNodes = [];
  const nonCriticalNodes = [];

  nodes.forEach(node => {
    const subNodes = nodes.filter(n => n.id !== node.id);
    const subEdges = edges.filter(e => e.source !== node.id && e.target !== node.id);
    const subChi = computeChromaticNumber(subNodes, subEdges).exact;

    if (subChi < originalChi) {
      criticalNodes.push({ id: node.id, label: node.label || node.id, subChi });
    } else {
      nonCriticalNodes.push({ id: node.id, label: node.label || node.id, subChi });
    }
  });

  const isCritical = criticalNodes.length === nodes.length;

  return {
    isCritical,
    originalChi,
    criticalNodes,
    nonCriticalNodes,
    description: isCritical
      ? `✓ This graph is ${originalChi}-critical! Removing ANY vertex reduces χ(G) from ${originalChi} to ${originalChi - 1}.`
      : `This graph is not vertex-critical. Only ${criticalNodes.length} of ${nodes.length} vertices reduce χ(G) when removed.`,
  };
}

/**
 * Exact Chromatic Number solver
 */
export function computeChromaticNumber(nodes, edges) {
  const n = nodes.length;
  const m = edges.length;

  if (n === 0) return { exact: 0, isExact: true, description: 'Empty graph has χ(G) = 0.' };
  if (m === 0) return { exact: 1, isExact: true, description: 'Graph with no edges has χ(G) = 1.' };

  const { maxDegree } = calculateDegrees(nodes, edges);

  if (isBipartite(nodes, edges)) {
    return {
      exact: 2,
      isExact: true,
      description: 'Bipartite graph has χ(G) = 2 (contains no odd cycles).',
    };
  }

  if (m === (n * (n - 1)) / 2) {
    return {
      exact: n,
      isExact: true,
      description: `Complete graph K${n} has χ(G) = ${n}.`,
    };
  }

  if (n <= 16) {
    const exact = findExactChromaticNumber(nodes, edges);
    return {
      exact,
      isExact: true,
      greedyUpperBound: maxDegree + 1,
      description: `Exact chromatic number: χ(G) = ${exact}. By Brook's theorem, χ(G) ≤ ${maxDegree + 1}.`,
    };
  }

  const greedy = runGreedyColoring(nodes, edges, 'welsh-powell');
  return {
    exact: null,
    greedyUpperBound: greedy.colorCount,
    isExact: false,
    description: `Greedy heuristic upper bound: χ(G) ≤ ${greedy.colorCount}.`,
  };
}

export function computeExactChromaticNumber(nodes, edges) {
  const res = computeChromaticNumber(nodes, edges);
  return res.exact ?? res.greedyUpperBound ?? 2;
}


function findExactChromaticNumber(nodes, edges) {
  const adj = getAdjacencyList(nodes, edges);
  const n = nodes.length;

  for (let k = 1; k <= n; k++) {
    const colors = new Array(n).fill(-1);
    if (canColorWithK(0, k, nodes, adj, colors)) {
      return k;
    }
  }
  return n;
}

function canColorWithK(nodeIndex, k, nodes, adj, colors) {
  if (nodeIndex === nodes.length) return true;

  const currentId = nodes[nodeIndex].id;
  const neighbors = adj.get(currentId) || [];

  for (let color = 0; color < k; color++) {
    let safe = true;
    for (const neighborId of neighbors) {
      const neighborIdx = nodes.findIndex(n => n.id === neighborId);
      if (neighborIdx !== -1 && colors[neighborIdx] === color) {
        safe = false;
        break;
      }
    }

    if (safe) {
      colors[nodeIndex] = color;
      if (canColorWithK(nodeIndex + 1, k, nodes, adj, colors)) {
        return true;
      }
      colors[nodeIndex] = -1;
    }
  }

  return false;
}
