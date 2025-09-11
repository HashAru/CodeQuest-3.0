// 'use client';
// import React, { useMemo } from 'react';
// import { Bar, Doughnut, Line } from 'react-chartjs-2';
// import Chart from 'chart.js/auto';

// // data mapping helpers
// function topN(obj = {}, n = 8) {
//   const arr = Object.entries(obj).map(([k,v]) => ({ k, v }));
//   arr.sort((a,b) => b.v - a.v);
//   return arr.slice(0, n);
// }

// export default function AnalyticsPanel({ data }) {
//   // data = profile.data returned by backend
//   const topics = data?.topics || {};
//   const recent = data?.recentSolved || [];
//   const timeSeries = data?.timeSeries || {};
//   const solvedCount = data?.solvedCount ?? 0;

//   // prepare topic chart (doughnut)
//   const topicEntries = topN(topics, 8);
//   const topicLabels = topicEntries.map(e => e.k);
//   const topicValues = topicEntries.map(e => e.v);

//   // prepare recent solves per day line chart
//   const sortedDates = Object.keys(timeSeries).sort();
//   const seriesValues = sortedDates.map(d => timeSeries[d]);

//   // bar chart for recent solved counts (if recent entries exist)
//   const recentTitles = recent.slice(0, 10).map(r => r.title || r.slug || 'prob');
//   const recentCounts = recent.slice(0, 10).map((_, i) => 1); // each entry is 1 solved

//   return (
//     <div className="mt-4 space-y-4">
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="p-4 rounded border bg-white dark:bg-gray-800">
//           <div className="text-sm text-gray-500">Solved</div>
//           <div className="text-2xl font-semibold">{solvedCount}</div>
//           <div className="text-xs text-gray-400 mt-1">Total accepted solutions</div>
//         </div>

//         <div className="p-4 rounded border bg-white dark:bg-gray-800">
//           <div className="text-sm text-gray-500">Active Days</div>
//           <div className="text-2xl font-semibold">{data?.daysActive ?? '—'}</div>
//           <div className="text-xs text-gray-400 mt-1">Days with activity (approx)</div>
//         </div>

//         <div className="p-4 rounded border bg-white dark:bg-gray-800">
//           <div className="text-sm text-gray-500">Last Fetched</div>
//           <div className="text-lg">{data?.fetchedAt ? new Date(data.fetchedAt).toLocaleString() : '—'}</div>
//           <div className="text-xs text-gray-400 mt-1">Click refresh to update</div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <div className="p-4 rounded border bg-white dark:bg-gray-800">
//           <div className="font-medium mb-2">Top Topics</div>
//           {topicLabels.length === 0 ? <div className="text-sm text-gray-500">No topic data</div> : (
//             <Doughnut
//               data={{
//                 labels: topicLabels,
//                 datasets: [{ data: topicValues, label: 'Topics' }]
//               }}
//               options={{ maintainAspectRatio: false }}
//               height={220}
//             />
//           )}
//         </div>

//         <div className="p-4 rounded border bg-white dark:bg-gray-800">
//           <div className="font-medium mb-2">Solved — recent timeline</div>
//           {sortedDates.length === 0 ? <div className="text-sm text-gray-500">No time-series data</div> : (
//             <Line
//               data={{
//                 labels: sortedDates,
//                 datasets: [{ label: 'Solved per day', data: seriesValues, fill: true }]
//               }}
//               options={{ maintainAspectRatio: false }}
//               height={220}
//             />
//           )}
//         </div>
//       </div>

//       <div className="p-4 rounded border bg-white dark:bg-gray-800">
//         <div className="font-medium mb-2">Recent Solved (latest)</div>
//         {recent.length === 0 ? <div className="text-sm text-gray-500">No recent solved info</div> : (
//           <div className="overflow-x-auto">
//             <Bar
//               data={{
//                 labels: recentTitles,
//                 datasets: [{ label: 'Recent solves', data: recentCounts }]
//               }}
//               options={{ indexAxis: 'y', maintainAspectRatio: false }}
//               height={recentTitles.length * 36}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

'use client';
import React, { useMemo } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

// data mapping helpers
function topN(obj = {}, n = 8) {
  const arr = Object.entries(obj).map(([k, v]) => ({ k, v }));
  arr.sort((a, b) => b.v - a.v);
  return arr.slice(0, n);
}

export default function AnalyticsPanel({ data }) {
  const topics = data?.topics || {};
  const recent = data?.recentSolved || [];
  const timeSeries = data?.timeSeries || {};
  const solvedCount = data?.solvedCount ?? 0;

  const topicEntries = topN(topics, 8);
  const topicLabels = topicEntries.map(e => e.k);
  const topicValues = topicEntries.map(e => e.v);

  const sortedDates = Object.keys(timeSeries).sort();
  const seriesValues = sortedDates.map(d => timeSeries[d]);

  const recentTitles = recent.slice(0, 10).map(r => r.title || r.slug || 'prob');
  const recentCounts = recent.slice(0, 10).map(() => 1);

  // memoize chart data + options so unrelated re-renders (like typing) don't re-create them
  const topicChartData = useMemo(() => ({
    labels: topicLabels,
    datasets: [{ data: topicValues, label: 'Topics' }]
  }), [topicLabels.join('|'), topicValues.join(',')]);

  const topicOptions = useMemo(() => ({
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } }
  }), []);

  const timelineData = useMemo(() => ({
    labels: sortedDates,
    datasets: [{ label: 'Solved per day', data: seriesValues, fill: true }]
  }), [sortedDates.join('|'), seriesValues.join(',')]);

  const timelineOptions = useMemo(() => ({
    maintainAspectRatio: false,
    scales: { x: { ticks: { autoSkip: true, maxTicksLimit: 10 } } }
  }), []);

  const recentData = useMemo(() => ({
    labels: recentTitles,
    datasets: [{ label: 'Recent solves', data: recentCounts }]
  }), [recentTitles.join('|')]);

  const recentOptions = useMemo(() => ({
    indexAxis: 'y',
    maintainAspectRatio: false,
    scales: { x: { beginAtZero: true } }
  }), []);

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded border bg-white dark:bg-gray-800">
          <div className="text-sm text-gray-500">Solved</div>
          <div className="text-2xl font-semibold">{solvedCount}</div>
          <div className="text-xs text-gray-400 mt-1">Total accepted solutions</div>
        </div>

        <div className="p-4 rounded border bg-white dark:bg-gray-800">
          <div className="text-sm text-gray-500">Active Days</div>
          <div className="text-2xl font-semibold">{data?.daysActive ?? '—'}</div>
          <div className="text-xs text-gray-400 mt-1">Days with activity (approx)</div>
        </div>

        <div className="p-4 rounded border bg-white dark:bg-gray-800">
          <div className="text-sm text-gray-500">Last Fetched</div>
          <div className="text-lg">{data?.fetchedAt ? new Date(data.fetchedAt).toLocaleString() : '—'}</div>
          <div className="text-xs text-gray-400 mt-1">Click refresh to update</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded border bg-white dark:bg-gray-800">
          <div className="font-medium mb-2">Top Topics</div>
          {topicLabels.length === 0 ? (
            <div className="text-sm text-gray-500">No topic data</div>
          ) : (
            // fixed height container prevents layout loops
            <div style={{ height: 220 }}>
              <Doughnut data={topicChartData} options={topicOptions} />
            </div>
          )}
        </div>

        <div className="p-4 rounded border bg-white dark:bg-gray-800">
          <div className="font-medium mb-2">Solved — recent timeline</div>
          {sortedDates.length === 0 ? (
            <div className="text-sm text-gray-500">No time-series data</div>
          ) : (
            <div style={{ height: 220 }}>
              <Line data={timelineData} options={timelineOptions} />
            </div>
          )}
        </div>
      </div>

      <div className="p-4 rounded border bg-white dark:bg-gray-800">
        <div className="font-medium mb-2">Recent Solved (latest)</div>
        {recent.length === 0 ? (
          <div className="text-sm text-gray-500">No recent solved info</div>
        ) : (
          // limit max height and allow scroll so chart stays bounded
          <div style={{ maxHeight: 360, overflow: 'auto' }}>
            <div style={{ height: Math.min(360, 40 * recentTitles.length) }}>
              <Bar data={recentData} options={recentOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
