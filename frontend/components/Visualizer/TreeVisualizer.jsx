'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function generateRandomTree() {
  const nodes = [
    { value: 1, children: [] },
    { value: 2, children: [] },
    { value: 3, children: [] },
    { value: 4, children: [] },
    { value: 5, children: [] },
    { value: 6, children: [] },
    { value: 7, children: [] }
  ];
  
  // Create a simple binary tree structure
  nodes[0].children = [nodes[1], nodes[2]]; // 1 -> 2, 3
  nodes[1].children = [nodes[3], nodes[4]]; // 2 -> 4, 5
  nodes[2].children = [nodes[5], nodes[6]]; // 3 -> 6, 7
  
  return nodes[0];
}

export default function TreeVisualizer({ 
  isPlaying = false, 
  speed = 2,
  onFinish = () => {} 
}) {
  const svgRef = useRef();
  const [visited, setVisited] = useState([]);
  const [current, setCurrent] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [tree, setTree] = useState(() => generateRandomTree());

  const positions = {
    1: { x: 220, y: 60 },
    2: { x: 120, y: 140 },
    3: { x: 320, y: 140 },
    4: { x: 70, y: 220 },
    5: { x: 170, y: 220 },
    6: { x: 270, y: 220 },
    7: { x: 370, y: 220 }
  };

  const edges = [[1,2], [1,3], [2,4], [2,5], [3,6], [3,7]];

  const reset = () => {
    setVisited([]);
    setCurrent(null);
    setQueue([tree]);
    setCurrentStep(0);
    setIsComplete(false);
  };

  const generateNewTree = () => {
    const newTree = generateRandomTree();
    setTree(newTree);
    setVisited([]);
    setCurrent(null);
    setQueue([newTree]);
    setCurrentStep(0);
    setIsComplete(false);
  };

  const stepForward = () => {
    if (isComplete || queue.length === 0) return;

    const node = queue.shift();
    setCurrent(node.value);
    setVisited(prev => [...prev, node.value]);
    
    // Add children to queue
    const newQueue = [...queue];
    for (const child of node.children) {
      newQueue.push(child);
    }
    setQueue(newQueue);
    setCurrentStep(prev => prev + 1);

    if (newQueue.length === 0) {
      setIsComplete(true);
      setCurrent(null);
      onFinish();
    }
  };

  const stepBackward = () => {
    if (currentStep === 0) return;
    
    // This is a simplified step back - in a full implementation,
    // you'd need to track the full state history
    const newVisited = visited.slice(0, -1);
    setVisited(newVisited);
    setCurrent(newVisited.length > 0 ? newVisited[newVisited.length - 1] : null);
    setCurrentStep(prev => prev - 1);
    setIsComplete(false);
  };

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying || isComplete) return;
    
    let cancelled = false;
    const run = async () => {
      // Reset and start BFS
      const q = [tree];
      const vis = [];
      setQueue(q);
      setVisited([]);
      setCurrent(null);
      setCurrentStep(0);
      
      while (q.length && !cancelled) {
        const node = q.shift();
        setCurrent(node.value);
        vis.push(node.value);
        setVisited([...vis]);
        setCurrentStep(prev => prev + 1);
        
        await new Promise(r => setTimeout(r, Math.max(300, 1000 / speed)));
        
        if (cancelled) break;
        
        for (const child of node.children) {
          q.push(child);
        }
        setQueue([...q]);
      }
      
      if (!cancelled) {
        setCurrent(null);
        setIsComplete(true);
        onFinish();
      }
    };
    
    run();
    return () => { cancelled = true; };
  }, [isPlaying, speed, tree, onFinish]);

  // Visualization
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svg.node()) return;
    svg.selectAll('*').remove();

    const width = 460, height = 320;
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Draw edges
    edges.forEach(([parent, child]) => {
      const parentPos = positions[parent];
      const childPos = positions[child];
      svg.append('line')
        .attr('x1', parentPos.x)
        .attr('y1', parentPos.y)
        .attr('x2', childPos.x)
        .attr('y2', childPos.y)
        .attr('stroke', '#cbd5e1')
        .attr('stroke-width', 2);
    });

    // Draw nodes
    Object.entries(positions).forEach(([val, pos]) => {
      const v = +val;
      const isVisited = visited.includes(v);
      const isCurrent = current === v;
      
      let fillColor = '#6b7280'; // default gray
      if (isCurrent) fillColor = '#3b82f6'; // blue for current
      else if (isVisited) fillColor = '#10b981'; // emerald for visited

      svg.append('circle')
        .attr('cx', pos.x)
        .attr('cy', pos.y)
        .attr('r', 24)
        .attr('fill', fillColor)
        .attr('stroke', '#374151')
        .attr('stroke-width', 2);

      svg.append('text')
        .attr('x', pos.x)
        .attr('y', pos.y + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-weight', '700')
        .attr('font-size', '14')
        .text(v);
    });

  }, [visited, current]);

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <h3 className="visualizer-title">Breadth-First Search (BFS)</h3>
        <div className="visualizer-controls">
          <button 
            onClick={stepBackward}
            className="control-button control-button-secondary"
            disabled={currentStep === 0}
          >
            ◀ Step Back
          </button>
          <button 
            onClick={stepForward}
            className="control-button control-button-secondary"
            disabled={isComplete}
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
            onClick={generateNewTree}
            className="control-button control-button-warning"
          >
            New Tree
          </button>
        </div>
      </div>

      <div className="visualizer-canvas">
        <svg ref={svgRef} width="100%" height={320} />
      </div>

      <div className="status-display">
        <div className="status-text">
          Step: {currentStep} | Visited: [{visited.join(', ')}] | 
          Queue: [{queue.map(n => n.value).join(', ')}] | 
          Status: {isComplete ? 'Complete' : isPlaying ? 'Running' : 'Paused'}
        </div>
      </div>

      <div className="visualizer-legend">
        <div className="legend-title">Legend</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color bg-gray-500"></div>
            <span>Unvisited</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bg-blue-500"></div>
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
