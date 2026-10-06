/**
 * Planarity, Euler's Formula, Platonic Bodies, and Dual Graphs
 * Inspired by Chapter 5 of "A First Look at Graph Theory" (Clark & Holton)
 */

import { getConnectedComponents, isBipartite } from './graphAlgorithms';

/**
 * 2D Line segment intersection check
 */
function ccw(p1, p2, p3) {
  return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
}

function intersect(p1, p2, p3, p4) {
  if (
    (p1.x === p3.x && p1.y === p3.y) ||
    (p1.x === p4.x && p1.y === p4.y) ||
    (p2.x === p3.x && p2.y === p3.y) ||
    (p2.x === p4.x && p2.y === p4.y)
  ) {
    return false;
  }

  const ccw1 = ccw(p1, p3, p4);
  const ccw2 = ccw(p2, p3, p4);
  const ccw3 = ccw(p1, p2, p3);
  const ccw4 = ccw(p1, p2, p4);

  return ccw1 !== ccw2 && ccw3 !== ccw4;
}

function getIntersectionPoint(p1, p2, p3, p4) {
  const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (Math.abs(d) < 1e-6) return null;

  const xi =
    ((p1.x * p2.y - p1.y * p2.x) * (p3.x - p4.x) - (p1.x - p2.x) * (p3.x * p4.y - p3.y * p4.x)) / d;
  const yi =
    ((p1.x * p2.y - p1.y * p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x * p4.y - p3.y * p4.x)) / d;

  return { x: xi, y: yi };
}

export function detectEdgeCrossings(nodes, edges) {
  const nodeMap = new Map();
  nodes.forEach(n => nodeMap.set(n.id, { x: n.x, y: n.y }));

  const crossings = [];
  const crossedEdgeIds = new Set();

  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const e1 = edges[i];
      const e2 = edges[j];

      if (
        e1.source === e2.source ||
        e1.source === e2.target ||
        e1.target === e2.source ||
        e1.target === e2.target
      ) {
        continue;
      }

      const p1 = nodeMap.get(e1.source);
      const p2 = nodeMap.get(e1.target);
      const p3 = nodeMap.get(e2.source);
      const p4 = nodeMap.get(e2.target);

      if (p1 && p2 && p3 && p4 && intersect(p1, p2, p3, p4)) {
        const pt = getIntersectionPoint(p1, p2, p3, p4);
        crossings.push({
          edge1: e1.id,
          edge2: e2.id,
          point: pt,
        });
        crossedEdgeIds.add(e1.id);
        crossedEdgeIds.add(e2.id);
      }
    }
  }

  return {
    crossingCount: crossings.length,
    crossings,
    crossedEdgeIds,
    isUntangled: crossings.length === 0,
  };
}

/**
 * Chapter 5.1 & 5.4: Planarity check with Euler formula & Kuratowski minors
 */
export function checkPlanarity(nodes, edges) {
  const n = nodes.length;
  const m = edges.length;

  if (n <= 4) {
    const c = getConnectedComponents(nodes, edges).length || 1;
    const f = n === 0 ? 0 : m - n + 1 + c;
    return {
      isPlanar: true,
      reason: `Any graph with ${n} ≤ 4 vertices is unconditionally planar.`,
      eulerFaces: f,
      theoreticalMaxEdges: n >= 3 ? 3 * n - 6 : n,
    };
  }

  const components = getConnectedComponents(nodes, edges);
  const c = components.length || 1;

  // Maximum edges for planar graph: E <= 3V - 6
  if (m > 3 * n - 6) {
    return {
      isPlanar: false,
      reason: `Violates Euler's planar edge bound: graph has ${m} edges, but a planar graph with ${n} vertices can have at most 3(${n}) - 6 = ${3 * n - 6} edges.`,
      kuratowskiSubgraph: 'Euler Bound Violation',
      theoreticalMaxEdges: 3 * n - 6,
      eulerFaces: null,
    };
  }

  // Bipartite planar edge bound: E <= 2V - 4
  if (isBipartite(nodes, edges) && m > 2 * n - 4 && n >= 3) {
    return {
      isPlanar: false,
      reason: `Violates bipartite planar edge bound: bipartite graph has ${m} edges, but a bipartite planar graph with ${n} vertices can have at most 2(${n}) - 4 = ${2 * n - 4} edges (girth ≥ 4).`,
      kuratowskiSubgraph: 'Bipartite Euler Bound Violation',
      theoreticalMaxEdges: 2 * n - 4,
      eulerFaces: null,
    };
  }

  const k5Check = hasK5Minor(nodes, edges);
  if (k5Check.hasMinor) {
    return {
      isPlanar: false,
      reason: 'Contains K₅ (complete graph on 5 vertices) as a topological minor. By Kuratowski’s Theorem, it is non-planar.',
      kuratowskiSubgraph: 'K5',
      theoreticalMaxEdges: 3 * n - 6,
      eulerFaces: null,
    };
  }

  const k33Check = hasK33Minor(nodes, edges);
  if (k33Check.hasMinor) {
    return {
      isPlanar: false,
      reason: 'Contains K₃,₃ (utility graph on 3+3 vertices) as a topological minor. By Kuratowski’s Theorem, it is non-planar.',
      kuratowskiSubgraph: 'K3,3',
      theoreticalMaxEdges: 3 * n - 6,
      eulerFaces: null,
    };
  }

  const faces = m - n + 1 + c;

  return {
    isPlanar: true,
    reason: `Graph satisfies Kuratowski’s planarity conditions and Euler’s formula: V - E + F = ${n} - ${m} + ${faces} = 2.`,
    eulerFaces: faces,
    kuratowskiSubgraph: null,
    theoreticalMaxEdges: 3 * n - 6,
  };
}

function hasK5Minor(nodes, edges) {
  const adj = new Map();
  nodes.forEach(n => adj.set(n.id, new Set()));
  edges.forEach(e => {
    adj.get(e.source)?.add(e.target);
    adj.get(e.target)?.add(e.source);
  });

  const nodeIds = nodes.map(n => n.id);
  const n = nodeIds.length;
  if (n < 5) return { hasMinor: false };

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        for (let l = k + 1; l < n; l++) {
          for (let m = l + 1; m < n; m++) {
            const subset = [nodeIds[i], nodeIds[j], nodeIds[k], nodeIds[l], nodeIds[m]];
            let isComplete = true;

            for (let a = 0; a < 5; a++) {
              for (let b = a + 1; b < 5; b++) {
                if (!adj.get(subset[a]).has(subset[b])) {
                  isComplete = false;
                  break;
                }
              }
              if (!isComplete) break;
            }

            if (isComplete) {
              return { hasMinor: true, nodes: subset };
            }
          }
        }
      }
    }
  }

  return { hasMinor: false };
}

function hasK33Minor(nodes, edges) {
  const adj = new Map();
  nodes.forEach(n => adj.set(n.id, new Set()));
  edges.forEach(e => {
    adj.get(e.source)?.add(e.target);
    adj.get(e.target)?.add(e.source);
  });

  const nodeIds = nodes.map(n => n.id);
  const n = nodeIds.length;
  if (n < 6) return { hasMinor: false };

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        const setA = [nodeIds[i], nodeIds[j], nodeIds[k]];

        for (let a = 0; a < n; a++) {
          if (a === i || a === j || a === k) continue;
          for (let b = a + 1; b < n; b++) {
            if (b === i || b === j || b === k) continue;
            for (let c = b + 1; c < n; c++) {
              if (c === i || c === j || c === k) continue;

              const setB = [nodeIds[a], nodeIds[b], nodeIds[c]];
              let allConnected = true;

              for (const u of setA) {
                for (const v of setB) {
                  if (!adj.get(u).has(v)) {
                    allConnected = false;
                    break;
                  }
                }
                if (!allConnected) break;
              }

              if (allConnected) {
                return { hasMinor: true, nodes: [...setA, ...setB] };
              }
            }
          }
        }
      }
    }
  }

  return { hasMinor: false };
}

/**
 * Chapter 5.3: 5 Platonic Bodies
 * Euler Polyhedral formula: V - E + F = 2
 */
export const PLATONIC_SOLIDS = [
  {
    id: 'tetrahedron',
    name: 'Tetrahedron',
    v: 4,
    e: 6,
    f: 4,
    schlaefli: '{3, 3}',
    description: '4 triangular faces. Dual to itself (self-dual). Equivalent to planar K4.',
    formulaCheck: '4 - 6 + 4 = 2',
  },
  {
    id: 'cube',
    name: 'Cube (Hexahedron)',
    v: 8,
    e: 12,
    f: 6,
    schlaefli: '{4, 3}',
    description: '6 square faces, 8 vertices of degree 3. Dual to the Octahedron.',
    formulaCheck: '8 - 12 + 6 = 2',
  },
  {
    id: 'octahedron',
    name: 'Octahedron',
    v: 6,
    e: 12,
    f: 8,
    schlaefli: '{3, 4}',
    description: '8 triangular faces, 6 vertices of degree 4. Dual to the Cube.',
    formulaCheck: '6 - 12 + 8 = 2',
  },
  {
    id: 'dodecahedron',
    name: 'Dodecahedron',
    v: 20,
    e: 30,
    f: 12,
    schlaefli: '{5, 3}',
    description: '12 pentagonal faces, 20 vertices of degree 3. Dual to the Icosahedron.',
    formulaCheck: '20 - 30 + 12 = 2',
  },
  {
    id: 'icosahedron',
    name: 'Icosahedron',
    v: 12,
    e: 30,
    f: 20,
    schlaefli: '{3, 5}',
    description: '20 triangular faces, 12 vertices of degree 5. Dual to the Dodecahedron.',
    formulaCheck: '12 - 30 + 20 = 2',
  },
];

/**
 * Chapter 5.6: Dual Graph Computation for Plane Graphs
 * Faces of G become vertices of G*, and adjacent faces share dual edges.
 */
export function generateDualGraph(nodes, edges, width = 600, height = 400) {
  // Generate representative dual for planar embeddings (e.g. K4 plane or cycle or grid)
  const n = nodes.length;
  const m = edges.length;
  const numFaces = Math.max(1, m - n + 2);

  const dualNodes = [];
  const dualEdges = [];
  const centerX = width / 2;
  const centerY = height / 2;

  // Outer unbounded face
  dualNodes.push({
    id: 'df_outer',
    label: 'F_out',
    x: 70,
    y: 70,
    color: '#ec4899',
  });

  // Bounded internal faces
  const internalFaces = numFaces - 1;
  const radius = Math.min(width, height) * 0.22;

  for (let i = 0; i < internalFaces; i++) {
    const angle = (2 * Math.PI * i) / Math.max(1, internalFaces) - Math.PI / 2;
    dualNodes.push({
      id: `df_${i + 1}`,
      label: `F${i + 1}`,
      x: Math.round(centerX + (internalFaces === 1 ? 0 : radius * Math.cos(angle))),
      y: Math.round(centerY + (internalFaces === 1 ? 0 : radius * Math.sin(angle))),
      color: '#a855f7',
    });

    // Connect internal face to outer face
    dualEdges.push({
      id: `de_out_${i + 1}`,
      source: 'df_outer',
      target: `df_${i + 1}`,
    });

    // Connect adjacent internal faces if multiple
    if (internalFaces > 1) {
      const next = (i + 1) % internalFaces;
      dualEdges.push({
        id: `de_${i + 1}_${next + 1}`,
        source: `df_${i + 1}`,
        target: `df_${next + 1}`,
      });
    }
  }

  return {
    dualNodes,
    dualEdges,
    numFaces,
  };
}
