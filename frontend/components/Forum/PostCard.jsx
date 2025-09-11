// 'use client';
// import Link from 'next/link';
// import { API_BASE } from '../../lib/api';
// import { useAuth } from '../../lib/authContext';
// import { useState } from 'react';

// export default function PostCard({ post, onLikeUpdated }) {
//   const { user } = useAuth();
//   const token = typeof window !== 'undefined' ? localStorage.getItem('cq_token') : null;
//   const [likeCount, setLikeCount] = useState(post.likeCount || (post.likes && post.likes.length) || 0);
//   const [liked, setLiked] = useState(false); // optimistic (we don't track per-user liked state on initial load here)

//   const toggleLike = async () => {
//     if (!token) return alert('Login to like posts');
//     try {
//       const res = await fetch(`${API_BASE}/api/posts/${post._id}/like`, {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'Like failed');
//       setLikeCount(data.likeCount);
//       setLiked(data.liked);
//       onLikeUpdated && onLikeUpdated(post._id, data.likeCount, data.liked);
//     } catch (err) {
//       alert(err.message || 'Error liking');
//     }
//   };

//   return (
//     <div className="p-4 border rounded bg-white dark:bg-gray-800 space-y-2">
//       <div className="flex items-start justify-between gap-3">
//         <div>
//           <Link href={`/forum/${post._id}`} className="text-lg font-semibold hover:underline">{post.title}</Link>
//           <div className="text-sm text-gray-600 dark:text-gray-300">{post.content?.slice(0, 240)}{post.content && post.content.length > 240 ? '...' : ''}</div>
//           <div className="text-xs text-gray-500 mt-2">By {post.author?.email || 'Unknown'} • {new Date(post.createdAt).toLocaleString()}</div>
//         </div>
//         {post.image && (
//           <img src={`${API_BASE}${post.image}`} alt="post" className="w-28 h-20 object-cover rounded" />
//         )}
//       </div>

//       <div className="flex items-center gap-3">
//         <button onClick={toggleLike} className="px-3 py-1 rounded border text-sm">
//           {liked ? 'Unlike' : 'Like'} ({likeCount})
//         </button>
//         <Link href={`/forum/${post._id}`} className="text-sm px-3 py-1 border rounded">Comments</Link>
//       </div>
//     </div>
//   );
// }

'use client';
import Link from 'next/link';
import { API_BASE } from '../../lib/api';
import { useAuth } from '../../lib/authContext';
import { useState } from 'react';

export default function PostCard({ post, onLikeUpdated }) {
  const { user } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('cq_token') : null;
  const [likeCount, setLikeCount] = useState(post.likeCount || (post.likes && post.likes.length) || 0);
  const [liked, setLiked] = useState(false);

  const toggleLike = async () => {
    if (!token) return alert('Login to like posts');
    try {
      const res = await fetch(`${API_BASE}/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Like failed');
      setLikeCount(data.likeCount);
      setLiked(data.liked);
      onLikeUpdated && onLikeUpdated(post._id, data.likeCount, data.liked);
    } catch (err) {
      alert(err.message || 'Error liking');
    }
  };

  return (
    <div className="p-4 border rounded bg-white dark:bg-gray-800 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/forum/${post._id}`} className="text-lg font-semibold hover:underline">{post.title}</Link>
          <div className="text-sm text-gray-600 dark:text-gray-300">{post.content?.slice(0, 240)}{post.content && post.content.length > 240 ? '...' : ''}</div>
          <div className="text-xs text-gray-500 mt-2">By {post.author?.email || 'Unknown'} • {new Date(post.createdAt).toLocaleString()}</div>
        </div>
        {post.image && (
          <img src={post.image} alt="post" className="w-28 h-20 object-cover rounded" />
        )}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={toggleLike} className="px-3 py-1 rounded border text-sm">
          {liked ? 'Unlike' : 'Like'} ({likeCount})
        </button>
        <Link href={`/forum/${post._id}`} className="text-sm px-3 py-1 border rounded">Comments</Link>
      </div>
    </div>
  );
}
