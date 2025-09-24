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
import CreatePostModal from '../../components/Forum/CreatePostModal';
import PostList from '../../components/Forum/PostList';
import { API_BASE } from '../../lib/api';
import { useAuth } from '../../lib/authContext';

export default function ForumPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
  const handleLikeUpdated = (postId, likeCount, dislikeCount) => {
    setPosts(prev => prev.map(p => 
      p._id === postId ? { ...p, likeCount, dislikeCount } : p
    ));
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  return (
    <main className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Discussion Forum</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
        >
          + New Post
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading posts...</p>
            </div>
          ) : (
            <PostList posts={posts} onLikeUpdated={handleLikeUpdated} onPostDeleted={handlePostDeleted} />
          )}
        </div>
        
        <aside className="lg:sticky lg:top-4 h-fit">
          <div className="rounded-lg p-6 border bg-white dark:bg-gray-800 space-y-4">
            <h3 className="font-semibold text-lg">About Forum</h3>
            
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <p>Welcome to our discussion forum! Share your thoughts, ask questions, and engage with the community.</p>
              
              <div className="border-t pt-3">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Features:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Create posts with text and images</li>
                  <li>• Like and dislike posts</li>
                  <li>• Comment on discussions</li>
                  <li>• Latest posts shown first</li>
                </ul>
              </div>
              
              <div className="border-t pt-3">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Guidelines:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Be respectful and constructive</li>
                  <li>• Stay on topic</li>
                  <li>• No spam or inappropriate content</li>
                  <li>• Help others learn and grow</li>
                </ul>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-xs">
                  <span>Total Posts:</span>
                  <span className="font-medium">{posts.length}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Active Users:</span>
                  <span className="font-medium">{user ? 'Online' : 'Login to participate'}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <CreatePostModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreated}
      />
    </main>
  );
}
