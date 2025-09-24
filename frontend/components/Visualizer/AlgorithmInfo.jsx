'use client';
import React from 'react';


const DICT = {
bubble: {
title: 'Bubble Sort',
desc: 'Repeatedly step through list, compare adjacent elements and swap if out of order. Simple but inefficient for large arrays.',
pseudocode: `for i = 0 to n-1\n for j = 0 to n-i-2\n if A[j] > A[j+1]\n swap(A[j], A[j+1])`
},
selection: {
title: 'Selection Sort',
desc: 'Select the minimum element from unsorted portion and swap it with the first unsorted. O(n^2) time.',
pseudocode: `for i = 0 to n-1\n min = i\n for j = i+1 to n-1\n if A[j] < A[min]\n min = j\n swap(A[i], A[min])`
},
merge: {
title: 'Merge Sort',
desc: 'Divide array in halves, sort each half and merge. Stable and O(n log n) time.',
pseudocode: `mergeSort(A):\n if len(A) <= 1 return A\n mid = len(A)//2\n left = mergeSort(A[:mid])\n right = mergeSort(A[mid:])\n return merge(left,right)`
},
binary: {
title: 'Binary Search',
desc: 'Search a sorted array by repeatedly dividing search interval in half. O(log n) time.',
pseudocode: `lo = 0; hi = n-1\nwhile lo <= hi:\n mid = (lo+hi)//2\n if A[mid] == target: return mid\n else if A[mid] < target: lo = mid+1\n else: hi = mid-1`
},
linear: {
title: 'Linear Search',
desc: 'Scan through array until you find the target. O(n) time, works on unsorted arrays.',
pseudocode: `for i=0 to n-1\n if A[i]==target return i\nreturn -1`
},
bfs: {
title: 'Breadth-First Search (BFS) / Tree Traversal',
desc: 'Traverse nodes of a tree/graph visiting children deeply before siblings. Useful to explore state-spaces.',
pseudocode: `dfs(node):\n visit(node)\n for child in node.children:\n dfs(child)`
},
dfs: {
title: 'Depth-First Search (DFS) / Tree Traversal',
desc: 'Traverse nodes of a tree/graph visiting children deeply before siblings. Useful to explore state-spaces.',
pseudocode: `dfs(node):\n visit(node)\n for child in node.children:\n dfs(child)`
}
};


export default function AlgorithmInfo({ algorithm='bubble' }){
const info = DICT[algorithm] || DICT.bubble;
return (
<div>
<h3 className="font-semibold text-lg mb-2">{info.title}</h3>
<div className="text-sm text-gray-700 dark:text-gray-200 mb-3">{info.desc}</div>
<div className="text-xs font-mono bg-gray-50 dark:bg-gray-700 p-3 rounded whitespace-pre-wrap">{info.pseudocode}</div>
</div>
);
}