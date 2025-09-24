'use client';
import React, { useMemo } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import ActivityHeatmap from './ActivityHeatmap';

// Helper functions
function topN(obj = {}, n = 8) {
  const arr = Object.entries(obj).map(([k, v]) => ({ k, v }));
  arr.sort((a, b) => b.v - a.v);
  return arr.slice(0, n);
}

function calculateStreak(timeSeries) {
  const dates = Object.keys(timeSeries).sort().reverse();
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  
  const today = new Date().toISOString().split('T')[0];
  let checkingCurrent = true;
  
  for (const date of dates) {
    if (timeSeries[date] > 0) {
      tempStreak++;
      if (checkingCurrent) {
        currentStreak = tempStreak;
      }
      maxStreak = Math.max(maxStreak, tempStreak);
    } else {
      if (checkingCurrent && date !== today) {
        checkingCurrent = false;
        currentStreak = 0;
      }
      tempStreak = 0;
    }
  }
  
  return { currentStreak, maxStreak };
}

function getActivityLevel(solvedCount, daysActive) {
  if (!solvedCount || !daysActive) return 'Beginner';
  const avgPerDay = solvedCount / daysActive;
  if (avgPerDay >= 3) return 'Expert';
  if (avgPerDay >= 1.5) return 'Advanced';
  if (avgPerDay >= 0.5) return 'Intermediate';
  return 'Beginner';
}

export default function AnalyticsPanel({ data, platform }) {
  const topics = data?.topics || {};
  const recent = data?.recentSolved || [];
  const timeSeries = data?.timeSeries || {};
  const solvedCount = data?.solvedCount ?? 0;
  const daysActive = data?.daysActive ?? 0;

  // Calculate insights
  const { currentStreak, maxStreak } = calculateStreak(timeSeries);
  const activityLevel = getActivityLevel(solvedCount, daysActive);
  const avgProblemsPerDay = daysActive > 0 ? (solvedCount / daysActive).toFixed(1) : 0;
  
  // Recent activity (last 30 days)
  const last30Days = Object.keys(timeSeries)
    .sort()
    .slice(-30)
    .reduce((sum, date) => sum + (timeSeries[date] || 0), 0);

  const topicEntries = topN(topics, 8);
  const topicLabels = topicEntries.map(e => e.k);
  const topicValues = topicEntries.map(e => e.v);

  const sortedDates = Object.keys(timeSeries).sort();
  const seriesValues = sortedDates.map(d => timeSeries[d]);

  // Memoized chart data
  const topicChartData = useMemo(() => ({
    labels: topicLabels,
    datasets: [{
      data: topicValues,
      backgroundColor: [
        '#10B981', '#06B6D4', '#8B5CF6', '#F59E0B',
        '#EF4444', '#6366F1', '#EC4899', '#84CC16'
      ]
    }]
  }), [topicLabels.join('|'), topicValues.join(',')]);

  const topicOptions = useMemo(() => ({
    maintainAspectRatio: false,
    plugins: { 
      legend: { position: 'right', labels: { boxWidth: 12, fontSize: 10 } }
    }
  }), []);

  const timelineData = useMemo(() => ({
    labels: sortedDates.slice(-60), // Last 60 days
    datasets: [{
      label: 'Problems Solved',
      data: seriesValues.slice(-60),
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }), [sortedDates.slice(-60).join('|'), seriesValues.slice(-60).join(',')]);

  const timelineOptions = useMemo(() => ({
    maintainAspectRatio: false,
    scales: {
      x: { 
        ticks: { autoSkip: true, maxTicksLimit: 8 },
        grid: { display: false }
      },
      y: { 
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    },
    plugins: {
      legend: { display: false }
    }
  }), []);

  return (
    <div className="mt-4 space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
          <div className="text-sm text-emerald-600 dark:text-emerald-300">Total Solved</div>
          <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-100">{solvedCount}</div>
          <div className="text-xs text-emerald-500 dark:text-emerald-400">Problems completed</div>
        </div>

        <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <div className="text-sm text-blue-600 dark:text-blue-300">Current Streak</div>
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-100">{currentStreak}</div>
          <div className="text-xs text-blue-500 dark:text-blue-400">Days in a row</div>
        </div>

        <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <div className="text-sm text-purple-600 dark:text-purple-300">Max Streak</div>
          <div className="text-2xl font-bold text-purple-800 dark:text-purple-100">{maxStreak}</div>
          <div className="text-xs text-purple-500 dark:text-purple-400">Best streak ever</div>
        </div>

        <div className="p-4 rounded-lg border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <div className="text-sm text-amber-600 dark:text-amber-300">Activity Level</div>
          <div className="text-lg font-bold text-amber-800 dark:text-amber-100">{activityLevel}</div>
          <div className="text-xs text-amber-500 dark:text-amber-400">{avgProblemsPerDay}/day avg</div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-white dark:bg-gray-800">
          <div className="text-sm text-gray-500">Last 30 Days</div>
          <div className="text-xl font-semibold">{last30Days}</div>
          <div className="text-xs text-gray-400">Problems solved recently</div>
        </div>

        <div className="p-4 rounded-lg border bg-white dark:bg-gray-800">
          <div className="text-sm text-gray-500">Active Days</div>
          <div className="text-xl font-semibold">{daysActive}</div>
          <div className="text-xs text-gray-400">Days with activity</div>
        </div>

        <div className="p-4 rounded-lg border bg-white dark:bg-gray-800">
          <div className="text-sm text-gray-500">Platform</div>
          <div className="text-xl font-semibold capitalize">{platform || 'Unknown'}</div>
          <div className="text-xs text-gray-400">Coding platform</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 rounded-lg border bg-white dark:bg-gray-800">
          <div className="font-medium mb-4 flex items-center gap-2">
            <span>📊</span>
            <span>Problem Categories</span>
          </div>
          {topicLabels.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-8">No topic data available</div>
          ) : (
            <div style={{ height: 250 }}>
              <Doughnut data={topicChartData} options={topicOptions} />
            </div>
          )}
        </div>

        <div className="p-4 rounded-lg border bg-white dark:bg-gray-800">
          <div className="font-medium mb-4 flex items-center gap-2">
            <span>📈</span>
            <span>Activity Timeline (Last 60 Days)</span>
          </div>
          {sortedDates.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-8">No timeline data available</div>
          ) : (
            <div style={{ height: 250 }}>
              <Line data={timelineData} options={timelineOptions} />
            </div>
          )}
        </div>
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap timeSeries={timeSeries} platform={platform} />

      {/* Recent Activity */}
      {recent.length > 0 && (
        <div className="p-4 rounded-lg border bg-white dark:bg-gray-800">
          <div className="font-medium mb-4 flex items-center gap-2">
            <span>🎯</span>
            <span>Recent Achievements</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recent.slice(0, 6).map((problem, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-300 text-sm">✓</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{problem.title || problem.slug || 'Problem'}</div>
                  <div className="text-xs text-gray-500">
                    {problem.ts ? new Date(problem.ts * 1000).toLocaleDateString() : 'Recently'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}