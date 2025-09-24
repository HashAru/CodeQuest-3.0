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

// Post menu component
function PostMenu({ postId, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('cq_token') : null;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete post');
      
      onDelete && onDelete(postId);
      setShowMenu(false);
    } catch (err) {
      alert(err.message || 'Error deleting post');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      
      {showMenu && (
        <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border rounded shadow-lg py-1 z-10 min-w-[100px]">
          <button
            onClick={handleDelete}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function PostCard({ post, onLikeUpdated, onDelete }) {
  const { user } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('cq_token') : null;
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [dislikeCount, setDislikeCount] = useState(post.dislikeCount || 0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const handleLike = async () => {
    if (!token) return alert('Login to like posts');
    try {
      const res = await fetch(`${API_BASE}/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Like failed');
      
      setLikeCount(data.likeCount);
      setDislikeCount(data.dislikeCount);
      setLiked(data.liked);
      setDisliked(data.disliked);
      
      onLikeUpdated && onLikeUpdated(post._id, data.likeCount, data.dislikeCount);
    } catch (err) {
      alert(err.message || 'Error liking');
    }
  };

  const handleDislike = async () => {
    if (!token) return alert('Login to dislike posts');
    try {
      const res = await fetch(`${API_BASE}/api/posts/${post._id}/dislike`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Dislike failed');
      
      setLikeCount(data.likeCount);
      setDislikeCount(data.dislikeCount);
      setLiked(data.liked);
      setDisliked(data.disliked);
      
      onLikeUpdated && onLikeUpdated(post._id, data.likeCount, data.dislikeCount);
    } catch (err) {
      alert(err.message || 'Error disliking');
    }
  };

  return (
    <div className="p-4 border rounded bg-white dark:bg-gray-800 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Link href={`/forum/${post._id}`} className="text-lg font-semibold hover:underline">{post.title}</Link>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{post.content?.slice(0, 240)}{post.content && post.content.length > 240 ? '...' : ''}</div>
          <div className="text-xs text-gray-500 mt-2">By {post.author?.email || 'Unknown'} • {new Date(post.createdAt).toLocaleString()}</div>
        </div>
        {post.image && (
          <img src={post.image} alt="post" className="w-28 h-20 object-cover rounded flex-shrink-0" />
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLike} 
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
              liked 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'border hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span>👍</span>
            <span>{likeCount}</span>
          </button>
          
          <button 
            onClick={handleDislike} 
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
              disliked 
                ? 'bg-red-100 text-red-700 border border-red-300' 
                : 'border hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span>👎</span>
            <span>{dislikeCount}</span>
          </button>
          
          <Link href={`/forum/${post._id}`} className="flex items-center gap-1 text-sm px-3 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-700">
            <span>💬</span>
            <span>{post.commentCount || 0} Comments</span>
          </Link>
        </div>

        {/* Post menu for author */}
        {user && post.author && post.author._id === user.id && (
          <PostMenu postId={post._id} onDelete={onDelete} />
        )}
      </div>
    </div>
  );
}
