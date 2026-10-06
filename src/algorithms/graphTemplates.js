/**
 * Predefined Graph Templates for ColorCraft & PlanarPlay
 * Discrete Mathematical Structures (DMS)
 * Incorporating Platonic Bodies, Real-World Models, and Planar Duals
 */

export function generatePathGraph(n = 5, width = 600, height = 400) {
  const nodes = [];
  const edges = [];
  const padding = 80;
  const stepX = (width - 2 * padding) / Math.max(1, n - 1);
  const y = height / 2;

  for (let i = 0; i < n; i++) {
    const label = String.fromCharCode(65 + i);
    nodes.push({
      id: `v${i + 1}`,
      label,
      x: Math.round(padding + i * stepX),
      y: Math.round(y + (i % 2 === 0 ? -25 : 25)),
      color: null,
    });
    if (i > 0) {
      edges.push({
        id: `e_${i}_${i + 1}`,
        source: `v${i}`,
        target: `v${i + 1}`,
      });
    }
  }

  return {
    name: `Path Graph P${n}`,
    description: `A path graph with ${n} vertices and ${n - 1} edges. Always planar and 2-colorable.`,
    nodes,
    edges,
  };
}

export function generateCycleGraph(n = 5, width = 600, height = 400) {
  const nodes = [];
  const edges = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const label = String.fromCharCode(65 + i);
    nodes.push({
      id: `v${i + 1}`,
      label,
      x: Math.round(centerX + radius * Math.cos(angle)),
      y: Math.round(centerY + radius * Math.sin(angle)),
      color: null,
    });
  }

  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    edges.push({
      id: `e_${i + 1}_${next + 1}`,
      source: `v${i + 1}`,
      target: `v${next + 1}`,
    });
  }

  return {
    name: `Cycle Graph C${n}`,
    description: `A cycle graph with ${n} vertices and ${n} edges. Chromatic number χ = ${n % 2 === 0 ? 2 : 3}.`,
    nodes,
    edges,
  };
}

export function generateCompleteGraph(n = 4, width = 600, height = 400, tangled = false) {
  const nodes = [];
  const edges = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  for (let i = 0; i < n; i++) {
    let angle = (2 * Math.PI * i) / n - Math.PI / 2;
    if (tangled && n === 4) {
      const coords = [
        { x: centerX - 120, y: centerY - 100 },
        { x: centerX + 120, y: centerY + 100 },
        { x: centerX + 120, y: centerY - 100 },
        { x: centerX - 120, y: centerY + 100 },
      ];
      nodes.push({
        id: `v${i + 1}`,
        label: String.fromCharCode(65 + i),
        x: coords[i].x,
        y: coords[i].y,
        color: null,
      });
      continue;
    }

    nodes.push({
      id: `v${i + 1}`,
      label: String.fromCharCode(65 + i),
      x: Math.round(centerX + radius * Math.cos(angle)),
      y: Math.round(centerY + radius * Math.sin(angle)),
      color: null,
    });
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      edges.push({
        id: `e_${i + 1}_${j + 1}`,
        source: `v${i + 1}`,
        target: `v${j + 1}`,
      });
    }
  }

  const isPlanar = n <= 4;
  return {
    name: `Complete Graph K${n}`,
    description: `Complete graph K${n} has ${n} vertices and ${(n * (n - 1)) / 2} edges. Chromatic number χ = ${n}. ${isPlanar ? 'Planar (n ≤ 4).' : 'Non-Planar (Kuratowski forbidden minor).'
      }`,
    nodes,
    edges,
  };
}

export function generateCompleteBipartiteGraph(m = 3, n = 3, width = 600, height = 400) {
  const nodes = [];
  const edges = [];
  const leftX = width * 0.28;
  const rightX = width * 0.72;

  const leftStep = (height - 120) / Math.max(1, m - 1);
  const rightStep = (height - 120) / Math.max(1, n - 1);

  for (let i = 0; i < m; i++) {
    const y = m === 1 ? height / 2 : 60 + i * leftStep;
    nodes.push({
      id: `a${i + 1}`,
      label: `A${i + 1}`,
      x: Math.round(leftX),
      y: Math.round(y),
      color: null,
    });
  }

  for (let j = 0; j < n; j++) {
    const y = n === 1 ? height / 2 : 60 + j * rightStep;
    nodes.push({
      id: `b${j + 1}`,
      label: `B${j + 1}`,
      x: Math.round(rightX),
      y: Math.round(y),
      color: null,
    });
  }

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      edges.push({
        id: `e_a${i + 1}_b${j + 1}`,
        source: `a${i + 1}`,
        target: `b${j + 1}`,
      });
    }
  }

  const isPlanar = m <= 2 || n <= 2;
  return {
    name: `Complete Bipartite K${m},${n}`,
    description: `Bipartite graph with partitions of size ${m} and ${n} (${m * n} edges). Chromatic number χ = 2. ${isPlanar ? 'Planar.' : 'Non-Planar (Kuratowski forbidden minor).'
      }`,
    nodes,
    edges,
  };
}

export function generateStarGraph(n = 6, width = 600, height = 400) {
  const nodes = [];
  const edges = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  nodes.push({
    id: 'v1',
    label: 'Center',
    x: Math.round(centerX),
    y: Math.round(centerY),
    color: null,
  });

  const leaves = n - 1;
  for (let i = 0; i < leaves; i++) {
    const angle = (2 * Math.PI * i) / leaves - Math.PI / 2;
    nodes.push({
      id: `v${i + 2}`,
      label: String.fromCharCode(65 + i),
      x: Math.round(centerX + radius * Math.cos(angle)),
      y: Math.round(centerY + radius * Math.sin(angle)),
      color: null,
    });

    edges.push({
      id: `e_1_${i + 2}`,
      source: 'v1',
      target: `v${i + 2}`,
    });
  }

  return {
    name: `Star Graph S${n}`,
    description: `Star graph S${n} with 1 hub and ${leaves} leaves. Planar and 2-colorable.`,
    nodes,
    edges,
  };
}

export function generateWheelGraph(n = 6, width = 600, height = 400) {
  const nodes = [];
  const edges = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  nodes.push({
    id: 'v1',
    label: 'Hub',
    x: Math.round(centerX),
    y: Math.round(centerY),
    color: null,
  });

  const rimCount = n - 1;
  for (let i = 0; i < rimCount; i++) {
    const angle = (2 * Math.PI * i) / rimCount - Math.PI / 2;
    nodes.push({
      id: `v${i + 2}`,
      label: String.fromCharCode(65 + i),
      x: Math.round(centerX + radius * Math.cos(angle)),
      y: Math.round(centerY + radius * Math.sin(angle)),
      color: null,
    });

    edges.push({
      id: `e_hub_${i + 2}`,
      source: 'v1',
      target: `v${i + 2}`,
    });
  }

  for (let i = 0; i < rimCount; i++) {
    const next = (i + 1) % rimCount;
    edges.push({
      id: `e_rim_${i + 2}_${next + 2}`,
      source: `v${i + 2}`,
      target: `v${next + 2}`,
    });
  }

  return {
    name: `Wheel Graph W${n}`,
    description: `Wheel graph W${n} with rim cycle C${rimCount} and central hub. Always planar.`,
    nodes,
    edges,
  };
}

export function generateTreeGraph(width = 600, height = 400) {
  const nodes = [
    { id: 'v1', label: 'Root (A)', x: width / 2, y: 70, color: null },
    { id: 'v2', label: 'B', x: width / 4, y: 170, color: null },
    { id: 'v3', label: 'C', x: (3 * width) / 4, y: 170, color: null },
    { id: 'v4', label: 'D', x: width / 8, y: 280, color: null },
    { id: 'v5', label: 'E', x: (3 * width) / 8, y: 280, color: null },
    { id: 'v6', label: 'F', x: (5 * width) / 8, y: 280, color: null },
    { id: 'v7', label: 'G', x: (7 * width) / 8, y: 280, color: null },
  ];

  const edges = [
    { id: 'e1_2', source: 'v1', target: 'v2' },
    { id: 'e1_3', source: 'v1', target: 'v3' },
    { id: 'e2_4', source: 'v2', target: 'v4' },
    { id: 'e2_5', source: 'v2', target: 'v5' },
    { id: 'e3_6', source: 'v3', target: 'v6' },
    { id: 'e3_7', source: 'v3', target: 'v7' },
  ];

  return {
    name: 'Binary Tree (7 Nodes)',
    description: 'Connected acyclic graph with n = 7 vertices and m = 6 edges (|E| = |V| - 1). Always planar and 2-colorable.',
    nodes,
    edges,
  };
}

export function generatePetersenGraph(width = 600, height = 400) {
  const nodes = [];
  const edges = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const outerR = Math.min(width, height) * 0.38;
  const innerR = outerR * 0.52;

  for (let i = 0; i < 5; i++) {
    const angle = (2 * Math.PI * i) / 5 - Math.PI / 2;
    nodes.push({
      id: `o${i + 1}`,
      label: `O${i + 1}`,
      x: Math.round(centerX + outerR * Math.cos(angle)),
      y: Math.round(centerY + outerR * Math.sin(angle)),
      color: null,
    });
  }

  for (let i = 0; i < 5; i++) {
    const angle = (2 * Math.PI * i) / 5 - Math.PI / 2;
    nodes.push({
      id: `i${i + 1}`,
      label: `I${i + 1}`,
      x: Math.round(centerX + innerR * Math.cos(angle)),
      y: Math.round(centerY + innerR * Math.sin(angle)),
      color: null,
    });
  }

  for (let i = 0; i < 5; i++) {
    edges.push({
      id: `e_o_${i + 1}_${((i + 1) % 5) + 1}`,
      source: `o${i + 1}`,
      target: `o${((i + 1) % 5) + 1}`,
    });
    edges.push({
      id: `e_i_${i + 1}_${((i + 2) % 5) + 1}`,
      source: `i${i + 1}`,
      target: `i${((i + 2) % 5) + 1}`,
    });
    edges.push({
      id: `e_spoke_${i + 1}`,
      source: `o${i + 1}`,
      target: `i${i + 1}`,
    });
  }

  return {
    name: 'Petersen Graph',
    description: '3-regular cubic graph on 10 vertices and 15 edges. Non-planar, non-hamiltonian, χ = 3.',
    nodes,
    edges,
  };
}

export function generateDisconnectedGraph(width = 600, height = 400) {
  const nodes = [
    { id: 'v1', label: 'A', x: width * 0.25, y: height * 0.3, color: null },
    { id: 'v2', label: 'B', x: width * 0.15, y: height * 0.7, color: null },
    { id: 'v3', label: 'C', x: width * 0.35, y: height * 0.7, color: null },
    { id: 'v4', label: 'D', x: width * 0.65, y: height * 0.3, color: null },
    { id: 'v5', label: 'E', x: width * 0.85, y: height * 0.3, color: null },
    { id: 'v6', label: 'F', x: width * 0.85, y: height * 0.7, color: null },
    { id: 'v7', label: 'G', x: width * 0.65, y: height * 0.7, color: null },
  ];

  const edges = [
    { id: 'e1', source: 'v1', target: 'v2' },
    { id: 'e2', source: 'v2', target: 'v3' },
    { id: 'e3', source: 'v3', target: 'v1' },
    { id: 'e4', source: 'v4', target: 'v5' },
    { id: 'e5', source: 'v5', target: 'v6' },
    { id: 'e6', source: 'v6', target: 'v7' },
    { id: 'e7', source: 'v7', target: 'v4' },
  ];

  return {
    name: 'Disconnected Graph (2 Components)',
    description: 'Graph with 7 vertices split into 2 separate connected components (Triangle K3 and Cycle C4).',
    nodes,
    edges,
  };
}

/**
 * Chapter 5.3: Platonic Bodies Planar Graph Generators
 */
export function generatePlatonicGraph(solidKey = 'cube', width = 600, height = 400) {
  const cx = width / 2;
  const cy = height / 2;

  if (solidKey === 'tetrahedron') {
    return {
      name: 'Tetrahedron Graph (K4)',
      description: '4 vertices, 6 edges, 4 triangular faces. Euler: 4 - 6 + 4 = 2.',
      nodes: [
        { id: 'v1', label: 'A', x: cx, y: cy - 130, color: '#a855f7' },
        { id: 'v2', label: 'B', x: cx - 140, y: cy + 110, color: '#3b82f6' },
        { id: 'v3', label: 'C', x: cx + 140, y: cy + 110, color: '#10b981' },
        { id: 'v4', label: 'D (Center)', x: cx, y: cy + 20, color: '#f59e0b' },
      ],
      edges: [
        { id: 'e1', source: 'v1', target: 'v2' },
        { id: 'e2', source: 'v2', target: 'v3' },
        { id: 'e3', source: 'v3', target: 'v1' },
        { id: 'e4', source: 'v1', target: 'v4' },
        { id: 'e5', source: 'v2', target: 'v4' },
        { id: 'e6', source: 'v3', target: 'v4' },
      ],
    };
  }

  if (solidKey === 'octahedron') {
    // 6 vertices, 12 edges (Planar 3-cycle inside 3-cycle)
    const r1 = 150;
    const r2 = 70;
    const nodes = [];
    for (let i = 0; i < 3; i++) {
      const a = (2 * Math.PI * i) / 3 - Math.PI / 2;
      nodes.push({
        id: `o${i + 1}`,
        label: `O${i + 1}`,
        x: Math.round(cx + r1 * Math.cos(a)),
        y: Math.round(cy + r1 * Math.sin(a)),
        color: '#ec4899',
      });
    }
    for (let i = 0; i < 3; i++) {
      const a = (2 * Math.PI * i) / 3 + Math.PI / 2;
      nodes.push({
        id: `i${i + 1}`,
        label: `I${i + 1}`,
        x: Math.round(cx + r2 * Math.cos(a)),
        y: Math.round(cy + r2 * Math.sin(a)),
        color: '#06b6d4',
      });
    }
    const edges = [
      { id: 'e_o1_2', source: 'o1', target: 'o2' },
      { id: 'e_o2_3', source: 'o2', target: 'o3' },
      { id: 'e_o3_1', source: 'o3', target: 'o1' },
      { id: 'e_i1_2', source: 'i1', target: 'i2' },
      { id: 'e_i2_3', source: 'i2', target: 'i3' },
      { id: 'e_i3_1', source: 'i3', target: 'i1' },
      { id: 'e_c1', source: 'o1', target: 'i2' },
      { id: 'e_c2', source: 'o1', target: 'i3' },
      { id: 'e_c3', source: 'o2', target: 'i1' },
      { id: 'e_c4', source: 'o2', target: 'i3' },
      { id: 'e_c5', source: 'o3', target: 'i1' },
      { id: 'e_c6', source: 'o3', target: 'i2' },
    ];
    return {
      name: 'Octahedron Graph',
      description: '6 vertices, 12 edges, 8 faces. Euler formula: 6 - 12 + 8 = 2.',
      nodes,
      edges,
    };
  }

  // Default: Cube (Hexahedron) planar embedding
  const outerR = 150;
  const innerR = 75;
  const nodes = [];
  for (let i = 0; i < 4; i++) {
    const a = (2 * Math.PI * i) / 4 - Math.PI / 4;
    nodes.push({
      id: `o${i + 1}`,
      label: `O${i + 1}`,
      x: Math.round(cx + outerR * Math.cos(a)),
      y: Math.round(cy + outerR * Math.sin(a)),
      color: '#3b82f6',
    });
  }
  for (let i = 0; i < 4; i++) {
    const a = (2 * Math.PI * i) / 4 - Math.PI / 4;
    nodes.push({
      id: `i${i + 1}`,
      label: `I${i + 1}`,
      x: Math.round(cx + innerR * Math.cos(a)),
      y: Math.round(cy + innerR * Math.sin(a)),
      color: '#a855f7',
    });
  }
  const edges = [
    { id: 'eo1', source: 'o1', target: 'o2' },
    { id: 'eo2', source: 'o2', target: 'o3' },
    { id: 'eo3', source: 'o3', target: 'o4' },
    { id: 'eo4', source: 'o4', target: 'o1' },
    { id: 'ei1', source: 'i1', target: 'i2' },
    { id: 'ei2', source: 'i2', target: 'i3' },
    { id: 'ei3', source: 'i3', target: 'i4' },
    { id: 'ei4', source: 'i4', target: 'i1' },
    { id: 'ec1', source: 'o1', target: 'i1' },
    { id: 'ec2', source: 'o2', target: 'i2' },
    { id: 'ec3', source: 'o3', target: 'i3' },
    { id: 'ec4', source: 'o4', target: 'i4' },
  ];

  return {
    name: 'Cube (Hexahedron) Graph',
    description: '8 vertices, 12 edges, 6 faces. Euler formula: 8 - 12 + 6 = 2.',
    nodes,
    edges,
  };
}

/**
 * Chapter 1.2: Graphs as Models (Real-World Applied Scenarios)
 */
export function generateRealWorldModel(scenarioKey = 'social', width = 600, height = 400) {
  const cx = width / 2;
  const cy = height / 2;

  if (scenarioKey === 'social') {
    return {
      name: 'Social Network Model',
      description: 'People represent vertices; friendships or mutual collaborations represent undirected edges.',
      nodes: [
        { id: 'n1', label: 'Alice', x: cx - 120, y: cy - 90, color: '#38bdf8' },
        { id: 'n2', label: 'Bob', x: cx + 120, y: cy - 90, color: '#a855f7' },
        { id: 'n3', label: 'Charlie', x: cx + 140, y: cy + 70, color: '#10b981' },
        { id: 'n4', label: 'Diana', x: cx - 140, y: cy + 70, color: '#f59e0b' },
        { id: 'n5', label: 'Ethan', x: cx, y: cy + 110, color: '#ec4899' },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n1', target: 'n4' },
        { id: 'e3', source: 'n2', target: 'n3' },
        { id: 'e4', source: 'n3', target: 'n5' },
        { id: 'e5', source: 'n4', target: 'n5' },
        { id: 'e6', source: 'n2', target: 'n5' },
      ],
    };
  }

  if (scenarioKey === 'campus') {
    return {
      name: 'Campus Building Network',
      description: 'Campus buildings represent vertices; pedestrian walkways represent edges.',
      nodes: [
        { id: 'c1', label: 'Library', x: cx, y: cy - 120, color: '#38bdf8' },
        { id: 'c2', label: 'Science Hall', x: cx - 150, y: cy - 20, color: '#10b981' },
        { id: 'c3', label: 'Student Union', x: cx + 150, y: cy - 20, color: '#f59e0b' },
        { id: 'c4', label: 'Dorms', x: cx - 110, y: cy + 100, color: '#a855f7' },
        { id: 'c5', label: 'Sports Arena', x: cx + 110, y: cy + 100, color: '#ec4899' },
      ],
      edges: [
        { id: 'e1', source: 'c1', target: 'c2' },
        { id: 'e2', source: 'c1', target: 'c3' },
        { id: 'e3', source: 'c2', target: 'c4' },
        { id: 'e4', source: 'c3', target: 'c5' },
        { id: 'e5', source: 'c4', target: 'c5' },
        { id: 'e6', source: 'c1', target: 'c4' },
        { id: 'e7', source: 'c1', target: 'c5' },
      ],
    };
  }

  if (scenarioKey === 'flights') {
    return {
      name: 'Airline Route Network',
      description: 'Airports represent vertices; direct nonstop flights represent edges.',
      nodes: [
        { id: 'f1', label: 'JFK (NYC)', x: cx - 160, y: cy - 70, color: '#38bdf8' },
        { id: 'f2', label: 'LHR (London)', x: cx, y: cy - 100, color: '#a855f7' },
        { id: 'f3', label: 'CDG (Paris)', x: cx + 140, y: cy - 60, color: '#10b981' },
        { id: 'f4', label: 'DXB (Dubai)', x: cx + 120, y: cy + 90, color: '#f59e0b' },
        { id: 'f5', label: 'HND (Tokyo)', x: cx - 110, y: cy + 90, color: '#ec4899' },
      ],
      edges: [
        { id: 'e1', source: 'f1', target: 'f2' },
        { id: 'e2', source: 'f2', target: 'f3' },
        { id: 'e3', source: 'f3', target: 'f4' },
        { id: 'e4', source: 'f4', target: 'f5' },
        { id: 'e5', source: 'f1', target: 'f5' },
        { id: 'e6', source: 'f2', target: 'f4' },
      ],
    };
  }

  // Computer network
  return {
    name: 'Computer Mesh Network',
    description: 'Server nodes and routers represent vertices; high-speed fiber links represent edges.',
    nodes: [
      { id: 's1', label: 'Gateway 1', x: cx - 130, y: cy - 70, color: '#06b6d4' },
      { id: 's2', label: 'Core Router', x: cx, y: cy, color: '#a855f7' },
      { id: 's3', label: 'Gateway 2', x: cx + 130, y: cy - 70, color: '#38bdf8' },
      { id: 's4', label: 'DB Server', x: cx - 100, y: cy + 100, color: '#10b981' },
      { id: 's5', label: 'Web Server', x: cx + 100, y: cy + 100, color: '#f59e0b' },
    ],
    edges: [
      { id: 'e1', source: 's1', target: 's2' },
      { id: 'e2', source: 's3', target: 's2' },
      { id: 'e3', source: 's4', target: 's2' },
      { id: 'e4', source: 's5', target: 's2' },
      { id: 'e5', source: 's4', target: 's5' },
      { id: 'e6', source: 's1', target: 's4' },
      { id: 'e7', source: 's3', target: 's5' },
    ],
  };
}

export function generateRandomGraph(n = 6, density = 0.4, width = 600, height = 400) {
  const nodes = [];
  const edges = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.36;

  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n + (Math.random() - 0.5) * 0.3;
    const r = radius * (0.8 + Math.random() * 0.4);
    nodes.push({
      id: `v${i + 1}`,
      label: String.fromCharCode(65 + i),
      x: Math.round(centerX + r * Math.cos(angle)),
      y: Math.round(centerY + r * Math.sin(angle)),
      color: null,
    });
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.random() < density) {
        edges.push({
          id: `e_${i + 1}_${j + 1}`,
          source: `v${i + 1}`,
          target: `v${j + 1}`,
        });
      }
    }
  }

  return {
    name: `Random Graph (n=${n}, density=${Math.round(density * 100)}%)`,
    description: `Generated random graph with ${n} vertices and ${edges.length} edges.`,
    nodes,
    edges,
  };
}
