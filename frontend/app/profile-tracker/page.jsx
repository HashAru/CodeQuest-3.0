'use client';
import { useEffect, useState } from 'react';
import { API_BASE } from '../../lib/api';
import { useAuth } from '../../lib/authContext';
import AnalyticsPanel from '../../components/Profile/AnalyticsPanel';
import StatsOverview from '../../components/Profile/StatsOverview';

function ProfileCard({ p, onRefresh, onDelete }) {
  const d = p.data || {};
  return (
    <div className="p-6 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
              {(d.displayName || p.handle).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-lg">{d.displayName || p.handle}</div>
              <div className="text-sm text-gray-500 capitalize">{p.platform} • {p.handle}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded">
              <div className="text-lg font-bold text-emerald-800 dark:text-emerald-100">{d.solvedCount ?? '—'}</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-300">Solved</div>
            </div>
            <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div className="text-lg font-bold text-blue-800 dark:text-blue-100">{d.daysActive ?? '—'}</div>
              <div className="text-xs text-blue-600 dark:text-blue-300">Active Days</div>
            </div>
            {p.platform === 'codeforces' && (
              <>
                <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <div className="text-lg font-bold text-purple-800 dark:text-purple-100">{d.rating ?? '—'}</div>
                  <div className="text-xs text-purple-600 dark:text-purple-300">Rating</div>
                </div>
                <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                  <div className="text-lg font-bold text-amber-800 dark:text-amber-100">{d.maxRating ?? '—'}</div>
                  <div className="text-xs text-amber-600 dark:text-amber-300">Max Rating</div>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="text-right space-y-2 ml-4">
          <div className="text-xs text-gray-400">Last updated</div>
          <div className="text-sm">{p.lastFetchedAt ? new Date(p.lastFetchedAt).toLocaleString() : 'Never'}</div>
          <div className="flex flex-col gap-2 mt-3">
            <button 
              onClick={() => onRefresh(p._id)} 
              className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-sm transition-colors"
            >
              Refresh
            </button>
            <button 
              onClick={() => onDelete(p._id)} 
              className="px-3 py-1 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Analytics */}
      <AnalyticsPanel data={d} platform={p.platform} />
    </div>
  );
}

export default function ProfileTrackerPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('cq_token') : null;

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/profiles`, { 
        headers: token ? { Authorization: `Bearer ${token}` } : {} 
      });
      const data = await res.json();
      setProfiles(data);
    } catch (err) { 
      console.error(err); 
      alert('Failed to load profiles'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    if (user) fetchProfiles(); 
  }, [user]);

  const addProfile = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/profiles`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ urlOrHandle: input.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || JSON.stringify(data));
      setProfiles(prev => [data, ...prev]);
      setInput('');
    } catch (err) {
      alert('Failed to add: ' + err.message);
    }
  };

  const refreshProfile = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/profiles/${id}/refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || JSON.stringify(data));
      setProfiles(prev => prev.map(p => p._id === id ? data : p));
    } catch (err) {
      alert('Refresh failed: ' + err.message);
    }
  };

  const deleteProfile = async (id) => {
    if (!confirm('Delete this profile?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/profiles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || JSON.stringify(data));
      setProfiles(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  if (!user) {
    return (
      <div className="container py-8">
        <div className="max-w-md mx-auto p-6 rounded-lg border bg-white dark:bg-gray-800 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
          <p className="text-gray-600 dark:text-gray-400">Please log in to track your coding profiles.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Profile Tracker</h2>
        <div className="text-sm text-gray-500">
          Track your coding progress across multiple platforms
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Add Profile Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 mb-6">
          <h3 className="font-semibold mb-4">Add New Profile</h3>
          <form onSubmit={addProfile} className="flex gap-3">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Paste Codeforces/LeetCode/HackerRank/GeeksforGeeks profile link or username" 
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" 
            />
            <button className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
              Add Profile
            </button>
          </form>
          <div className="mt-2 text-xs text-gray-500">
            Supported platforms: Codeforces, LeetCode, HackerRank, GeeksforGeeks
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profiles...</p>
          </div>
        ) : (
          <>
            {/* Overall Stats */}
            {profiles.length > 0 && <StatsOverview profiles={profiles} />}
            
            {/* Individual Profiles */}
            <div className="space-y-6">
              {profiles.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="text-gray-400 text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                    No profiles tracked yet
                  </h3>
                  <p className="text-sm text-gray-500">
                    Add your first coding profile to start tracking your progress and get insights
                  </p>
                </div>
              ) : (
                profiles.map(p => (
                  <ProfileCard key={p._id} p={p} onRefresh={refreshProfile} onDelete={deleteProfile} />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}