import React from 'react';

export default function MiniGraphCanvas({
  nodes = [],
  edges = [],
  width = 240,
  height = 160,
  className = '',
  highlightedNodes = [],
  highlightedEdges = [],
}) {
  // Compute bounding box or normalize to fit width and height
  if (nodes.length === 0) {
    return (
      <div
        style={{ width: `${width}px`, height: `${height}px` }}
        className={`flex items-center justify-center bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-500 ${className}`}
      >
        Empty Graph
      </div>
    );
  }

  // Find min/max bounds
  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const padding = 28;
  const graphWidth = maxX - minX || 1;
  const graphHeight = maxY - minY || 1;

  const scaleX = (width - 2 * padding) / graphWidth;
  const scaleY = (height - 2 * padding) / graphHeight;
  const scale = Math.min(scaleX, scaleY, 1.2);

  const offsetX = (width - graphWidth * scale) / 2 - minX * scale;
  const offsetY = (height - graphHeight * scale) / 2 - minY * scale;

  return (
    <svg
      width={width}
      height={height}
      className={`bg-slate-950/70 rounded-xl border border-slate-800/80 block ${className}`}
    >
      <defs>
        <pattern id={`mini-grid-${Math.random()}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="0.8" fill="#334155" opacity="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-dots)" opacity="0.3" />

      <g>
        {/* Edges */}
        {edges.map(edge => {
          const u = nodes.find(n => n.id === edge.source);
          const v = nodes.find(n => n.id === edge.target);
          if (!u || !v) return null;

          const isHighlighted = highlightedEdges.includes(edge.id);

          return (
            <line
              key={edge.id}
              x1={u.x * scale + offsetX}
              y1={u.y * scale + offsetY}
              x2={v.x * scale + offsetX}
              y2={v.y * scale + offsetY}
              stroke={isHighlighted ? '#38bdf8' : '#475569'}
              strokeWidth={isHighlighted ? 2.5 : 1.8}
              strokeLinecap="round"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const cx = node.x * scale + offsetX;
          const cy = node.y * scale + offsetY;
          const isHighlighted = highlightedNodes.includes(node.id);

          return (
            <g key={node.id}>
              <circle
                cx={cx}
                cy={cy}
                r={12}
                fill={node.color || (isHighlighted ? '#38bdf8' : '#1e293b')}
                stroke={isHighlighted ? '#ffffff' : '#64748b'}
                strokeWidth={1.5}
              />
              <text
                x={cx}
                y={cy}
                dy="0.35em"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                fontFamily="var(--font-mono)"
              >
                {node.label || node.id}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
