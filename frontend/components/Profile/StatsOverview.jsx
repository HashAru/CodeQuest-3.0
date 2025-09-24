'use client';
import { useMemo } from 'react';

export default function StatsOverview({ profiles }) {
  const stats = useMemo(() => {
    if (!profiles || profiles.length === 0) {
      return {
        totalProblems: 0,
        totalDaysActive: 0,
        platforms: 0,
        averageRating: 0,
        totalStreak: 0,
        recentActivity: 0
      };
    }

    let totalProblems = 0;
    let totalDaysActive = 0;
    let totalRating = 0;
    let ratingCount = 0;
    let totalStreak = 0;
    let recentActivity = 0;
    const platformSet = new Set();

    profiles.forEach(profile => {
      const data = profile.data || {};
      
      totalProblems += data.solvedCount || 0;
      totalDaysActive += data.daysActive || 0;
      platformSet.add(profile.platform);
      
      if (data.rating) {
        totalRating += data.rating;
        ratingCount++;
      }
      
      // Calculate recent activity (last 30 days)
      if (data.timeSeries) {
        const last30Days = Object.keys(data.timeSeries)
          .sort()
          .slice(-30)
          .reduce((sum, date) => sum + (data.timeSeries[date] || 0), 0);
        recentActivity += last30Days;
      }
      
      // Calculate current streak
      if (data.timeSeries) {
        const dates = Object.keys(data.timeSeries).sort().reverse();
        let currentStreak = 0;
        for (const date of dates) {
          if (data.timeSeries[date] > 0) {
            currentStreak++;
          } else {
            break;
          }
        }
        totalStreak = Math.max(totalStreak, currentStreak);
      }
    });

    return {
      totalProblems,
      totalDaysActive,
      platforms: platformSet.size,
      averageRating: ratingCount > 0 ? Math.round(totalRating / ratingCount) : 0,
      totalStreak,
      recentActivity
    };
  }, [profiles]);

  const getActivityLevel = () => {
    if (stats.totalProblems >= 1000) return { level: 'Expert', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' };
    if (stats.totalProblems >= 500) return { level: 'Advanced', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' };
    if (stats.totalProblems >= 100) return { level: 'Intermediate', color: 'text-teal-600', bg: 'bg-teal-100 dark:bg-teal-900/30' };
    if (stats.totalProblems >= 10) return { level: 'Beginner', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    return { level: 'Newcomer', color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-700' };
  };

  const activityLevel = getActivityLevel();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Overall Statistics</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${activityLevel.bg} ${activityLevel.color}`}>
          {activityLevel.level}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg">
          <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-100">{stats.totalProblems}</div>
          <div className="text-sm text-emerald-600 dark:text-emerald-300">Total Problems</div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-100">{stats.platforms}</div>
          <div className="text-sm text-blue-600 dark:text-blue-300">Platforms</div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg">
          <div className="text-2xl font-bold text-purple-800 dark:text-purple-100">{stats.totalDaysActive}</div>
          <div className="text-sm text-purple-600 dark:text-purple-300">Active Days</div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg">
          <div className="text-2xl font-bold text-amber-800 dark:text-amber-100">{stats.totalStreak}</div>
          <div className="text-sm text-amber-600 dark:text-amber-300">Best Streak</div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-lg">
          <div className="text-2xl font-bold text-rose-800 dark:text-rose-100">{stats.recentActivity}</div>
          <div className="text-sm text-rose-600 dark:text-rose-300">Last 30 Days</div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-lg">
          <div className="text-2xl font-bold text-indigo-800 dark:text-indigo-100">
            {stats.averageRating || '—'}
          </div>
          <div className="text-sm text-indigo-600 dark:text-indigo-300">Avg Rating</div>
        </div>
      </div>

      {profiles && profiles.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-medium mb-3">Platform Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {profiles.map((profile, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                  <span className="text-sm font-medium capitalize">{profile.platform}</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {profile.data?.solvedCount || 0} problems
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}