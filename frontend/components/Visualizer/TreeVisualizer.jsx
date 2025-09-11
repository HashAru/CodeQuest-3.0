'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function TreeVisualizer({ isPlaying, speed=2 }){
  const svgRef = useRef(); const [visited,setVisited]=useState([]); const [cur,setCur]=useState(null);
  const tree = { value: 1, children: [{value:2,children:[{value:4,children:[]},{value:5,children:[]}]},{value:3,children:[{value:6,children:[]},{value:7,children:[]}]}] };

  useEffect(()=>{ if(!isPlaying) return; let cancelled=false; const bfs=async(root)=>{ const q=[root]; const vis=[]; while(q.length && !cancelled){ const node=q.shift(); setCur(node.value); vis.push(node.value); setVisited([...vis]); await new Promise(r=>setTimeout(r,800/speed)); for(const c of node.children) q.push(c); } setCur(null); }; bfs(tree); return ()=> cancelled=true; }, [isPlaying, speed]);

  useEffect(()=>{ const svg=d3.select(svgRef.current); svg.selectAll('*').remove(); const positions={1:{x:220,y:40},2:{x:120,y:110},3:{x:320,y:110},4:{x:70,y:190},5:{x:170,y:190},6:{x:270,y:190},7:{x:370,y:190}}; const edges=[[1,2],[1,3],[2,4],[2,5],[3,6],[3,7]]; edges.forEach(([p,c])=> svg.append('line').attr('x1',positions[p].x).attr('y1',positions[p].y).attr('x2',positions[c].x).attr('y2',positions[c].y).attr('stroke','#94a3b8').attr('stroke-width',2)); Object.entries(positions).forEach(([val,pos])=>{ const v=+val; svg.append('circle').attr('cx',pos.x).attr('cy',pos.y).attr('r',22).attr('fill',()=>{ if(cur===v) return '#f59e0b'; if(visited.includes(v)) return '#10b981'; return '#111827'; }).attr('stroke','#fff').attr('stroke-width',2); svg.append('text').attr('x',pos.x).attr('y',pos.y+5).attr('text-anchor','middle').attr('fill','#fff').attr('font-weight',700).text(v); }); svg.append('text').attr('x',20).attr('y',260).attr('fill','#1f2937').text(`Visited: [${visited.join(', ')}]`); }, [visited, cur]);

  return (
    <div className="rounded-lg p-4 border bg-white dark:bg-gray-800"><svg ref={svgRef} width={460} height={280} /></div>
  );
}
