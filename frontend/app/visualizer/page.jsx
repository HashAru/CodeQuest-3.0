'use client';
import { useState } from 'react';
import SortingVisualizer from '../../components/Visualizer/SortingVisualizer';
import BinarySearchVisualizer from '../../components/Visualizer/BinarySearch';
import TreeVisualizer from '../../components/Visualizer/TreeVisualizer';

export default function VisualizerPage(){
  const [active, setActive] = useState('bubble');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);

  return (
    <main className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Visualizer</h2>
        <div className="flex gap-2">
          <select value={active} onChange={(e)=>setActive(e.target.value)} className="px-3 py-1 border rounded-md">
            <option value="bubble">Bubble Sort</option>
            <option value="binary">Binary Search</option>
            <option value="bfs">BFS Tree</option>
          </select>
          <button onClick={()=>setIsPlaying(!isPlaying)} className={`px-3 py-1 rounded-md ${isPlaying ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>{isPlaying ? 'Pause':'Play'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {active==='bubble' && <SortingVisualizer isPlaying={isPlaying} speed={speed} />}
          {active==='binary' && <BinarySearchVisualizer isPlaying={isPlaying} speed={speed} />}
          {active==='bfs' && <TreeVisualizer isPlaying={isPlaying} speed={speed} />}
        </div>
        <aside className="rounded-lg p-4 border bg-white dark:bg-gray-800">
          <h3 className="font-semibold">Algorithm Info</h3>
          <div className="mt-3 text-sm text-gray-700 dark:text-gray-200">Description, pseudo and complexity appear here.</div>
        </aside>
      </div>
    </main>
  );
}
