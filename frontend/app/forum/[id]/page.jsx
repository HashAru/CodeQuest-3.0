'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_BASE } from '../../../lib/api';

export default function PostDetailsPage() {
  const params = useParams();
  const id = params?.id;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('cq_token') : null;

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/posts/${id}`);
      const data = await res.json();
      setPost(data.post);
      setComments(data.comments || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ if (id) fetchPost(); }, [id]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!token) return alert('Login to comment');
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/posts/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: commentText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Comment failed');
      setComments(prev => [...prev, data]);
      setCommentText('');
    } catch (err) {
      alert(err.message || 'Error');
    }
  };

  if (!id) return <div className="p-6">Invalid post id</div>;
  if (loading) return <div className="p-6">Loading...</div>;
  if (!post) return <div className="p-6">Post not found</div>;

  return (
    <main className="container py-8">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="p-4 border rounded bg-white dark:bg-gray-800">
          <h1 className="text-2xl font-semibold">{post.title}</h1>
          <div className="text-xs text-gray-500 mb-3">By {post.author?.email} • {new Date(post.createdAt).toLocaleString()}</div>
          {post.image && <img src={post.image} className="w-full max-h-80 object-cover rounded mb-3" alt="post" />}
          <div className="whitespace-pre-wrap">{post.content}</div>
        </div>

        <div className="p-4 border rounded bg-white dark:bg-gray-800">
          <h3 className="font-semibold mb-3">Comments</h3>
          <form onSubmit={addComment} className="mb-4 space-y-2">
            <textarea value={commentText} onChange={e=>setCommentText(e.target.value)} className="w-full border rounded px-3 py-2" rows={3} />
            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded">Add comment</button>
            </div>
          </form>

          <div className="space-y-3">
            {comments.length === 0 && <div className="text-sm text-gray-500">No comments yet.</div>}
            {comments.map(c => (
              <div key={c._id} className="p-3 border rounded">
                <div className="text-xs text-gray-500">By {c.author?.email} • {new Date(c.createdAt).toLocaleString()}</div>
                <div className="mt-1">{c.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
