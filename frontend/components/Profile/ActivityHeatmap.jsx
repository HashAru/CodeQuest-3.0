'use client';
import { useMemo } from 'react';

export default function ActivityHeatmap({ timeSeries, platform }) {
  // Define helper function first
  const getActivityLevel = (count) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  };

  const heatmapData = useMemo(() => {
    if (!timeSeries || Object.keys(timeSeries).length === 0) return [];

    // Get last 365 days
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const data = [];
    const currentDate = new Date(oneYearAgo);

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const count = timeSeries[dateStr] || 0;
      
      data.push({
        date: dateStr,
        count,
        level: getActivityLevel(count)
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  }, [timeSeries]);

  const getColorClass = (level) => {
    const colors = {
      0: 'bg-gray-100 dark:bg-gray-800',
      1: 'bg-green-200 dark:bg-green-900',
      2: 'bg-green-300 dark:bg-green-700',
      3: 'bg-green-400 dark:bg-green-600',
      4: 'bg-green-500 dark:bg-green-500'
    };
    return colors[level] || colors[0];
  };

  const weeks = useMemo(() => {
    const weekData = [];
    for (let i = 0; i < heatmapData.length; i += 7) {
      weekData.push(heatmapData.slice(i, i + 7));
    }
    return weekData;
  }, [heatmapData]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const totalContributions = heatmapData.reduce((sum, day) => sum + day.count, 0);
  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = heatmapData.length - 1; i >= 0; i--) {
      if (heatmapData[i].count > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [heatmapData]);

  return (
    <div className="p-4 rounded-lg border bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium flex items-center gap-2">
          <span>🔥</span>
          <span>Activity Heatmap</span>
        </h4>
        <div className="text-sm text-gray-500">
          {totalContributions} problems in the last year
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="text-lg font-bold text-green-600">{currentStreak}</div>
          <div className="text-xs text-gray-500">Current Streak</div>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="text-lg font-bold text-blue-600">{totalContributions}</div>
          <div className="text-xs text-gray-500">Total Problems</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-2">
            <div className="w-8"></div>
            {months.map((month, idx) => (
              <div key={idx} className="text-xs text-gray-500 w-12 text-center">
                {month}
              </div>
            ))}
          </div>

          {/* Days and heatmap */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col mr-2">
              {days.map((day, idx) => (
                <div key={idx} className="text-xs text-gray-500 h-3 flex items-center mb-1">
                  {idx % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      className={`w-3 h-3 rounded-sm ${getColorClass(day.level)} cursor-pointer hover:ring-2 hover:ring-gray-400`}
                      title={`${day.date}: ${day.count} problems solved`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getColorClass(level)}`}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}