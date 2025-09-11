// 'use client';
// import { useState } from 'react';
// import { API_BASE } from '../../lib/api';
// import { useAuth } from '../../lib/authContext';

// export default function CreatePostForm({ onCreated }) {
//   const { user } = useAuth();
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const token = typeof window !== 'undefined' ? localStorage.getItem('cq_token') : null;

//   const submit = async (e) => {
//     e.preventDefault();
//     if (!title.trim()) return alert('Title required');
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append('title', title);
//       fd.append('content', content);
//       if (file) fd.append('image', file);

//       const res = await fetch(`${API_BASE}/api/posts`, {
//         method: 'POST',
//         headers: token ? { Authorization: `Bearer ${token}` } : undefined,
//         body: fd
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'Create failed');
//       setTitle(''); setContent(''); setFile(null);
//       onCreated && onCreated(data);
//     } catch (err) {
//       alert(err.message || 'Error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!user) return <div className="p-4 border rounded text-sm">Please log in to create posts.</div>;

//   return (
//     <form onSubmit={submit} className="p-4 rounded border bg-white dark:bg-gray-800 space-y-3">
//       <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full px-3 py-2 border rounded" />
//       <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Write something..." className="w-full px-3 py-2 border rounded" rows={4} />
//       <div className="flex items-center gap-3">
//         <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
//         <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded" disabled={loading}>{loading ? 'Posting...' : 'Post'}</button>
//       </div>
//     </form>
//   );
// }

'use client';
import { useState } from 'react';
import { API_BASE } from '../../lib/api';
import { useAuth } from '../../lib/authContext';

export default function CreatePostForm({ onCreated }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('cq_token') : null;

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Title required');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('content', content);
      if (file) fd.append('image', file);

      const res = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Create failed');
      setTitle(''); setContent(''); setFile(null);
      onCreated && onCreated(data);
    } catch (err) {
      alert(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-4 border rounded text-sm">Please log in to create posts.</div>;

  return (
    <form onSubmit={submit} className="p-4 rounded border bg-white dark:bg-gray-800 space-y-3">
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full px-3 py-2 border rounded" />
      <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Write something..." className="w-full px-3 py-2 border rounded" rows={4} />
      <div className="flex items-center gap-3">
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
        <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded" disabled={loading}>{loading ? 'Posting...' : 'Post'}</button>
      </div>
    </form>
  );
}
