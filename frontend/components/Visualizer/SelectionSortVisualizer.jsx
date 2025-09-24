'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function makeRandomArray(n = 8, min = 5, max = 99) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

export default function SelectionSortVisualizer({ 
  isPlaying = false, 
  speed = 2, 
  size = 8,
  onFinish = () => {} 
}) {
  const svgRef = useRef();
  const [array, setArray] = useState([]);
  const [currentMin, setCurrentMin] = useState(-1);
  const [comparing, setComparing] = useState(-1);
  const [sorted, setSorted] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  useEffect(() => {
    generateNewArray();
  }, [size]);

  const generateNewArray = () => {
    const newArray = makeRandomArray(size);
    setArray(newArray);
    reset();
  };

  const reset = () => {
    setCurrentMin(-1);
    setComparing(-1);
    setSorted([]);
    setCurrentStep(0);
    setIsComplete(false);
  };

  const stepForward = () => {
    // Manual step forward - simplified for now
    console.log('Step forward clicked');
  };

  const stepBackward = () => {
    // Manual step backward - simplified for now
    console.log('Step backward clicked');
  };

  // Render visualization
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svg.node()) return;
    svg.selectAll('*').remove();

    if (!array || array.length === 0) return;

    const width = 700, height = 300;
    const margin = { top: 30, right: 30, bottom: 50, left: 30 };
    const x = d3.scaleBand()
      .domain(array.map((_, i) => i))
      .range([margin.left, width - margin.right])
      .padding(0.1);
    const y = d3.scaleLinear()
      .domain([0, d3.max(array) || 100])
      .range([height - margin.bottom, margin.top]);

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Bars
    svg.selectAll('rect')
      .data(array)
      .join('rect')
      .attr('x', (_, i) => x(i))
      .attr('y', d => y(d))
      .attr('width', x.bandwidth())
      .attr('height', d => y(0) - y(d))
      .attr('rx', 6)
      .attr('fill', (_, i) => {
        if (sorted.includes(i)) return '#10b981';        // emerald for sorted
        if (i === currentMin) return '#3b82f6';          // blue for current minimum
        if (i === comparing) return '#f59e0b';           // amber for comparing
        return '#6b7280';                                // gray for default
      })
      .attr('stroke', '#374151')
      .attr('stroke-width', 1);

    // Values
    svg.selectAll('text')
      .data(array)
      .join('text')
      .attr('x', (_, i) => x(i) + x.bandwidth() / 2)
      .attr('y', d => y(d) - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1f2937')
      .attr('font-weight', '600')
      .attr('font-size', '12')
      .text(d => d);

  }, [array, currentMin, comparing, sorted]);

  // Auto-play algorithm execution
  useEffect(() => {
    if (!isPlaying || isComplete) return;
    
    let cancelled = false;
    
    const runAnimation = async () => {
      const arr = [...array];
      const n = arr.length;
      
      for (let i = 0; i < n - 1 && !cancelled; i++) {
        let minIdx = i;
        setCurrentMin(minIdx);
        setComparing(-1);
        
        await new Promise(r => setTimeout(r, Math.max(300, 800 / speed)));
        
        for (let j = i + 1; j < n && !cancelled; j++) {
          if (cancelled) break;
          
          // Show comparison
          setComparing(j);
          await new Promise(r => setTimeout(r, Math.max(200, 600 / speed)));
          
          if (cancelled) break;
          
          if (arr[j] < arr[minIdx]) {
            minIdx = j;
            setCurrentMin(minIdx);
            await new Promise(r => setTimeout(r, Math.max(200, 600 / speed)));
          }
        }
        
        if (cancelled) break;
        
        // Clear comparison
        setComparing(-1);
        
        // Perform swap if needed
        if (minIdx !== i) {
          [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
          setArray([...arr]);
          await new Promise(r => setTimeout(r, Math.max(300, 800 / speed)));
        }
        
        // Mark as sorted and clear highlights
        setSorted(prev => [...prev, i]);
        setCurrentMin(-1);
        setComparing(-1);
        
        await new Promise(r => setTimeout(r, Math.max(200, 400 / speed)));
      }
      
      if (!cancelled) {
        // Mark all as sorted
        setSorted(Array.from({ length: n }, (_, i) => i));
        setCurrentMin(-1);
        setComparing(-1);
        setIsComplete(true);
        onFinish();
      }
    };
    
    runAnimation();
    
    return () => {
      cancelled = true;
    };
  }, [isPlaying, array, speed, onFinish]);

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <h3 className="visualizer-title">Selection Sort</h3>
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
            onClick={generateNewArray}
            className="control-button control-button-warning"
          >
            New Array
          </button>
        </div>
      </div>

      <div className="visualizer-canvas">
        <svg ref={svgRef} width="100%" height={300} />
      </div>

      <div className="status-display">
        <div className="status-text">
          Step: {currentStep} | Array Size: {array.length} | Status: {isComplete ? 'Complete' : isPlaying ? 'Running' : 'Paused'}
        </div>
      </div>

      <div className="visualizer-legend">
        <div className="legend-title">Legend</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color bg-gray-500"></div>
            <span>Unsorted</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bg-amber-500"></div>
            <span>Comparing</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bg-blue-500"></div>
            <span>Current Min</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bg-emerald-500"></div>
            <span>Sorted</span>
          </div>
        </div>
      </div>
    </div>
  );
}