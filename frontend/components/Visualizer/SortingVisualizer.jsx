'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function SortingVisualizer({ isPlaying, speed=2 }){
  const svgRef = useRef();
  const [array, setArray] = useState([64,34,25,12,22,11,90]);
  const [comparing, setComparing] = useState([]);
  const [swapping, setSwapping] = useState([]);

  useEffect(()=>{
    const svg = d3.select(svgRef.current); svg.selectAll('*').remove();
    const width = 640, height = 260; const margin = {top:20,right:20,bottom:20,left:20};
    const x = d3.scaleBand().domain(array.map((_,i)=>i)).range([margin.left, width-margin.right]).padding(0.12);
    const y = d3.scaleLinear().domain([0, d3.max(array)||100]).range([height-margin.bottom, margin.top]);

    svg.selectAll('rect').data(array).enter().append('rect')
      .attr('x', (_,i)=>x(i)).attr('y', d=>y(d)).attr('width', x.bandwidth()).attr('height', d=>y(0)-y(d)).attr('rx',4).attr('fill','#111827');
    svg.selectAll('text').data(array).enter().append('text').attr('x', (_,i)=>x(i)+x.bandwidth()/2).attr('y', d=>y(d)-8).attr('text-anchor','middle').attr('fill','#fff').text(d=>d);
  }, [array, comparing, swapping]);

  useEffect(()=>{
    if (!isPlaying) return;
    let cancelled=false;
    const run = async ()=>{
      const arr=[...array];
      const n=arr.length;
      for(let i=0;i<n-1 && !cancelled;i++){
        for(let j=0;j<n-i-1 && !cancelled;j++){
          setComparing([j,j+1]);
          await new Promise(r=>setTimeout(r, 600/speed));
          if (arr[j]>arr[j+1]){
            setSwapping([j,j+1]); [arr[j],arr[j+1]]=[arr[j+1],arr[j]]; setArray([...arr]);
            await new Promise(r=>setTimeout(r, 600/speed));
          }
          setComparing([]); setSwapping([]);
        }
      }
    };
    run();
    return ()=> cancelled=true;
  }, [isPlaying, speed]);

  return (
    <div className="rounded-lg p-4 border bg-white dark:bg-gray-800">
      <svg ref={svgRef} width="100%" height={260} viewBox="0 0 640 260" />
    </div>
  );
}
