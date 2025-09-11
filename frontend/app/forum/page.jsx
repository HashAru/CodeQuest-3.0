// 'use client';
// import { useEffect, useState } from 'react';
// import CreatePostForm from '../../components/Forum/CreatePostForm';
// import PostList from '../../components/Forum/PostList';
// import { API_BASE } from '../../lib/api';

// export default function ForumPage() {
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const fetchPosts = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/api/posts`);
//       const data = await res.json();
//       setPosts(data);
//     } catch (err) {
//       console.error(err);
//       alert('Failed to load posts');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(()=>{ fetchPosts(); }, []);

//   const handleCreated = (newPost) => {
//     // new post comes from API (populated author)
//     setPosts(prev => [newPost, ...prev]);
//   };

//   const handleLikeUpdated = (postId, likeCount) => {
//     setPosts(prev => prev.map(p => p._id === postId ? { ...p, likeCount } : p));
//   };

//   return (
//     <main className="container py-8">
//       <h2 className="text-2xl font-bold mb-4">Discussion Forum</h2>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 space-y-4">
//           <CreatePostForm onCreated={handleCreated} />
//           {loading ? <div>Loading posts...</div> : <PostList posts={posts} onLikeUpdated={handleLikeUpdated} />}
//         </div>

//         <aside className="rounded-lg p-4 border bg-white dark:bg-gray-800">
//           <h3 className="font-semibold">About</h3>
//           <div className="text-sm text-gray-600 mt-2">Create posts, upload images, comment and like/upvote. Latest posts shown first.</div>
//         </aside>
//       </div>
//     </main>
//   );
// }

'use client';
import { useEffect, useState } from 'react';
import CreatePostForm from '../../components/Forum/CreatePostForm';
import PostList from '../../components/Forum/PostList';
import { API_BASE } from '../../lib/api';

export default function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/posts`);
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('fetchPosts error', err);
      alert('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleCreated = (newPost) => setPosts(prev => [newPost, ...prev]);
  const handleLikeUpdated = (postId, likeCount) => setPosts(prev => prev.map(p => p._id === postId ? { ...p, likeCount } : p));

  return (
    <main className="container py-8">
      <h2 className="text-2xl font-bold mb-4">Discussion Forum</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <CreatePostForm onCreated={handleCreated} />
          {loading ? <div>Loading posts...</div> : <PostList posts={posts} onLikeUpdated={handleLikeUpdated} />}
        </div>
        <aside className="rounded-lg p-4 border bg-white dark:bg-gray-800">
          <h3 className="font-semibold">About</h3>
          <div className="text-sm text-gray-600 mt-2">Create posts, upload images, comment and like/upvote. Latest posts shown first.</div>
        </aside>
      </div>
    </main>
  );
}
