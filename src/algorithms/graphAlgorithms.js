/**
 * Comprehensive Graph Theory Algorithms
 * Inspired by "A First Look at Graph Theory" (Clark & Holton)
 * Discrete Mathematical Structures (DMS)
 */

/**
 * Returns adjacency list map
 */
export function getAdjacencyList(nodes, edges) {
  const adj = new Map();
  nodes.forEach(node => adj.set(node.id, []));

  edges.forEach(edge => {
    if (adj.has(edge.source) && adj.has(edge.target)) {
      adj.get(edge.source).push(edge.target);
      if (edge.source !== edge.target) {
        adj.get(edge.target).push(edge.source);
      }
    }
  });

  return adj;
}

/**
 * Calculates degrees and degree invariants
 */
export function calculateDegrees(nodes, edges) {
  const degrees = {};
  nodes.forEach(node => {
    degrees[node.id] = 0;
  });

  edges.forEach(edge => {
    if (degrees[edge.source] !== undefined && degrees[edge.target] !== undefined) {
      degrees[edge.source] += 1;
      if (edge.source !== edge.target) {
        degrees[edge.target] += 1;
      }
    }
  });

  const degValues = Object.values(degrees);
  const n = nodes.length;

  if (n === 0) {
    return {
      degrees,
      maxDegree: 0,
      minDegree: 0,
      avgDegree: 0,
      sumDegrees: 0,
    };
  }

  const maxDegree = Math.max(...degValues);
  const minDegree = Math.min(...degValues);
  const sumDegrees = degValues.reduce((a, b) => a + b, 0);
  const avgDegree = Number((sumDegrees / n).toFixed(2));

  return {
    degrees,
    maxDegree,
    minDegree,
    avgDegree,
    sumDegrees,
  };
}

/**
 * Connected components via BFS
 */
export function getConnectedComponents(nodes, edges) {
  if (nodes.length === 0) return [];

  const adj = getAdjacencyList(nodes, edges);
  const visited = new Set();
  const components = [];

  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      const component = [];
      const queue = [node.id];
      visited.add(node.id);

      while (queue.length > 0) {
        const currentId = queue.shift();
        component.push(currentId);

        const neighbors = adj.get(currentId) || [];
        neighbors.forEach(neighborId => {
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push(neighborId);
          }
        });
      }

      components.push(component);
    }
  });

  return components;
}

export function isGraphConnected(nodes, edges) {
  if (nodes.length <= 1) return true;
  const components = getConnectedComponents(nodes, edges);
  return components.length === 1;
}

/**
 * Generates Adjacency Matrix
 */
export function getAdjacencyMatrix(nodes, edges) {
  const n = nodes.length;
  const idToIndex = new Map();
  nodes.forEach((node, idx) => idToIndex.set(node.id, idx));

  const matrix = Array.from({ length: n }, () => Array(n).fill(0));

  edges.forEach(edge => {
    const u = idToIndex.get(edge.source);
    const v = idToIndex.get(edge.target);
    if (u !== undefined && v !== undefined) {
      matrix[u][v] = 1;
      matrix[v][u] = 1;
    }
  });

  return {
    labels: nodes.map(n => n.label || n.id),
    matrix,
    idToIndex,
  };
}

export function isTree(nodes, edges) {
  if (nodes.length === 0) return false;
  if (nodes.length === 1) return edges.length === 0;
  return isGraphConnected(nodes, edges) && edges.length === nodes.length - 1;
}

export function isBipartite(nodes, edges) {
  if (nodes.length === 0) return true;
  const adj = getAdjacencyList(nodes, edges);
  const colorMap = new Map();

  for (const node of nodes) {
    if (!colorMap.has(node.id)) {
      colorMap.set(node.id, 0);
      const queue = [node.id];

      while (queue.length > 0) {
        const u = queue.shift();
        const uColor = colorMap.get(u);

        for (const v of adj.get(u) || []) {
          if (!colorMap.has(v)) {
            colorMap.set(v, 1 - uColor);
            queue.push(v);
          } else if (colorMap.get(v) === uColor) {
            return false;
          }
        }
      }
    }
  }

  return true;
}

export function calculateDensity(nodes, edges) {
  const n = nodes.length;
  if (n <= 1) return 0;
  const maxEdges = (n * (n - 1)) / 2;
  return Number((edges.length / maxEdges).toFixed(2));
}

export function getNextVertexLabel(existingNodes) {
  const existingLabels = new Set(existingNodes.map(n => n.label));
  let count = 0;
  while (true) {
    let label = '';
    let num = count;
    do {
      label = String.fromCharCode(65 + (num % 26)) + label;
      num = Math.floor(num / 26) - 1;
    } while (num >= 0);

    if (!existingLabels.has(label)) {
      return label;
    }
    count++;
  }
}

/**
 * Chapter 1.6: Walks, Trails, Paths and Cycles Analysis
 * Given an ordered sequence of node IDs [v0, v1, v2, ...]
 */
export function analyzeWalkSequence(sequence, nodes, edges) {
  if (!sequence || sequence.length < 2) {
    return {
      isValid: false,
      type: 'Empty Sequence',
      description: 'Select at least 2 consecutive vertices to analyze a walk.',
    };
  }

  const adj = getAdjacencyList(nodes, edges);
  const edgeSet = new Set();
  const usedEdges = [];
  const visitedVertices = new Set();

  // 1. Verify every step is a valid edge
  for (let i = 0; i < sequence.length - 1; i++) {
    const u = sequence[i];
    const v = sequence[i + 1];
    const neighbors = adj.get(u) || [];

    if (!neighbors.includes(v)) {
      const uLabel = nodes.find(n => n.id === u)?.label || u;
      const vLabel = nodes.find(n => n.id === v)?.label || v;
      return {
        isValid: false,
        type: 'Invalid Walk',
        description: `No edge exists connecting ${uLabel} and ${vLabel}.`,
      };
    }

    const edgeKey = u < v ? `${u}_${v}` : `${v}_${u}`;
    usedEdges.push(edgeKey);
  }

  const isClosed = sequence[0] === sequence[sequence.length - 1];
  const uniqueEdges = new Set(usedEdges);
  const noRepeatedEdges = uniqueEdges.size === usedEdges.length;

  // Check unique internal vertices (excluding end if closed)
  const verticesToCheck = isClosed ? sequence.slice(0, -1) : sequence;
  const uniqueVertices = new Set(verticesToCheck);
  const noRepeatedVertices = uniqueVertices.size === verticesToCheck.length;

  if (isClosed) {
    if (noRepeatedVertices && sequence.length >= 4) {
      return {
        isValid: true,
        type: 'Cycle (C' + (sequence.length - 1) + ')',
        isCycle: true,
        isPath: false,
        isTrail: true,
        isWalk: true,
        description: `A closed path of length ${sequence.length - 1} with no repeated vertices or edges.`,
      };
    }
    if (noRepeatedEdges) {
      return {
        isValid: true,
        type: 'Circuit (Closed Trail)',
        isCycle: false,
        isPath: false,
        isTrail: true,
        isWalk: true,
        description: `A closed walk with no repeated edges.`,
      };
    }
    return {
      isValid: true,
      type: 'Closed Walk',
      isCycle: false,
      isPath: false,
      isTrail: false,
      isWalk: true,
      description: `A sequence of vertices starting and ending at the same node.`,
    };
  }

  // Open sequences
  if (noRepeatedVertices) {
    return {
      isValid: true,
      type: 'Path (P' + sequence.length + ')',
      isCycle: false,
      isPath: true,
      isTrail: true,
      isWalk: true,
      description: `A simple path of length ${sequence.length - 1} with no repeated vertices or edges.`,
    };
  }

  if (noRepeatedEdges) {
    return {
      isValid: true,
      type: 'Trail',
      isCycle: false,
      isPath: false,
      isTrail: true,
      isWalk: true,
      description: `A walk with no repeated edges (vertices may be revisited).`,
    };
  }

  return {
    isValid: true,
    type: 'Walk',
    isCycle: false,
    isPath: false,
    isTrail: false,
    isWalk: true,
    description: `A general sequence of alternating vertices and edges.`,
  };
}

/**
 * Chapter 5.5: Hamiltonian Cycle Verification
 * A Hamiltonian cycle visits every vertex in G exactly once and returns to start.
 */
export function checkHamiltonianCycle(sequence, nodes, edges) {
  if (sequence.length !== nodes.length + 1) {
    return {
      isHamiltonian: false,
      reason: `Sequence has ${sequence.length} vertices, but a Hamiltonian cycle on |V|=${nodes.length} must have exactly ${nodes.length + 1} steps (visiting all ${nodes.length} vertices + returning to start).`,
    };
  }

  const walkAnalysis = analyzeWalkSequence(sequence, nodes, edges);
  if (!walkAnalysis.isValid || !walkAnalysis.isCycle) {
    return {
      isHamiltonian: false,
      reason: walkAnalysis.description || 'Not a valid cycle.',
    };
  }

  const visitedSet = new Set(sequence.slice(0, -1));
  if (visitedSet.size === nodes.length) {
    return {
      isHamiltonian: true,
      reason: `Valid Hamiltonian Cycle! Visits all ${nodes.length} vertices exactly once and returns to ${sequence[0]}.`,
    };
  }

  return {
    isHamiltonian: false,
    reason: 'Did not visit all vertices.',
  };
}

/**
 * Chapter 6.4: Maximum Clique Detection (Bron-Kerbosch)
 * Finds all cliques and the Maximum Clique size omega(G).
 */
export function findCliques(nodes, edges) {
  if (nodes.length === 0) return { maxClique: [], maxCliqueSize: 0, allCliques: [] };

  const adj = new Map();
  nodes.forEach(n => adj.set(n.id, new Set()));
  edges.forEach(e => {
    adj.get(e.source)?.add(e.target);
    adj.get(e.target)?.add(e.source);
  });

  const allCliques = [];

  function bronKerbosch(R, P, X) {
    if (P.size === 0 && X.size === 0) {
      if (R.size > 1) {
        allCliques.push(Array.from(R));
      }
      return;
    }

    // Choose pivot
    const union = new Set([...P, ...X]);
    let pivot = null;
    let maxNeighbors = -1;
    union.forEach(u => {
      const neighbors = adj.get(u) || new Set();
      let count = 0;
      P.forEach(v => { if (neighbors.has(v)) count++; });
      if (count > maxNeighbors) {
        maxNeighbors = count;
        pivot = u;
      }
    });

    const pivotNeighbors = pivot ? adj.get(pivot) || new Set() : new Set();
    const candidates = Array.from(P).filter(v => !pivotNeighbors.has(v));

    for (const v of candidates) {
      const vNeighbors = adj.get(v) || new Set();
      const newR = new Set([...R, v]);
      const newP = new Set([...P].filter(u => vNeighbors.has(u)));
      const newX = new Set([...X].filter(u => vNeighbors.has(u)));

      bronKerbosch(newR, newP, newX);
      P.delete(v);
      X.add(v);
    }
  }

  const P = new Set(nodes.map(n => n.id));
  bronKerbosch(new Set(), P, new Set());

  // Also include single nodes if no edges
  if (allCliques.length === 0 && nodes.length > 0) {
    allCliques.push([nodes[0].id]);
  }

  allCliques.sort((a, b) => b.length - a.length);
  const maxClique = allCliques.length > 0 ? allCliques[0] : (nodes.length > 0 ? [nodes[0].id] : []);

  return {
    maxClique,
    maxCliqueSize: maxClique.length,
    allCliques,
  };
}

/**
 * Chapter 6.5: Edge Colouring Validation & Greedy Algorithm
 * Two edges sharing a common endpoint cannot share the same color.
 * By Vizing's Theorem, chi'(G) = Delta(G) or Delta(G) + 1.
 */
export function validateEdgeColoring(nodes, edges, edgeColors = {}) {
  const conflicts = [];
  const conflictingEdgeIds = new Set();
  const usedColors = new Set();
  let coloredCount = 0;

  edges.forEach(e => {
    const col = edgeColors[e.id] || e.color;
    if (col) {
      coloredCount++;
      usedColors.add(col);
    }
  });

  // Check each pair of edges sharing a vertex
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const e1 = edges[i];
      const e2 = edges[j];
      const col1 = edgeColors[e1.id] || e1.color;
      const col2 = edgeColors[e2.id] || e2.color;

      const shareVertex =
        e1.source === e2.source ||
        e1.source === e2.target ||
        e1.target === e2.source ||
        e1.target === e2.target;

      if (shareVertex && col1 && col2 && col1 === col2) {
        conflicts.push({ edge1: e1.id, edge2: e2.id, color: col1 });
        conflictingEdgeIds.add(e1.id);
        conflictingEdgeIds.add(e2.id);
      }
    }
  }

  const isComplete = edges.length > 0 && coloredCount === edges.length;
  const isValid = conflicts.length === 0;

  return {
    isValid,
    isComplete,
    isProper: isValid && isComplete,
    conflicts,
    conflictingEdgeIds,
    uniqueColorsCount: usedColors.size,
    coloredCount,
    totalEdges: edges.length,
  };
}

export function runGreedyEdgeColoring(nodes, edges) {
  const edgeColors = {};
  const palette = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4', '#f97316'];

  edges.forEach(edge => {
    const neighborColors = new Set();

    edges.forEach(otherEdge => {
      if (otherEdge.id !== edge.id && edgeColors[otherEdge.id]) {
        const shareVertex =
          otherEdge.source === edge.source ||
          otherEdge.source === edge.target ||
          otherEdge.target === edge.source ||
          otherEdge.target === edge.target;

        if (shareVertex) {
          neighborColors.add(edgeColors[otherEdge.id]);
        }
      }
    });

    let assigned = null;
    for (const color of palette) {
      if (!neighborColors.has(color)) {
        assigned = color;
        break;
      }
    }
    if (!assigned) {
      assigned = `hsl(${Math.random() * 360}, 75%, 50%)`;
    }

    edgeColors[edge.id] = assigned;
  });

  const uniqueColors = new Set(Object.values(edgeColors));

  return {
    edgeColors,
    colorCount: uniqueColors.size,
  };
}
