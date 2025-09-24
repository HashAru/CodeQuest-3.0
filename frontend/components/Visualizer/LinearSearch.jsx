'use client';
import React, { useEffect, useState } from 'react';

function generateRandomArray(n = 10, min = 5, max = 99) {
  return Array.from({ length: n }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  );
}

export default function LinearSearchVisualizer({ 
  isPlaying = false, 
  speed = 2, 
  size = 10,
  onFinish = () => {} 
}) {
  const [array, setArray] = useState([]);
  const [target, setTarget] = useState('');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [foundIndex, setFoundIndex] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    generateNewArray();
  }, [size]);

  const generateNewArray = () => {
    const arr = generateRandomArray(size);
    setArray(arr);
    setTarget(arr[Math.floor(Math.random() * arr.length)].toString());
    reset();
  };

  const reset = () => {
    setCurrentIndex(-1);
    setFoundIndex(null);
    setSearchHistory([]);
    setCurrentStep(0);
    setIsComplete(false);
  };

  const stepForward = () => {
    if (isComplete || !array.length || target === '') return;
    
    const nextIndex = currentStep;
    if (nextIndex >= array.length) {
      setIsComplete(true);
      setCurrentIndex(-1);
      if (foundIndex === null) {
        onFinish();
      }
      return;
    }

    setCurrentIndex(nextIndex);
    setSearchHistory(prev => [...prev, { index: nextIndex, value: array[nextIndex] }]);
    
    if (array[nextIndex] === Number(target)) {
      setFoundIndex(nextIndex);
      setIsComplete(true);
      onFinish();
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const stepBackward = () => {
    if (currentStep === 0) return;
    
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    setSearchHistory(prev => prev.slice(0, prevStep));
    
    if (prevStep === 0) {
      setCurrentIndex(-1);
      setFoundIndex(null);
    } else {
      setCurrentIndex(prevStep - 1);
      // Check if we need to remove found status
      if (foundIndex !== null && prevStep <= foundIndex) {
        setFoundIndex(null);
      }
    }
    setIsComplete(false);
  };

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying || isComplete || !array.length || target === '') return;

    let cancelled = false;
    const run = async () => {
      while (!isComplete && !cancelled && isPlaying && currentStep < array.length) {
        await new Promise(r => setTimeout(r, Math.max(200, 1000 / speed)));
        if (!cancelled) stepForward();
      }
    };

    run();
    return () => { cancelled = true; };
  }, [isPlaying, speed, isComplete, array.length, target, currentStep]);

  const getElementStyle = (idx) => {
    if (idx === foundIndex) return 'bg-emerald-500 text-white border-emerald-600';
    if (idx === currentIndex) return 'bg-blue-500 text-white border-blue-600';
    if (searchHistory.some(h => h.index === idx)) return 'bg-gray-400 text-white border-gray-500';
    return 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600';
  };

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <h3 className="visualizer-title">Linear Search</h3>
        <div className="visualizer-controls">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Target:</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg w-20 bg-white dark:bg-gray-700"
              placeholder="Enter number"
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
            onClick={generateNewArray}
            className="control-button control-button-warning"
          >
            New Array
          </button>
        </div>
      </div>

      <div className="visualizer-canvas">
        <div className="flex gap-3 flex-wrap justify-center items-center min-h-[120px]">
          {array.map((val, idx) => (
            <div
              key={idx}
              className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 font-semibold text-sm transition-all duration-300 ${getElementStyle(idx)}`}
            >
              {val}
            </div>
          ))}
        </div>
      </div>

      <div className="status-display">
        <div className="status-text">
          Step: {currentStep} / {array.length} | Array Size: {array.length} | 
          Status: {foundIndex !== null ? `Found at index ${foundIndex}` : 
                   isComplete ? 'Not Found' : 
                   isPlaying ? 'Searching' : 'Paused'}
        </div>
      </div>

      <div className="visualizer-legend">
        <div className="legend-title">Legend</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color bg-gray-300"></div>
            <span>Unvisited</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bg-blue-500"></div>
            <span>Currently Checking</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bg-gray-400"></div>
            <span>Already Checked</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bg-emerald-500"></div>
            <span>Found Target</span>
          </div>
        </div>
      </div>
    </div>
  );
}
