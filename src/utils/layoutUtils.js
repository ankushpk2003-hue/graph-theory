/**
 * Layout and Geometry Utilities for Graph Visualization
 */

/**
 * Arranges vertices in an equidistant circle
 */
export function applyCircleLayout(nodes, width = 600, height = 400) {
  const n = nodes.length;
  if (n === 0) return [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.36;

  return nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return {
      ...node,
      x: Math.round(centerX + radius * Math.cos(angle)),
      y: Math.round(centerY + radius * Math.sin(angle)),
    };
  });
}

/**
 * Arranges vertices in a grid layout
 */
export function applyGridLayout(nodes, width = 600, height = 400) {
  const n = nodes.length;
  if (n === 0) return [];
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const paddingX = 80;
  const paddingY = 80;
  const stepX = (width - 2 * paddingX) / Math.max(1, cols - 1);
  const stepY = (height - 2 * paddingY) / Math.max(1, rows - 1);

  return nodes.map((node, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      ...node,
      x: Math.round(paddingX + col * stepX),
      y: Math.round(paddingY + row * stepY),
    };
  });
}

/**
 * Runs a lightweight 2D spring force simulation step to untangle or space vertices
 */
export function applySpringForceLayout(nodes, edges, width = 600, height = 400, iterations = 60) {
  if (nodes.length <= 1) return nodes;

  let positions = nodes.map(n => ({ id: n.id, x: n.x, y: n.y, vx: 0, vy: 0 }));
  const k = Math.sqrt((width * height) / nodes.length) * 0.75;
  const dt = 0.08;

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsive forces between all node pairs
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[i].x - positions[j].x;
        const dy = positions[i].y - positions[j].y;
        const dist = Math.max(15, Math.sqrt(dx * dx + dy * dy));
        const force = (k * k) / dist;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        positions[i].vx += fx * dt;
        positions[i].vy += fy * dt;
        positions[j].vx -= fx * dt;
        positions[j].vy -= fy * dt;
      }
    }

    // Attractive spring forces along edges
    edges.forEach(edge => {
      const u = positions.find(p => p.id === edge.source);
      const v = positions.find(p => p.id === edge.target);
      if (u && v) {
        const dx = v.x - u.x;
        const dy = v.y - u.y;
        const dist = Math.max(10, Math.sqrt(dx * dx + dy * dy));
        const force = (dist * dist) / k;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        u.vx += fx * dt;
        u.vy += fy * dt;
        v.vx -= fx * dt;
        v.vy -= fy * dt;
      }
    });

    // Central gravity force to keep graph centered
    const cx = width / 2;
    const cy = height / 2;
    positions.forEach(p => {
      p.vx += (cx - p.x) * 0.02;
      p.vy += (cy - p.y) * 0.02;

      // Apply damping & update
      p.x += Math.max(-25, Math.min(25, p.vx * 0.8));
      p.y += Math.max(-25, Math.min(25, p.vy * 0.8));
      p.vx *= 0.5;
      p.vy *= 0.5;

      // Keep inside bounds
      p.x = Math.max(40, Math.min(width - 40, p.x));
      p.y = Math.max(40, Math.min(height - 40, p.y));
    });
  }

  return nodes.map(node => {
    const pos = positions.find(p => p.id === node.id);
    return pos ? { ...node, x: Math.round(pos.x), y: Math.round(pos.y) } : node;
  });
}
