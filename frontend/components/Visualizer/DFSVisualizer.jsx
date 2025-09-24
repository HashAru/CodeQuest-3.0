'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';

// /**
//  * DFSVisualizer.jsx
//  * - Props:
//  *    isPlaying (bool): whether to auto-play traversal
//  *    speed (number): speed multiplier (1 = normal, >1 faster)
//  *    onFinish (fn): optional callback called when traversal completes
//  *
//  * - Place under components/Visualizer/DFSVisualizer.jsx
//  * - Import into app/visualizer/page.jsx:
//  *    import DFSVisualizer from '../../components/Visualizer/DFSVisualizer';
//  *
//  * Usage:
//  *    <DFSVisualizer isPlaying={isPlaying} speed={speed} onFinish={()=>{/*...*/}} />
//  */

const WIDTH = 900;
const ROW_H = 120;
const NODE_R = 22;
const MARGIN_X = 40;
const MARGIN_Y = 30;

// adjust these to change tree size / shape
const NODE_COUNT = 13; // total nodes in tree
const MAX_CHILDREN = 2; // binary-ish tree

// helper: create a random-ish tree (deterministic-ish for same run)
function buildTree(nodeCount = NODE_COUNT, maxChildren = MAX_CHILDREN) {
  if (nodeCount <= 0) return { nodes: [], rootId: null };

  // create nodes
  const nodes = new Array(nodeCount).fill(0).map((_, i) => ({
    id: String(i + 1),
    label: String(i + 1),
    children: []
  }));

  // simple strategy: attach subsequent nodes breadth-first ensuring no node exceeds maxChildren
  let q = [nodes[0]];
  let idx = 1;
  let qi = 0;
  while (idx < nodeCount) {
    if (qi >= q.length) break;
    const parent = q[qi++];
    while (parent.children.length < maxChildren && idx < nodeCount) {
      parent.children.push(nodes[idx]);
      q.push(nodes[idx]);
      idx++;
    }
  }

  return { nodes, rootId: nodes[0].id };
}

// compute levels and layout positions for nodes
function layoutTree(rootId, nodes) {
  if (!rootId) return [];

  const map = new Map(nodes.map(n => [n.id, n]));
  // BFS to compute depth (level) and parent
  const levels = [];
  const q = [{ id: rootId, depth: 0, parentId: null }];
  const visited = new Set();
  const order = []; // BFS order to assist level grouping
  while (q.length) {
    const item = q.shift();
    if (visited.has(item.id)) continue;
    visited.add(item.id);
    order.push(item);
    const node = map.get(item.id);
    const depth = item.depth;
    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(node);
    for (const ch of (node.children || [])) {
      q.push({ id: ch.id, depth: depth + 1, parentId: node.id });
    }
  }

  // compute positions per level
  const layout = {};
  levels.forEach((levelNodes, depth) => {
    const count = levelNodes.length;
    // space horizontally across width minus margins
    const usable = WIDTH - MARGIN_X * 2;
    const space = Math.max(usable / Math.max(1, count), 40);
    levelNodes.forEach((n, i) => {
      const x = MARGIN_X + (i + 0.5) * space;
      const y = MARGIN_Y + depth * ROW_H;
      layout[n.id] = { x, y, depth };
    });
  });

  return layout;
}

// produce DFS pre-order list (node ids)
function dfsOrder(root, nodesMap) {
  const order = [];
  function rec(node) {
    if (!node) return;
    order.push(node.id);
    for (const c of (node.children || [])) rec(c);
  }
  rec(root);
  return order;
}

export default function DFSVisualizer({ isPlaying = false, speed = 1, onFinish = () => {} }) {
  const [seed, setSeed] = useState(0); // used to force new tree
  const { nodes, rootId } = useMemo(() => buildTree(NODE_COUNT, MAX_CHILDREN), [seed]); // rebuild when seed changes
  const nodesMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  const layout = useMemo(() => layoutTree(rootId, nodes), [rootId, nodes]);

  // traversal order (pre-order)
  const order = useMemo(() => {
    if (!rootId) return [];
    const root = nodesMap.get(rootId);
    return dfsOrder(root, nodesMap);
  }, [rootId, nodesMap]);

  // traversal state
  const [index, setIndex] = useState(0); // current index in order (0..order.length)
  const [visitedSet, setVisitedSet] = useState(new Set());
  const [currentNode, setCurrentNode] = useState(null);

  // refs for autoplay loop without stale closures
  const indexRef = useRef(index);
  const playingRef = useRef(isPlaying);
  const speedRef = useRef(speed);
  const orderRef = useRef(order);

  useEffect(() => { indexRef.current = index; }, [index]);
  useEffect(() => { playingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { orderRef.current = order; }, [order]);

  // reset when tree changes (seed)
  useEffect(() => {
    setIndex(0);
    setVisitedSet(new Set());
    setCurrentNode(order[0] || null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, order.length]);

  // step forward/back helpers (guarded)
  const stepForward = () => {
    const ord = orderRef.current;
    if (!ord || ord.length === 0) return;
    if (indexRef.current >= ord.length) return;
    const nextIdx = indexRef.current;
    const nid = ord[nextIdx];
    setVisitedSet(prev => {
      const copy = new Set(prev);
      copy.add(nid);
      return copy;
    });
    setCurrentNode(nid);
    setIndex(i => i + 1);
  };

  const stepBack = () => {
    const ord = orderRef.current;
    if (!ord || ord.length === 0) return;
    if (indexRef.current <= 0) {
      setVisitedSet(new Set());
      setCurrentNode(null);
      setIndex(0);
      return;
    }
    const newIdx = indexRef.current - 1;
    // rebuild visited set from first newIdx elements
    const newVisited = new Set(ord.slice(0, newIdx));
    setVisitedSet(newVisited);
    setCurrentNode(newIdx > 0 ? ord[newIdx - 1] : null);
    setIndex(newIdx);
  };

  const reset = () => {
    setVisitedSet(new Set());
    setCurrentNode(null);
    setIndex(0);
  };

  const newTree = () => {
    setSeed(s => s + 1);
  };

  // autoplay loop
  useEffect(() => {
    let timer = null;
    let canceled = false;
    async function loop() {
      if (canceled) return;
      const ord = orderRef.current;
      if (!ord || ord.length === 0) return;
      if (indexRef.current >= ord.length) {
        // finished
        onFinish && onFinish();
        return;
      }
      stepForward();
      // baseDelay tuned for clearer animation (slower)
      const baseDelay = 900; // ms
      const delay = Math.max(120, Math.round(baseDelay / Math.max(0.25, speedRef.current)));
      timer = setTimeout(() => {
        if (!canceled && playingRef.current) loop();
      }, delay);
    }

    if (playingRef.current) {
      timer = setTimeout(loop, 80);
    }

    return () => {
      canceled = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, speed, seed, order.length]); // re-create loop when these change

  // small helper renderers
  const visited = visitedSet;
  const isVisited = id => visited.has(id);
  const isCurrent = id => id === currentNode;

  // SVG height based on layout max depth
  const maxDepth = Math.max(0, ...Object.values(layout).map(v => v?.depth ?? 0));
  const svgH = (maxDepth + 1) * ROW_H + 80;

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <h3 className="visualizer-title">Depth-First Search (DFS)</h3>
        <div className="visualizer-controls">
          <button 
            onClick={stepBack} 
            className="control-button control-button-secondary"
            disabled={index === 0}
          >
            ◀ Step Back
          </button>
          <button 
            onClick={stepForward} 
            className="control-button control-button-secondary"
            disabled={index >= order.length}
          >
            Step Forward ▶
          </button>
          <button 
            onClick={reset} 
            className="control-button control-button-secondary"
          >
            Reset
          </button>
          <button 
            onClick={newTree} 
            className="control-button control-button-warning"
          >
            New Tree
          </button>
        </div>
      </div>

      <div className="visualizer-canvas">
        <div style={{ overflow: 'auto' }}>
          <svg width="100%" height={svgH} viewBox={`0 0 ${WIDTH} ${svgH}`} preserveAspectRatio="xMinYMin meet">
            {/* draw edges */}
            {nodes.map((n) => {
              const pos = layout[n.id];
              if (!pos) return null;
              return n.children.map((ch) => {
                const cpos = layout[ch.id];
                if (!cpos) return null;
                return (
                  <line
                    key={`edge-${n.id}-${ch.id}`}
                    x1={pos.x}
                    y1={pos.y + 10}
                    x2={cpos.x}
                    y2={cpos.y - 10}
                    stroke="#cbd5e1"
                    strokeWidth={1.4}
                  />
                );
              });
            })}

            {/* nodes */}
            {nodes.map(n => {
              const pos = layout[n.id];
              if (!pos) return null;
              const filled = isVisited(n.id);
              const current = isCurrent(n.id);
              const fill = current ? '#f59e0b' : (filled ? '#10b981' : '#e6eef6');
              const textColor = current || filled ? '#fff' : '#0f172a';
              return (
                <g key={`node-${n.id}`} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle 
                    cx={0} 
                    cy={0} 
                    r={NODE_R} 
                    fill={fill} 
                    stroke={current ? '#c2410c' : '#cbd5e1'} 
                    strokeWidth={current ? 2 : 1.2} 
                  />
                  <text 
                    x={0} 
                    y={4} 
                    textAnchor="middle" 
                    fontSize="12" 
                    fontWeight="700" 
                    fill={textColor}
                  >
                    {n.label}
                  </text>
                  <text 
                    x={0} 
                    y={NODE_R + 16} 
                    textAnchor="middle" 
                    fontSize="11" 
                    fill="#64748b"
                  >
                    {`id:${n.id}`}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="status-display">
        <div className="status-text">
          Step: {index} / {order.length} | Nodes: {nodes.length} | 
          Status: {index >= order.length ? 'Complete' : isPlaying ? 'Running' : 'Paused'}
        </div>
        <div className="text-xs mt-2 text-gray-600 dark:text-gray-400">
          <strong>Traversal Order:</strong> {order.slice(0, index).join(' → ')}
          {index < order.length && <span className="text-amber-600 dark:text-amber-400"> → {order[index]}</span>}
        </div>
      </div>

      <div className="visualizer-legend">
        <div className="legend-title">Legend</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color bg-gray-200"></div>
            <span>Unvisited</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bg-amber-500"></div>
            <span>Current Node</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bg-emerald-500"></div>
            <span>Visited</span>
          </div>
        </div>
      </div>
    </div>
  );
}
