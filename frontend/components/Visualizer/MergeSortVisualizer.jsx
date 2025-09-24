// 'use client';
// import React, { useEffect, useMemo, useRef, useState } from 'react';

// /**
//  * MergeSortVisualizer.jsx
//  *
//  * - Fixed deterministic initial array (to avoid SSR/hydration mismatches).
//  * - Builds recursion tree and an ordered list of actions (visit / merge).
//  * - Shows original segment values immediately (array slices).
//  * - Plays through actions step-by-step. Merge actions replace a node's shown values.
//  * - Controls: Play/Pause, Step Back, Step Forward, Reset, New Array, Speed slider.
//  * - Keeps the same control layout/positions as requested.
//  */

// const DEFAULT_SIZE = 8;
// const CANVAS_WIDTH = 920;
// const ROW_HEIGHT = 110;
// const NODE_HEIGHT = 40;
// const MARGIN_X = 30;
// const MARGIN_Y = 20;
// const BAND = 36; // used for width heuristics

// // deterministic initial array (no randomness during SSR)
// const INITIAL_ARRAY = [64, 34, 25, 12, 22, 11, 90, 45];

// function randArray(n = DEFAULT_SIZE, max = 99) {
//   const a = new Array(n).fill(0).map(() => Math.floor(Math.random() * max) + 2);
//   return a;
// }

// /**
//  * Build recursion nodes and an ordered list of actions. Each node:
//  * { id, lo, hi, depth, parentId }
//  * Actions: { type: 'visit'|'merge', nodeId, node, merged? }
//  */
// function buildTreeAndActions(arr) {
//   let id = 0;
//   const nodes = [];
//   const actions = [];

//   function rec(lo, hi, depth, parentId = null) {
//     const nodeId = id++;
//     const node = { id: nodeId, lo, hi, depth, parentId };
//     nodes.push(node);

//     // record visiting the node
//     actions.push({ type: 'visit', nodeId, node });

//     if (lo < hi) {
//       const mid = Math.floor((lo + hi) / 2);
//       rec(lo, mid, depth + 1, nodeId);
//       rec(mid + 1, hi, depth + 1, nodeId);

//       // merged values (sorted merge of the original array slice)
//       const merged = [];
//       let i = lo, j = mid + 1;
//       while (i <= mid && j <= hi) {
//         if (arr[i] <= arr[j]) merged.push(arr[i++]);
//         else merged.push(arr[j++]);
//       }
//       while (i <= mid) merged.push(arr[i++]);
//       while (j <= hi) merged.push(arr[j++]);

//       actions.push({ type: 'merge', nodeId, node, merged, lo, hi });
//     } else {
//       // leaf node: merging yields the single element (makes animation consistent)
//       actions.push({ type: 'merge', nodeId, node, merged: [arr[lo]], lo, hi });
//     }
//     return node;
//   }

//   if (arr.length) rec(0, arr.length - 1, 0, null);
//   return { nodes, actions };
// }

// /**
//  * Layout: compute x,y for each node.
//  * We'll center x at the segment center (lo..hi) over the full canvas width.
//  */
// function layoutNodes(nodes, arrayLength, canvasWidth = CANVAS_WIDTH) {
//   // usable width for mapping indices
//   const usable = Math.max(canvasWidth - MARGIN_X * 2, arrayLength * BAND + 160);
//   const step = usable / Math.max(arrayLength - 1, 1);
//   const centerXForIndex = (i) => MARGIN_X + i * step + 40;

//   return nodes.map(n => {
//     const centerIdx = (n.lo + n.hi) / 2;
//     const x = centerXForIndex(centerIdx);
//     const width = Math.max((n.hi - n.lo + 1) * (BAND * 0.9), BAND * 2);
//     const y = MARGIN_Y + n.depth * ROW_HEIGHT;
//     return { ...n, x, y, width };
//   });
// }

// export default function MergeSortVisualizer({ isPlaying = false, speed = 1 }) {
//   // deterministic initial array to avoid hydration mismatch
//   const [array, setArray] = useState(() => [...INITIAL_ARRAY].slice(0, DEFAULT_SIZE));
//   const [playing, setPlaying] = useState(isPlaying);
//   const [playSpeed, setPlaySpeed] = useState(speed || 1);

//   // current action index and display state for merged values
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [displayValues, setDisplayValues] = useState({}); // nodeId -> merged array
//   const [highlightNode, setHighlightNode] = useState(null);

//   const timerRef = useRef(null);

//   // compute nodes & actions from array (memoized)
//   const { nodes, actions } = useMemo(() => buildTreeAndActions(array), [array]);
//   const nodesLayout = useMemo(() => layoutNodes(nodes, array.length, CANVAS_WIDTH), [nodes, array.length]);

//   // reset when array changes
//   useEffect(() => {
//     setCurrentIndex(0);
//     setDisplayValues({});
//     setHighlightNode(null);
//     setPlaying(false);
//     if (timerRef.current) {
//       clearTimeout(timerRef.current);
//       timerRef.current = null;
//     }
//   }, [array]);

//   // stop playing when we reach the end
//   useEffect(() => {
//     if (currentIndex >= actions.length) {
//       setPlaying(false);
//     }
//   }, [currentIndex, actions.length]);

//   // play effect: schedules next step when `playing` true
//   useEffect(() => {
//     if (!playing) {
//       if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
//       return;
//     }
//     if (!actions.length || currentIndex >= actions.length) {
//       setPlaying(false);
//       return;
//     }

//     const delay = Math.max(120, 700 / (playSpeed || 1));
//     timerRef.current = setTimeout(() => {
//       stepForward();
//     }, delay);

//     return () => {
//       if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [playing, currentIndex, playSpeed, actions.length]);

//   // step forward: apply the current action then advance index
//   const stepForward = () => {
//     if (currentIndex >= actions.length) return;
//     const act = actions[currentIndex];
//     if (!act) {
//       setCurrentIndex(i => i + 1);
//       return;
//     }

//     if (act.type === 'visit') {
//       setHighlightNode(act.nodeId);
//     } else if (act.type === 'merge') {
//       // apply merged values for that node
//       setDisplayValues(prev => ({ ...prev, [act.nodeId]: act.merged }));
//       setHighlightNode(act.nodeId);
//     }

//     setCurrentIndex(i => i + 1);
//   };

//   // step backward: undo one action (only need to revert merges)
//   const stepBack = () => {
//     if (currentIndex <= 0) return;
//     const prevIdx = currentIndex - 1;
//     const act = actions[prevIdx];
//     if (!act) {
//       setCurrentIndex(prevIdx);
//       return;
//     }
//     if (act.type === 'merge') {
//       // remove merged values for that node
//       setDisplayValues(prev => {
//         const copy = { ...prev };
//         delete copy[act.nodeId];
//         return copy;
//       });
//       setHighlightNode(act.nodeId);
//     } else if (act.type === 'visit') {
//       setHighlightNode(null);
//     }
//     setCurrentIndex(prevIdx);
//     setPlaying(false);
//   };

//   const resetPlay = () => {
//     setPlaying(false);
//     setCurrentIndex(0);
//     setDisplayValues({});
//     setHighlightNode(null);
//     if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
//   };

//   const newArray = () => {
//     resetPlay();
//     setArray(randArray(DEFAULT_SIZE, 90));
//   };

//   // value shown in a node: prefer displayValues (merged),
//   // otherwise show the slice of the original array (so you see original values from start)
//   const valuesForNode = (node) => {
//     if (!node) return [];
//     if (displayValues[node.id]) return displayValues[node.id];
//     return array.slice(node.lo, node.hi + 1);
//   };

//   const maxDepth = useMemo(() => {
//     let m = 0;
//     for (const n of nodes) if (n.depth > m) m = n.depth;
//     return m;
//   }, [nodes]);

//   const svgHeight = (maxDepth + 1) * ROW_HEIGHT + 80;

//   // rendering
//   return (
//     <div className="rounded-lg p-4 border bg-white dark:bg-gray-800">
//       {/* controls (kept in same places/layout) */}
//       <div className="flex items-center justify-between mb-4 gap-3">
//         <div className="flex items-center gap-2">
//           <button onClick={() => setPlaying(p => !p)} className={`px-3 py-1 rounded ${playing ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
//             {playing ? 'Pause' : 'Play'}
//           </button>
//           <button onClick={() => { stepBack(); }} className="px-3 py-1 border rounded">◀ Step</button>
//           <button onClick={() => { stepForward(); }} className="px-3 py-1 border rounded">Step ▶</button>
//           <button onClick={resetPlay} className="px-3 py-1 border rounded">Reset</button>
//           <button onClick={newArray} className="px-3 py-1 border rounded bg-amber-500 text-white">New Array</button>
//         </div>

//         <div className="flex items-center gap-3">
//           <label className="text-sm">Speed</label>
//           <input type="range" min="1" max="4" value={playSpeed} onChange={(e) => setPlaySpeed(Number(e.target.value))} />
//         </div>
//       </div>

//       {/* show root array explicitly (keeps the same UI cue you had earlier) */}
//       <div className="mb-4">
//         <div className="text-sm text-gray-500 mb-2">Array (root):</div>
//         <div className="flex gap-2 flex-wrap">
//           {array.map((v, i) => (
//             <div key={i} className="px-3 py-1 rounded border bg-gray-50 dark:bg-gray-700 text-sm font-medium">
//               {v}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* SVG recursion tree + node values */}
//       <div style={{ overflow: 'auto' }}>
//         <svg width="100%" height={svgHeight} viewBox={`0 0 ${CANVAS_WIDTH} ${svgHeight}`} preserveAspectRatio="xMidYMin meet">
//           {/* connector lines parent->child */}
//           {nodesLayout.map(n => {
//             const children = nodesLayout.filter(nd => nd.parentId === n.id);
//             return children.map(c => (
//               <line key={`link-${n.id}-${c.id}`}
//                 x1={n.x} y1={n.y + NODE_HEIGHT / 2}
//                 x2={c.x} y2={c.y - NODE_HEIGHT / 2}
//                 stroke="#e2e8f0" strokeWidth={1.2} />
//             ));
//           })}

//           {/* nodes */}
//           {nodesLayout.map(n => {
//             const vals = valuesForNode(n);
//             const segLen = n.hi - n.lo + 1;
//             const xLeft = n.x - n.width / 2;
//             const boxW = n.width;
//             const boxH = NODE_HEIGHT;
//             const isHighlighted = highlightNode === n.id;
//             const isMerged = !!displayValues[n.id];
//             // element cell width inside the node
//             const elementW = Math.max((boxW - 8) / segLen, 28);

//             return (
//               <g key={`node-${n.id}`} transform={`translate(${xLeft}, ${n.y})`}>
//                 <rect x={0} y={0} rx={8} width={boxW} height={boxH}
//                   fill={isMerged ? '#ecfdf5' : isHighlighted ? '#fffbeb' : '#f8fafc'}
//                   stroke={isHighlighted ? '#f59e0b' : '#e6eef6'} strokeWidth={isHighlighted ? 1.8 : 1} />

//                 <g transform={`translate(6, 4)`}>
//                   {new Array(segLen).fill(0).map((_, idx) => {
//                     const val = vals[idx];
//                     const rx = idx * elementW;
//                     const isNull = typeof val === 'undefined' || val === null;
//                     // coloring: merged -> greenish, highlighted -> amber, default -> dark background
//                     const fillColor = isNull ? '#e6eef6' : (isMerged ? '#10b981' : (isHighlighted ? '#f59e0b' : '#0f172a'));
//                     const textColor = isNull ? '#374151' : '#fff';
//                     return (
//                       <g key={`n${n.id}-v${idx}`} transform={`translate(${rx}, 0)` }>
//                         <rect x={0} y={0} rx={6} width={elementW - 6} height={boxH - 8} fill={fillColor} opacity={isNull ? 0.6 : 1} />
//                         <text x={(elementW - 6) / 2} y={(boxH - 8) / 2 + 5} textAnchor="middle" fill={textColor} fontSize="12" fontWeight="600">
//                           {isNull ? '-' : String(val)}
//                         </text>
//                       </g>
//                     );
//                   })}
//                 </g>

//                 <text x={boxW / 2} y={boxH + 14} textAnchor="middle" fontSize="11" fill="#6b7280">
//                   [{n.lo}..{n.hi}]
//                 </text>
//               </g>
//             );
//           })}
//         </svg>
//       </div>

//       <div className="mt-3 text-sm text-gray-500">
//         <div>Step: {currentIndex} / {actions.length}</div>
//         <div className="mt-1">
//           <strong>Legend:</strong>
//           <span className="ml-3 px-2 py-1 rounded bg-white border text-sm">- : placeholder</span>
//           <span className="ml-2 px-2 py-1 rounded bg-emerald-600 text-white border text-sm">merged</span>
//           <span className="ml-2 px-2 py-1 rounded bg-amber-500 text-white border text-sm">current</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// 'use client';
// import React, { useEffect, useMemo, useRef, useState } from 'react';

// const DEFAULT_SIZE = 8;
// const CANVAS_WIDTH = 920;
// const ROW_HEIGHT = 110;
// const NODE_HEIGHT = 40;
// const MARGIN_X = 30;
// const MARGIN_Y = 20;
// const BAND = 36;
// const INITIAL_ARRAY = [64, 34, 25, 12, 22, 11, 90, 45];

// function randArray(n = DEFAULT_SIZE, max = 99) {
//   return new Array(n).fill(0).map(() => Math.floor(Math.random() * max) + 2);
// }

// /* Build recursion nodes and a linear sequence of actions (visit/merge)
//    actions[]: { type: 'visit'|'merge', nodeId, node, merged?, lo?, hi? } */
// function buildTreeAndActions(arr) {
//   let id = 0;
//   const nodes = [];
//   const actions = [];

//   function rec(lo, hi, depth, parentId = null) {
//     const nodeId = id++;
//     const node = { id: nodeId, lo, hi, depth, parentId };
//     nodes.push(node);

//     actions.push({ type: 'visit', nodeId, node });

//     if (lo < hi) {
//       const mid = Math.floor((lo + hi) / 2);
//       rec(lo, mid, depth + 1, nodeId);
//       rec(mid + 1, hi, depth + 1, nodeId);

//       // compute merged result for visualization (we do NOT mutate original arr)
//       const merged = [];
//       let i = lo, j = mid + 1;
//       while (i <= mid && j <= hi) {
//         if (arr[i] <= arr[j]) merged.push(arr[i++]);
//         else merged.push(arr[j++]);
//       }
//       while (i <= mid) merged.push(arr[i++]);
//       while (j <= hi) merged.push(arr[j++]);

//       actions.push({ type: 'merge', nodeId, node, merged, lo, hi });
//     } else {
//       // leaf: merging single element
//       actions.push({ type: 'merge', nodeId, node, merged: [arr[lo]], lo, hi });
//     }
//     return node;
//   }

//   if (arr.length) rec(0, arr.length - 1, 0, null);
//   return { nodes, actions };
// }



// /* Layout nodes horizontally by center index, depth => y */
// function layoutNodes(nodes, arrayLength, canvasWidth = CANVAS_WIDTH) {
//   const usable = Math.max(canvasWidth - MARGIN_X * 2, arrayLength * BAND + 160);
//   const step = usable / Math.max(arrayLength - 1, 1);
//   const centerXForIndex = (i) => MARGIN_X + i * step + 40;

//   return nodes.map(n => {
//     const centerIdx = (n.lo + n.hi) / 2;
//     const x = centerXForIndex(centerIdx);
//     const width = Math.max((n.hi - n.lo + 1) * (BAND * 0.9), BAND * 2);
//     const y = MARGIN_Y + n.depth * ROW_HEIGHT;
//     return { ...n, x, y, width };
//   });
// }

// /* The component */
// export default function MergeSortVisualizer({ isPlaying = false, speed = 1, onFinish = () => {} }) {
//   // state
//   const [array, setArray] = useState(() => [...INITIAL_ARRAY].slice(0, DEFAULT_SIZE));
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [displayValues, setDisplayValues] = useState({}); // nodeId -> merged array (visible after merge action)
//   const [highlightNode, setHighlightNode] = useState(null);

//   // build nodes/actions derived from array
//   const { nodes, actions } = useMemo(() => buildTreeAndActions(array), [array]);
//   const nodesLayout = useMemo(() => layoutNodes(nodes, array.length, CANVAS_WIDTH), [nodes, array.length]);

//   // refs to avoid stale closures in autoplay loop
//   const currentIndexRef = useRef(currentIndex);
//   const isPlayingRef = useRef(isPlaying);
//   const actionsRef = useRef(actions);

//   useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
//   useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
//   useEffect(() => { actionsRef.current = actions; }, [actions]);

//   // basic controls
//   const resetPlay = () => {
//     setCurrentIndex(0);
//     setDisplayValues({});
//     setHighlightNode(null);
//   };

//   const newArray = () => {
//     resetPlay();
//     setArray(randArray(DEFAULT_SIZE, 90));
//   };

//   const stepForward = () => {
//     if (currentIndexRef.current >= actionsRef.current.length) return;
//     const act = actionsRef.current[currentIndexRef.current];
//     if (!act) return;

//     if (act.type === 'visit') {
//       setHighlightNode(act.nodeId);
//     } else if (act.type === 'merge') {
//       setDisplayValues(prev => ({ ...prev, [act.nodeId]: act.merged }));
//       setHighlightNode(act.nodeId);
//     }

//     setCurrentIndex(i => i + 1);
//   };

//   const stepBack = () => {
//     if (currentIndexRef.current <= 0) return;
//     const prevIdx = currentIndexRef.current - 1;
//     const act = actionsRef.current[prevIdx];

//     if (act?.type === 'merge') {
//       setDisplayValues(prev => {
//         const copy = { ...prev };
//         delete copy[act.nodeId];
//         return copy;
//       });
//       setHighlightNode(act.nodeId);
//     } else if (act?.type === 'visit') {
//       setHighlightNode(null);
//     }
//     setCurrentIndex(prevIdx);
//   };

//   // autoplay loop that respects parent's isPlaying + speed
//   useEffect(() => {
//     let timer = null;
//     let cancelled = false;

//     async function loopStep() {
//       if (cancelled) return;
//       // if finished, notify parent and stop
//       if (currentIndexRef.current >= actionsRef.current.length) {
//         onFinish();
//         return;
//       }
//       stepForward();
//       // compute delay using speed (speed=1 -> 900ms, speed=2 -> 450ms, clamp)
//       const base = 3000;
//       const delay = Math.max(600, Math.round(base / Math.max(0.25, speed)));
//       timer = setTimeout(() => {
//         if (isPlayingRef.current && !cancelled) loopStep();
//       }, delay);
//     }

//     if (isPlayingRef.current) {
//       // start loop
//       timer = setTimeout(loopStep, 50);
//     }

//     return () => { cancelled = true; if (timer) clearTimeout(timer); };
//   }, [isPlaying, speed, onFinish]); // we only trigger creation/teardown when these change

//   // helper to get values shown for a node (merged if available else slice of original array)
//   const valuesForNode = (node) => {
//     if (!node) return [];
//     if (displayValues[node.id]) return displayValues[node.id];
//     return array.slice(node.lo, node.hi + 1);
//   };

//   const maxDepth = useMemo(() => (nodes.length ? Math.max(...nodes.map(n => n.depth)) : 0), [nodes]);
//   const svgHeight = (maxDepth + 1) * ROW_HEIGHT + 80;

//   return (
//     <div className="rounded-lg p-4 border bg-white dark:bg-gray-800">
//       {/* controls */}
//       <div className="flex items-center justify-start mb-4 gap-2">
//         <button onClick={stepBack} className="px-3 py-1 border rounded">◀ Step</button>
//         <button onClick={stepForward} className="px-3 py-1 border rounded">Step ▶</button>
//         <button onClick={resetPlay} className="px-3 py-1 border rounded">Reset</button>
//         <button onClick={newArray} className="px-3 py-1 border rounded bg-amber-500 text-white">New Array</button>
//       </div>

//       {/* root array display */}
//       <div className="mb-4">
//         <div className="text-sm text-gray-500 mb-2">Array (root):</div>
//         <div className="flex gap-2 flex-wrap">
//           {array.map((v, i) => (
//             <div key={i} className="px-3 py-1 rounded border bg-gray-50 dark:bg-gray-700 text-sm font-medium">
//               {v}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* recursion tree & merges */}
//       <div style={{ overflow: 'auto' }}>
//         <svg width="100%" height={svgHeight} viewBox={`0 0 ${CANVAS_WIDTH} ${svgHeight}`} preserveAspectRatio="xMidYMin meet">
//           {/* draw connecting lines */}
//           {nodesLayout.map(n => {
//             const children = nodesLayout.filter(nd => nd.parentId === n.id);
//             return children.map(c => (
//               <line key={`link-${n.id}-${c.id}`} x1={n.x} y1={n.y + NODE_HEIGHT / 2} x2={c.x} y2={c.y - NODE_HEIGHT / 2} stroke="#e2e8f0" strokeWidth={1.2} />
//             ));
//           })}

//           {/* draw nodes */}
//           {nodesLayout.map(n => {
//             const vals = valuesForNode(n);
//             const segLen = n.hi - n.lo + 1;
//             const xLeft = n.x - n.width / 2;
//             const isHighlighted = highlightNode === n.id;
//             const isMerged = !!displayValues[n.id];
//             const elementW = Math.max((n.width - 8) / Math.max(segLen, 1), 28);

//             return (
//               <g key={`node-${n.id}`} transform={`translate(${xLeft}, ${n.y})`}>
//                 <rect x={0} y={0} rx={8} width={n.width} height={NODE_HEIGHT}
//                   fill={isMerged ? '#ecfdf5' : isHighlighted ? '#fffbeb' : '#f8fafc'}
//                   stroke={isHighlighted ? '#f59e0b' : '#e6eef6'} strokeWidth={isHighlighted ? 1.8 : 1} />

//                 <g transform={`translate(6, 4)`}>
//                   {new Array(segLen).fill(0).map((_, idx) => {
//                     const val = vals[idx];
//                     const rx = idx * elementW;
//                     const isNull = typeof val === 'undefined' || val === null;
//                     const fillColor = isNull ? '#e6eef6' : (isMerged ? '#10b981' : (isHighlighted ? '#f59e0b' : '#0f172a'));
//                     const textColor = isNull ? '#374151' : '#fff';
//                     return (
//                       <g key={`n${n.id}-v${idx}`} transform={`translate(${rx}, 0)`}>
//                         <rect width={elementW - 6} height={NODE_HEIGHT - 8} rx={6} fill={fillColor} opacity={isNull ? 0.6 : 1} />
//                         <text x={(elementW - 6) / 2} y={(NODE_HEIGHT - 8) / 2 + 5} textAnchor="middle" fill={textColor} fontSize="12" fontWeight="600">
//                           {isNull ? '-' : String(val)}
//                         </text>
//                       </g>
//                     );
//                   })}
//                 </g>

//                 <text x={n.width / 2} y={NODE_HEIGHT + 14} textAnchor="middle" fontSize="11" fill="#6b7280">
//                   [{n.lo}..{n.hi}]
//                 </text>
//               </g>
//             );
//           })}
//         </svg>
//       </div>

//       <div className="mt-3 text-sm text-gray-500">
//         <div>Step: {currentIndex} / {actions.length}</div>
//         <div className="mt-1">
//           <strong>Legend:</strong>
//           <span className="ml-3 px-2 py-1 rounded bg-white border text-sm">- : placeholder</span>
//           <span className="ml-2 px-2 py-1 rounded bg-emerald-600 text-white border text-sm">merged</span>
//           <span className="ml-2 px-2 py-1 rounded bg-amber-500 text-white border text-sm">current</span>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_SIZE = 8;
const CANVAS_WIDTH = 920;
const ROW_HEIGHT = 110;
const NODE_HEIGHT = 40;
const MARGIN_X = 30;
const MARGIN_Y = 20;
const BAND = 36;
const INITIAL_ARRAY = [64, 34, 25, 12, 22, 11, 90, 45];

function randArray(n = DEFAULT_SIZE, max = 99) {
  return new Array(n).fill(0).map(() => Math.floor(Math.random() * max) + 2);
}

/* Build recursion nodes and a linear sequence of actions (visit/merge) */
function buildTreeAndActions(arr) {
  let id = 0;
  const nodes = [];
  const actions = [];

  function rec(lo, hi, depth, parentId = null) {
    const nodeId = id++;
    const node = { id: nodeId, lo, hi, depth, parentId };
    nodes.push(node);

    // Visit node
    actions.push({ type: 'visit', nodeId, node });

    if (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      rec(lo, mid, depth + 1, nodeId);
      rec(mid + 1, hi, depth + 1, nodeId);

      // compute merged result for visualization (non-mutating)
      const merged = [];
      let i = lo, j = mid + 1;
      while (i <= mid && j <= hi) {
        if (arr[i] <= arr[j]) merged.push(arr[i++]);
        else merged.push(arr[j++]);
      }
      while (i <= mid) merged.push(arr[i++]);
      while (j <= hi) merged.push(arr[j++]);

      actions.push({ type: 'merge', nodeId, node, merged, lo, hi });
    } else {
      // leaf: merging single element
      actions.push({ type: 'merge', nodeId, node, merged: [arr[lo]], lo, hi });
    }
    return node;
  }

  if (arr.length) rec(0, arr.length - 1, 0, null);
  return { nodes, actions };
}

/* Layout nodes horizontally by center index, depth => y */
function layoutNodes(nodes, arrayLength, canvasWidth = CANVAS_WIDTH) {
  const usable = Math.max(canvasWidth - MARGIN_X * 2, arrayLength * BAND + 160);
  const step = usable / Math.max(arrayLength - 1, 1);
  const centerXForIndex = (i) => MARGIN_X + i * step + 40;

  return nodes.map(n => {
    const centerIdx = (n.lo + n.hi) / 2;
    const x = centerXForIndex(centerIdx);
    const width = Math.max((n.hi - n.lo + 1) * (BAND * 0.9), BAND * 2);
    const y = MARGIN_Y + n.depth * ROW_HEIGHT;
    return { ...n, x, y, width };
  });
}

export default function MergeSortVisualizer({ isPlaying = false, speed = 1, onFinish = () => {} }) {
  // state
  const [array, setArray] = useState(() => [...INITIAL_ARRAY].slice(0, DEFAULT_SIZE));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayValues, setDisplayValues] = useState({}); // nodeId -> merged array
  const [highlightNode, setHighlightNode] = useState(null);

  // derived
  const { nodes, actions } = useMemo(() => buildTreeAndActions(array), [array]);
  const nodesLayout = useMemo(() => layoutNodes(nodes, array.length, CANVAS_WIDTH), [nodes, array.length]);

  // refs to avoid stale closures in autoplay
  const actionsRef = useRef(actions);
  const currentIndexRef = useRef(currentIndex);
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);
  const finishedNotifiedRef = useRef(false);

  useEffect(() => { actionsRef.current = actions; finishedNotifiedRef.current = false; }, [actions]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // controls
  const resetPlay = () => {
    setCurrentIndex(0);
    setDisplayValues({});
    setHighlightNode(null);
    finishedNotifiedRef.current = false;
  };

  const newArray = () => {
    resetPlay();
    setArray(randArray(DEFAULT_SIZE, 90));
  };

  // step forward/back operate on the actionsRef to be robust
  const stepForward = () => {
    const idx = Math.min(currentIndexRef.current, actionsRef.current.length);
    if (idx >= actionsRef.current.length) return;
    const act = actionsRef.current[idx];
    if (!act) {
      setCurrentIndex(i => i + 1);
      return;
    }

    if (act.type === 'visit') {
      setHighlightNode(act.nodeId);
    } else if (act.type === 'merge') {
      setDisplayValues(prev => ({ ...prev, [act.nodeId]: act.merged }));
      setHighlightNode(act.nodeId);
    }
    setCurrentIndex(i => i + 1);
  };

  const stepBack = () => {
    const idx = Math.max(0, currentIndexRef.current - 1);
    if (idx < 0) return;
    const act = actionsRef.current[idx];
    if (act?.type === 'merge') {
      setDisplayValues(prev => {
        const copy = { ...prev };
        delete copy[act.nodeId];
        return copy;
      });
      setHighlightNode(act.nodeId);
    } else if (act?.type === 'visit') {
      setHighlightNode(null);
    }
    setCurrentIndex(idx);
  };

  // robust autoplay loop using setTimeout and refs
  useEffect(() => {
    let timer = null;
    let cancelled = false;

    // compute delay mapping (bigger BASE => slower)
    const BASE = 1800; // base delay for speed=1 (ms). Increase to slow down.
    const minDelay = 350;
    function computeDelay(s) {
      const sNum = Math.max(0.25, Number(s) || 1);
      return Math.max(minDelay, Math.round(BASE / sNum));
    }

    async function loopStep() {
      if (cancelled) return;
      // finished?
      if (currentIndexRef.current >= actionsRef.current.length) {
        if (!finishedNotifiedRef.current) {
          finishedNotifiedRef.current = true;
          try { onFinish(); } catch (e) { /* ignore */ }
        }
        return; // stop
      }

      // step once
      stepForward();

      // schedule next only if still playing and not finished
      if (!cancelled && isPlayingRef.current && currentIndexRef.current < actionsRef.current.length) {
        const delay = computeDelay(speedRef.current);
        timer = setTimeout(loopStep, delay);
      }
    }

    if (isPlayingRef.current) {
      // kick off
      timer = setTimeout(loopStep, 80);
      console.debug('[MergeSortVisualizer] autoplay started, speed=', speedRef.current);
    } else {
      // not playing: ensure we don't keep a stale timer
      if (timer) clearTimeout(timer);
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // Intentionally depend on isPlaying and speed so effect restarts when parent toggles them
  }, [isPlaying, speed, onFinish]);

  // helper: values displayed for node
  const valuesForNode = (node) => {
    if (!node) return [];
    if (displayValues[node.id]) return displayValues[node.id];
    return array.slice(node.lo, node.hi + 1);
  };

  const maxDepth = useMemo(() => (nodes.length ? Math.max(...nodes.map(n => n.depth)) : 0), [nodes]);
  const svgHeight = (maxDepth + 1) * ROW_HEIGHT + 80;

  // small UI guard: if actions array empty (shouldn't be), show message
  if (!actions || actions.length === 0) {
    return (
      <div className="rounded-lg p-4 border bg-white dark:bg-gray-800">
        <div>No data to visualize (array empty).</div>
        <div className="mt-2">
          <button onClick={newArray} className="px-3 py-1 rounded bg-amber-500 text-white">New Array</button>
        </div>
      </div>
    );
  }

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <h3 className="visualizer-title">Merge Sort</h3>
        <div className="visualizer-controls">
          <button 
            onClick={stepBack} 
            className="control-button control-button-secondary"
            disabled={currentIndex === 0}
          >
            ◀ Step Back
          </button>
          <button 
            onClick={stepForward} 
            className="control-button control-button-secondary"
            disabled={currentIndex >= actions.length}
          >
            Step Forward ▶
          </button>
          <button 
            onClick={resetPlay} 
            className="control-button control-button-secondary"
          >
            Reset
          </button>
          <button 
            onClick={newArray} 
            className="control-button control-button-warning"
          >
            New Array
          </button>
        </div>
      </div>

      {/* root array display */}
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Original Array:</div>
        <div className="flex gap-2 flex-wrap">
          {array.map((v, i) => (
            <div key={i} className="px-3 py-2 rounded-lg bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 text-sm font-semibold text-gray-800 dark:text-gray-200">
              {v}
            </div>
          ))}
        </div>
      </div>

      <div className="visualizer-canvas">
        <div style={{ overflow: 'auto' }}>
          <svg width="100%" height={svgHeight} viewBox={`0 0 ${CANVAS_WIDTH} ${svgHeight}`} preserveAspectRatio="xMidYMin meet">
            {/* draw connecting lines */}
            {nodesLayout.map(n => {
              const children = nodesLayout.filter(nd => nd.parentId === n.id);
              return children.map(c => (
                <line key={`link-${n.id}-${c.id}`} x1={n.x} y1={n.y + NODE_HEIGHT / 2} x2={c.x} y2={c.y - NODE_HEIGHT / 2} stroke="#cbd5e1" strokeWidth={1.5} />
              ));
            })}

            {/* draw nodes */}
            {nodesLayout.map(n => {
              const vals = valuesForNode(n);
              const segLen = n.hi - n.lo + 1;
              const xLeft = n.x - n.width / 2;
              const isHighlighted = highlightNode === n.id;
              const isMerged = !!displayValues[n.id];
              const elementW = Math.max((n.width - 8) / Math.max(segLen, 1), 28);

              return (
                <g key={`node-${n.id}`} transform={`translate(${xLeft}, ${n.y})`}>
                  <rect x={0} y={0} rx={8} width={n.width} height={NODE_HEIGHT}
                    fill={isMerged ? '#ecfdf5' : isHighlighted ? '#fef3c7' : '#f8fafc'}
                    stroke={isHighlighted ? '#f59e0b' : '#e2e8f0'} strokeWidth={isHighlighted ? 2 : 1} />

                  <g transform={`translate(6, 4)`}>
                    {new Array(segLen).fill(0).map((_, idx) => {
                      const val = vals[idx];
                      const rx = idx * elementW;
                      const isNull = typeof val === 'undefined' || val === null;
                      const fillColor = isNull ? '#e5e7eb' : (isMerged ? '#10b981' : (isHighlighted ? '#f59e0b' : '#6b7280'));
                      const textColor = isNull ? '#6b7280' : '#fff';
                      return (
                        <g key={`n${n.id}-v${idx}`} transform={`translate(${rx}, 0)`}>
                          <rect width={elementW - 6} height={NODE_HEIGHT - 8} rx={4} fill={fillColor} opacity={isNull ? 0.6 : 1} />
                          <text x={(elementW - 6) / 2} y={(NODE_HEIGHT - 8) / 2 + 5} textAnchor="middle" fill={textColor} fontSize="11" fontWeight="600">
                            {isNull ? '-' : String(val)}
                          </text>
                        </g>
                      );
                    })}
                  </g>

                  <text x={n.width / 2} y={NODE_HEIGHT + 16} textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="500">
                    [{n.lo}..{n.hi}]
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="status-display">
        <div className="status-text">
          Step: {currentIndex} / {actions.length} | Array Size: {array.length} | 
          Status: {currentIndex >= actions.length ? 'Complete' : isPlaying ? 'Running' : 'Paused'}
        </div>
      </div>

      <div className="visualizer-legend">
        <div className="legend-title">Legend</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color bg-gray-400"></div>
            <span>Original Values</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bg-amber-500"></div>
            <span>Current Node</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bg-emerald-500"></div>
            <span>Merged Values</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bg-gray-300"></div>
            <span>Placeholder</span>
          </div>
        </div>
      </div>
    </div>
  );
}
