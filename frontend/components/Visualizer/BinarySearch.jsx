// 'use client';
// import React, { useEffect, useRef, useState } from 'react';
// import * as d3 from 'd3';

// export default function BinarySearchVisualizer({ isPlaying, speed=2 }){
//   const svgRef = useRef();
//   const [array] = useState([1,3,5,7,9,11,13,15,17,19]);
//   const [target, setTarget] = useState(7);
//   const [l, setL] = useState(0); const [r, setR] = useState(array.length-1); const [mid, setMid] = useState(-1); const [found, setFound] = useState(false);

//   useEffect(()=>{ if (!isPlaying) return; let cancelled=false; const run=async ()=>{ let left=0,right=array.length-1; while(left<=right && !cancelled){ const m=Math.floor((left+right)/2); setL(left); setR(right); setMid(m); await new Promise(r=>setTimeout(r,700/speed)); if (array[m]===target){ setFound(true); break; } if (array[m]<target) left=m+1; else right=m-1; } }; run(); return ()=>cancelled=true; }, [isPlaying, speed, target]);

//   useEffect(()=>{ const svg=d3.select(svgRef.current); svg.selectAll('*').remove(); const width=700,height=160,margin={left:20,right:20,top:30,bottom:30}; const x=d3.scaleBand().domain(array.map((_,i)=>i)).range([margin.left,width-margin.right]).padding(0.12); svg.attr('viewBox', `0 0 ${width} ${height}`);

//     svg.selectAll('rect').data(array).enter().append('rect').attr('x',(_,i)=>x(i)).attr('y',50).attr('width',x.bandwidth()).attr('height',50).attr('rx',6).attr('fill',(_,i)=>{ if (found && i===mid) return '#10b981'; if (i===mid) return '#f59e0b'; if (i>=l && i<=r) return '#1f2937'; return '#e6e7ea'; }).attr('stroke','#0f172a').attr('stroke-width',1.5);
//     svg.selectAll('text.val').data(array).enter().append('text').attr('class','val').attr('x',(_,i)=>x(i)+x.bandwidth()/2).attr('y',80).attr('text-anchor','middle').attr('fill','#fff').attr('font-weight',600).text(d=>d);
//     svg.append('text').attr('x',width/2).attr('y',20).attr('text-anchor','middle').text(`Target: ${target} | L=${l} R=${r} Mid=${mid>=0?array[mid]:'N/A'}`);
//     if(found) svg.append('text').attr('x',width/2).attr('y',140).attr('text-anchor','middle').attr('fill','#10b981').attr('font-weight',700).text('Found');
//   }, [array, l, r, mid, found]);

//   return (
//     <div className="rounded-lg p-4 border bg-white dark:bg-gray-800">
//       <div className="flex gap-3 items-center mb-3"><label className="text-sm">Target:</label><input type="number" value={target} onChange={(e)=>setTarget(Number(e.target.value))} className="px-2 py-1 border rounded-md"/></div>
//       <svg ref={svgRef} width="100%" height={160} />
//     </div>
//   );
// }

'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function generateSortedArray(n = 10, min = 1, max = 50) {
  const arr = Array.from({ length: n }, (_, i) => min + i * Math.floor((max - min) / n));
  return arr.sort((a, b) => a - b);
}

export default function BinarySearchVisualizer({ 
  isPlaying = false, 
  speed = 2, 
  size = 10,
  onFinish = () => {} 
}) {
  const svgRef = useRef();
  const [array, setArray] = useState([]);
  const [target, setTarget] = useState(7);
  const [l, setL] = useState(0);
  const [r, setR] = useState(0);
  const [mid, setMid] = useState(-1);
  const [found, setFound] = useState(false);
  const [done, setDone] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    generateNewArray();
  }, [size]);

  const generateNewArray = () => {
    const newArray = generateSortedArray(size);
    setArray(newArray);
    setTarget(newArray[Math.floor(Math.random() * newArray.length)]);
    reset();
  };

  const reset = () => {
    setL(0);
    setR(array.length - 1);
    setMid(-1);
    setFound(false);
    setDone(false);
    setCurrentStep(0);
    setSearchHistory([]);
  };

  const stepForward = () => {
    if (done || !array.length) return;
    
    let left = l, right = r;
    if (currentStep === 0) {
      left = 0;
      right = array.length - 1;
      setL(left);
      setR(right);
    }
    
    if (left <= right) {
      const m = Math.floor((left + right) / 2);
      setMid(m);
      setSearchHistory(prev => [...prev, { left, right, mid: m, value: array[m] }]);
      
      if (array[m] === target) {
        setFound(true);
        setDone(true);
        onFinish();
      } else if (array[m] < target) {
        const newLeft = m + 1;
        setL(newLeft);
        setR(right);
      } else {
        const newRight = m - 1;
        setL(left);
        setR(newRight);
      }
      setCurrentStep(prev => prev + 1);
    } else {
      setDone(true);
      onFinish();
    }
  };

  const stepBackward = () => {
    if (currentStep === 0) return;
    
    const prevStep = currentStep - 1;
    if (prevStep === 0) {
      setL(0);
      setR(array.length - 1);
      setMid(-1);
      setFound(false);
      setDone(false);
      setSearchHistory([]);
      setCurrentStep(0);
    } else {
      const prevState = searchHistory[prevStep - 1];
      if (prevState) {
        setL(prevState.left);
        setR(prevState.right);
        setMid(prevState.mid);
        setSearchHistory(prev => prev.slice(0, prevStep));
        setCurrentStep(prevStep);
        setFound(false);
        setDone(false);
      }
    }
  };

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying || done || !array.length) return;
    
    let cancelled = false;
    const run = async () => {
      let left = 0, right = array.length - 1;
      setL(left);
      setR(right);
      setCurrentStep(0);
      setFound(false);
      setDone(false);
      setMid(-1);
      setSearchHistory([]);
      
      while (left <= right && !cancelled && !done) {
        const m = Math.floor((left + right) / 2);
        setMid(m);
        setSearchHistory(prev => [...prev, { left, right, mid: m, value: array[m] }]);
        setCurrentStep(prev => prev + 1);
        
        await new Promise(r => setTimeout(r, Math.max(300, 1200 / speed)));
        
        if (cancelled) break;
        
        if (array[m] === target) {
          setFound(true);
          setDone(true);
          onFinish();
          break;
        } else if (array[m] < target) {
          left = m + 1;
          setL(left);
        } else {
          right = m - 1;
          setR(right);
        }
      }
      
      if (!cancelled && !found) {
        setDone(true);
        onFinish();
      }
    };
    
    run();
    return () => { cancelled = true; };
  }, [isPlaying, speed, target, array]);

  // Visualization
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svg.node()) return;
    svg.selectAll('*').remove();

    if (!array.length) return;

    const width = 700, height = 200;
    const margin = { left: 30, right: 30, top: 40, bottom: 60 };
    const x = d3.scaleBand()
      .domain(array.map((_, i) => i))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Bars
    svg.selectAll('rect')
      .data(array)
      .join('rect')
      .attr('x', (_, i) => x(i))
      .attr('y', 60)
      .attr('width', x.bandwidth())
      .attr('height', 50)
      .attr('rx', 6)
      .attr('fill', (_, i) => {
        if (found && i === mid) return '#10b981';
        if (!found && done && i === mid) return '#ef4444';
        if (i === mid) return '#3b82f6';
        if (i >= l && i <= r) return '#6b7280';
        return '#d1d5db';
      })
      .attr('stroke', '#374151')
      .attr('stroke-width', 1);

    // Values
    svg.selectAll('text.val')
      .data(array)
      .join('text')
      .attr('class', 'val')
      .attr('x', (_, i) => x(i) + x.bandwidth() / 2)
      .attr('y', 90)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-weight', '600')
      .attr('font-size', '12')
      .text(d => d);

    // Info text
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14')
      .attr('font-weight', '600')
      .attr('fill', '#374151')
      .text(`Target: ${target} | Left: ${l} | Right: ${r} | Mid: ${mid >= 0 ? array[mid] : 'N/A'}`);

    // Result text
    if (found) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 150)
        .attr('text-anchor', 'middle')
        .attr('fill', '#10b981')
        .attr('font-weight', '700')
        .attr('font-size', '16')
        .text('✅ Element Found!');
    } else if (done) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 150)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ef4444')
        .attr('font-weight', '700')
        .attr('font-size', '16')
        .text('❌ Element Not Found');
    }
  }, [array, l, r, mid, found, done, target]);

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <h3 className="visualizer-title">Binary Search</h3>
        <div className="visualizer-controls">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Target:</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg w-20 bg-white dark:bg-gray-700"
            />
          </div>
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
            disabled={done}
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
        <svg ref={svgRef} width="100%" height={200} />
      </div>

      <div className="status-display">
        <div className="status-text">
          Step: {currentStep} | Array Size: {array.length} | Status: {found ? 'Found' : done ? 'Not Found' : 'Searching'}
        </div>
      </div>

      <div className="visualizer-legend">
        <div className="legend-title">Legend</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color bg-gray-300"></div>
            <span>Out of Range</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bg-gray-500"></div>
            <span>Search Range</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bg-blue-500"></div>
            <span>Current Mid</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bg-emerald-500"></div>
            <span>Found</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bg-red-500"></div>
            <span>Not Found</span>
          </div>
        </div>
      </div>
    </div>
  );
}
