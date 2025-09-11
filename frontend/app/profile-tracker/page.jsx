// 'use client';
// import { useEffect, useState } from 'react';
// import { API_BASE } from '../../lib/api';
// import { useAuth } from '../../lib/authContext';

// function ProfileCard({ p, onRefresh, onDelete }) {
//   const d = p.data || {};
//   return (
//     <div className="p-4 border rounded bg-white dark:bg-gray-800">
//       <div className="flex justify-between items-start">
//         <div>
//           <div className="font-semibold text-lg">{d.displayName || p.handle}</div>
//           <div className="text-xs text-gray-500">{p.platform.toUpperCase()} • {p.handle}</div>
//           <div className="text-sm mt-2">Solved: <strong>{d.solvedCount ?? '—'}</strong></div>
//           <div className="text-sm">Days Active: <strong>{d.daysActive ?? '—'}</strong></div>
//           {p.platform === 'codeforces' && (
//             <div className="text-sm">Rating: <strong>{d.rating ?? '—'}</strong> (max {d.maxRating ?? '—'})</div>
//           )}
//         </div>
//         <div className="text-right space-y-2">
//           <div className="text-xs text-gray-400">Last fetched</div>
//           <div className="text-sm">{p.lastFetchedAt ? new Date(p.lastFetchedAt).toLocaleString() : 'never'}</div>
//           <div className="flex flex-col gap-2 mt-3">
//             <button onClick={()=>onRefresh(p._id)} className="px-3 py-1 rounded bg-amber-500 text-white text-sm">Refresh</button>
//             <button onClick={()=>onDelete(p._id)} className="px-3 py-1 rounded border text-sm">Delete</button>
//           </div>
//         </div>
//       </div>

//       {/* Topics */}
//       <div className="mt-4">
//         <div className="text-sm font-medium mb-2">Top Topics</div>
//         <div className="flex flex-wrap gap-2">
//           {d.topics && Object.entries(d.topics).slice(0, 10).map(([k,v]) => (
//             <div key={k} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">{k} ({v})</div>
//           ))}
//           {!d.topics && <div className="text-sm text-gray-500">No topic data</div>}
//         </div>
//       </div>

//       {/* Recent */}
//       {d.recentSolved && d.recentSolved.length > 0 && (
//         <div className="mt-4">
//           <div className="text-sm font-medium mb-2">Recent Solved</div>
//           <ul className="list-disc list-inside text-sm">
//             {d.recentSolved.slice(0,5).map((r, i) => (
//               <li key={i}>{r.title || r.slug} <span className="text-xs text-gray-400">({new Date(r.ts * 1000).toLocaleString()})</span></li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }

// export default function ProfileTrackerPage() {
//   const { user } = useAuth();
//   const [profiles, setProfiles] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [input, setInput] = useState('');
//   const token = typeof window !== 'undefined' ? localStorage.getItem('cq_token') : null;

//   const fetchProfiles = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/api/profiles`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
//       const data = await res.json();
//       setProfiles(data);
//     } catch (err) { console.error(err); alert('Failed to load profiles'); }
//     finally { setLoading(false); }
//   };

//   useEffect(()=>{ if (user) fetchProfiles(); }, [user]);

//   const addProfile = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;
//     try {
//       const res = await fetch(`${API_BASE}/api/profiles`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ urlOrHandle: input.trim() })
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || JSON.stringify(data));
//       setProfiles(prev => [data, ...prev]);
//       setInput('');
//     } catch (err) {
//       alert('Failed to add: ' + err.message);
//     }
//   };

//   const refreshProfile = async (id) => {
//     try {
//       const res = await fetch(`${API_BASE}/api/profiles/${id}/refresh`, {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || JSON.stringify(data));
//       setProfiles(prev => prev.map(p => p._id === id ? data : p));
//     } catch (err) {
//       alert('Refresh failed: ' + err.message);
//     }
//   };

//   const deleteProfile = async (id) => {
//     if (!confirm('Delete this profile?')) return;
//     try {
//       const res = await fetch(`${API_BASE}/api/profiles/${id}`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || JSON.stringify(data));
//       setProfiles(prev => prev.filter(p => p._id !== id));
//     } catch (err) {
//       alert('Delete failed: ' + err.message);
//     }
//   };

//   if (!user) {
//     return <div className="container py-8"><div className="max-w-md mx-auto p-6 rounded border bg-white dark:bg-gray-800">Please log in to track profiles.</div></div>;
//   }

//   return (
//     <main className="container py-8">
//       <h2 className="text-2xl font-bold mb-4">Profile Tracker</h2>

//       <div className="max-w-2xl">
//         <form onSubmit={addProfile} className="flex gap-2 mb-4">
//           <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Paste Codeforces or LeetCode profile link or username" className="flex-1 px-3 py-2 border rounded" />
//           <button className="px-4 py-2 bg-amber-600 text-white rounded">Add</button>
//         </form>

//         {loading ? <div>Loading...</div> : (
//           <div className="space-y-4">
//             {profiles.length === 0 && <div className="text-sm text-gray-500">No tracked profiles yet.</div>}
//             {profiles.map(p => (
//               <ProfileCard key={p._id} p={p} onRefresh={refreshProfile} onDelete={deleteProfile} />
//             ))}
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }

'use client';
import { useEffect, useState } from 'react';
import { API_BASE } from '../../lib/api';
import { useAuth } from '../../lib/authContext';
import AnalyticsPanel from '../../components/Profile/AnalyticsPanel';

function ProfileCard({ p, onRefresh, onDelete }) {
  const d = p.data || {};
  return (
    <div className="p-4 border rounded bg-white dark:bg-gray-800">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold text-lg">{d.displayName || p.handle}</div>
          <div className="text-xs text-gray-500">{p.platform.toUpperCase()} • {p.handle}</div>
          <div className="text-sm mt-2">Solved: <strong>{d.solvedCount ?? '—'}</strong></div>
          <div className="text-sm">Days Active: <strong>{d.daysActive ?? '—'}</strong></div>
          {p.platform === 'codeforces' && (
            <div className="text-sm">Rating: <strong>{d.rating ?? '—'}</strong> (max {d.maxRating ?? '—'})</div>
          )}
        </div>
        <div className="text-right space-y-2">
          <div className="text-xs text-gray-400">Last fetched</div>
          <div className="text-sm">{p.lastFetchedAt ? new Date(p.lastFetchedAt).toLocaleString() : 'never'}</div>
          <div className="flex flex-col gap-2 mt-3">
            <button onClick={()=>onRefresh(p._id)} className="px-3 py-1 rounded bg-amber-500 text-white text-sm">Refresh</button>
            <button onClick={()=>onDelete(p._id)} className="px-3 py-1 rounded border text-sm">Delete</button>
          </div>
        </div>
      </div>

      {/* Analytics */}
      <AnalyticsPanel data={d} />
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
      const res = await fetch(`${API_BASE}/api/profiles`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await res.json();
      setProfiles(data);
    } catch (err) { console.error(err); alert('Failed to load profiles'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ if (user) fetchProfiles(); }, [user]);

  const addProfile = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
    return <div className="container py-8"><div className="max-w-md mx-auto p-6 rounded border bg-white dark:bg-gray-800">Please log in to track profiles.</div></div>;
  }

  return (
    <main className="container py-8">
      <h2 className="text-2xl font-bold mb-4">Profile Tracker</h2>

      <div className="max-w-3xl">
        <form onSubmit={addProfile} className="flex gap-2 mb-4">
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Paste Codeforces/LeetCode/HackerRank/GfG link or username" className="flex-1 px-3 py-2 border rounded" />
          <button className="px-4 py-2 bg-amber-600 text-white rounded">Add</button>
        </form>

        {loading ? <div>Loading...</div> : (
          <div className="space-y-4">
            {profiles.length === 0 && <div className="text-sm text-gray-500">No tracked profiles yet.</div>}
            {profiles.map(p => (
              <ProfileCard key={p._id} p={p} onRefresh={refreshProfile} onDelete={deleteProfile} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
