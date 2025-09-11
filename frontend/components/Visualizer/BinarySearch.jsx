'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function BinarySearchVisualizer({ isPlaying, speed=2 }){
  const svgRef = useRef();
  const [array] = useState([1,3,5,7,9,11,13,15,17,19]);
  const [target, setTarget] = useState(7);
  const [l, setL] = useState(0); const [r, setR] = useState(array.length-1); const [mid, setMid] = useState(-1); const [found, setFound] = useState(false);

  useEffect(()=>{ if (!isPlaying) return; let cancelled=false; const run=async ()=>{ let left=0,right=array.length-1; while(left<=right && !cancelled){ const m=Math.floor((left+right)/2); setL(left); setR(right); setMid(m); await new Promise(r=>setTimeout(r,700/speed)); if (array[m]===target){ setFound(true); break; } if (array[m]<target) left=m+1; else right=m-1; } }; run(); return ()=>cancelled=true; }, [isPlaying, speed, target]);

  useEffect(()=>{ const svg=d3.select(svgRef.current); svg.selectAll('*').remove(); const width=700,height=160,margin={left:20,right:20,top:30,bottom:30}; const x=d3.scaleBand().domain(array.map((_,i)=>i)).range([margin.left,width-margin.right]).padding(0.12); svg.attr('viewBox', `0 0 ${width} ${height}`);

    svg.selectAll('rect').data(array).enter().append('rect').attr('x',(_,i)=>x(i)).attr('y',50).attr('width',x.bandwidth()).attr('height',50).attr('rx',6).attr('fill',(_,i)=>{ if (found && i===mid) return '#10b981'; if (i===mid) return '#f59e0b'; if (i>=l && i<=r) return '#1f2937'; return '#e6e7ea'; }).attr('stroke','#0f172a').attr('stroke-width',1.5);
    svg.selectAll('text.val').data(array).enter().append('text').attr('class','val').attr('x',(_,i)=>x(i)+x.bandwidth()/2).attr('y',80).attr('text-anchor','middle').attr('fill','#fff').attr('font-weight',600).text(d=>d);
    svg.append('text').attr('x',width/2).attr('y',20).attr('text-anchor','middle').text(`Target: ${target} | L=${l} R=${r} Mid=${mid>=0?array[mid]:'N/A'}`);
    if(found) svg.append('text').attr('x',width/2).attr('y',140).attr('text-anchor','middle').attr('fill','#10b981').attr('font-weight',700).text('Found');
  }, [array, l, r, mid, found]);

  return (
    <div className="rounded-lg p-4 border bg-white dark:bg-gray-800">
      <div className="flex gap-3 items-center mb-3"><label className="text-sm">Target:</label><input type="number" value={target} onChange={(e)=>setTarget(Number(e.target.value))} className="px-2 py-1 border rounded-md"/></div>
      <svg ref={svgRef} width="100%" height={160} />
    </div>
  );
}
