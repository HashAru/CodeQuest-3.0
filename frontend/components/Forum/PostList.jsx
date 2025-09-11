// 'use client';
// import PostCard from './PostCard';

// export default function PostList({ posts, onLikeUpdated }) {
//   if (!posts || posts.length === 0) return <div className="text-sm p-4 text-gray-500">No posts yet.</div>;
//   return (
//     <div className="space-y-4">
//       {posts.map(p => <PostCard key={p._id} post={p} onLikeUpdated={onLikeUpdated} />)}
//     </div>
//   );
// }

'use client';
import PostCard from './PostCard';

export default function PostList({ posts, onLikeUpdated }) {
  if (!posts || posts.length === 0) return <div className="text-sm p-4 text-gray-500">No posts yet.</div>;
  return (
    <div className="space-y-4">
      {posts.map(p => <PostCard key={p._id} post={p} onLikeUpdated={onLikeUpdated} />)}
    </div>
  );
}
