// // 'use client';
// // import { useState } from 'react';
// // import SortingVisualizer from '../../components/Visualizer/SortingVisualizer';
// // import BinarySearchVisualizer from '../../components/Visualizer/BinarySearch';
// // import TreeVisualizer from '../../components/Visualizer/TreeVisualizer';

// // export default function VisualizerPage(){
// //   const [active, setActive] = useState('bubble');
// //   const [isPlaying, setIsPlaying] = useState(false);
// //   const [speed, setSpeed] = useState(2);

// //   return (
// //     <main className="container py-8">
// //       <div className="flex items-center justify-between mb-6">
// //         <h2 className="text-2xl font-bold">Visualizer</h2>
// //         <div className="flex gap-2">
// //           <select value={active} onChange={(e)=>setActive(e.target.value)} className="px-3 py-1 border rounded-md">
// //             <option value="bubble">Bubble Sort</option>
// //             <option value="binary">Binary Search</option>
// //             <option value="bfs">BFS Tree</option>
// //           </select>
// //           <button onClick={()=>setIsPlaying(!isPlaying)} className={`px-3 py-1 rounded-md ${isPlaying ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>{isPlaying ? 'Pause':'Play'}</button>
// //         </div>
// //       </div>

// //       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// //         <div className="lg:col-span-2">
// //           {active==='bubble' && <SortingVisualizer isPlaying={isPlaying} speed={speed} />}
// //           {active==='binary' && <BinarySearchVisualizer isPlaying={isPlaying} speed={speed} />}
// //           {active==='bfs' && <TreeVisualizer isPlaying={isPlaying} speed={speed} />}
// //         </div>
// //         <aside className="rounded-lg p-4 border bg-white dark:bg-gray-800">
// //           <h3 className="font-semibold">Algorithm Info</h3>
// //           <div className="mt-3 text-sm text-gray-700 dark:text-gray-200">Description, pseudo and complexity appear here.</div>
// //         </aside>
// //       </div>
// //     </main>
// //   );
// // }

'use client';
import React, { useEffect, useState } from 'react';
import BinarySearchVisualizer from '../../components/Visualizer/BinarySearch';
import LinearSearchVisualizer from '../../components/Visualizer/LinearSearch';
import TreeVisualizer from '../../components/Visualizer/TreeVisualizer';
import AlgorithmInfo from '../../components/Visualizer/AlgorithmInfo';
import SortingVisualizer from '../../components/Visualizer/SortingVisualizer';
import SelectionSortVisualizer from '../../components/Visualizer/SelectionSortVisualizer';
import MergeSortVisualizer from '../../components/Visualizer/MergeSortVisualizer';
import DFSVisualizer from '../../components/Visualizer/DFSVisualizer';


export default function VisualizerPage(){
  const [active, setActive] = useState('bubble');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [arraySize, setArraySize] = useState(12);

  const handleFinish = () => {
    setIsPlaying(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            Algorithm Visualizer
          </h2>
          <div className="flex gap-4 items-center flex-wrap">
            <select 
              value={active} 
              onChange={(e)=>setActive(e.target.value)} 
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="bubble">Bubble Sort</option>
              <option value="selection">Selection Sort</option>
              <option value="merge">Merge Sort</option>
              <option value="binary">Binary Search</option>
              <option value="linear">Linear Search</option>
              <option value="bfs">BFS Tree</option>
              <option value="dfs">DFS Tree</option>
            </select>

            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Speed</label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={speed} 
                onChange={e=>setSpeed(Number(e.target.value))} 
                className="w-20"
              />
              <span className="w-6 text-center text-sm font-medium">{speed}</span>
            </div>

            {(active === 'bubble' || active === 'selection' || active === 'binary' || active === 'linear') && (
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Size</label>
                <input 
                  type="range" 
                  min="6" 
                  max="20" 
                  value={arraySize} 
                  onChange={e=>setArraySize(Number(e.target.value))} 
                  className="w-20"
                />
                <span className="w-6 text-center text-sm font-medium">{arraySize}</span>
              </div>
            )}

            <button 
              onClick={()=>setIsPlaying(!isPlaying)} 
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
                isPlaying 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg'
              }`}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {active==='bubble' && (
              <SortingVisualizer 
                isPlaying={isPlaying} 
                speed={speed} 
                size={arraySize} 
                algorithm="bubble" 
                onFinish={handleFinish}
              />
            )}
            {active==='selection' && (
              <SelectionSortVisualizer 
                isPlaying={isPlaying} 
                speed={speed} 
                size={arraySize} 
                onFinish={handleFinish}
              />
            )}
            {active==='merge' && (
              <MergeSortVisualizer 
                isPlaying={isPlaying} 
                speed={speed} 
                size={arraySize} 
                onFinish={handleFinish}
              />
            )}
            {active==='binary' && (
              <BinarySearchVisualizer 
                isPlaying={isPlaying} 
                speed={speed} 
                size={arraySize} 
                onFinish={handleFinish}
              />
            )}
            {active==='linear' && (
              <LinearSearchVisualizer 
                isPlaying={isPlaying} 
                speed={speed} 
                size={arraySize} 
                onFinish={handleFinish}
              />
            )}
            {active==='bfs' && (
              <TreeVisualizer 
                isPlaying={isPlaying} 
                speed={speed} 
                onFinish={handleFinish}
              />
            )}
            {active==='dfs' && (
              <DFSVisualizer 
                isPlaying={isPlaying} 
                speed={speed} 
                onFinish={handleFinish}
              />
            )}
          </div>
          <aside className="visualizer-container">
            <AlgorithmInfo algorithm={active} />
          </aside>
        </div>
      </div>
    </main>
  );
}

