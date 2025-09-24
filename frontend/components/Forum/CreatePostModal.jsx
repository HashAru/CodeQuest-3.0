'use client';
import { useState } from 'react';
import { API_BASE } from '../../lib/api';
import { useAuth } from '../../lib/authContext';

export default function CreatePostModal({ isOpen, onClose, onCreated }) {
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

            setTitle('');
            setContent('');
            setFile(null);
            onCreated && onCreated(data);
            onClose();
        } catch (err) {
            alert(err.message || 'Error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Create New Post</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {!user ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Please log in to create posts.</p>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title *</label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Enter post title"
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Content</label>
                                <textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder="Write your post content..."
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    rows={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Image (optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setFile(e.target.files[0])}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? 'Posting...' : 'Create Post'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}