'use client';
import React, { useEffect, useState } from 'react';
import { API_BASE } from '../../lib/api';
import { useAuth } from '../../lib/authContext';

function ChatMessage({ m }) {
  const isUser = m.role === 'user';
  return (
    <div className={`mb-3 ${isUser ? 'text-right' : 'text-left'}`}>
      <div className={`inline-block p-3 rounded-lg ${isUser ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'}`}>
        {m.content}
      </div>
      <div className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
    </div>
  );
}

export default function AIPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [current, setCurrent] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('cq_token') : null;

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ai/conversations`, { headers: { Authorization: `Bearer ${token}` }});
      const data = await res.json();
      setConversations(data);
      if (!current && data && data.length) setCurrent(data[0]);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { if (user) fetchConversations(); }, [user]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const body = {
        conversationId: current?._id,
        message: input,
        title: current ? undefined : `Study: ${input.slice(0,40)}`
      };
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Chat failed');

      // update local conversation state
      setCurrent(data.conversation);
      // update list
      setConversations(prev => {
        // put updated conversation on top
        const rest = prev.filter(c => c._id !== data.conversation._id);
        return [data.conversation, ...rest];
      });
      setInput('');
    } catch (err) {
      alert(err.message || 'Send failed');
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/ai/conversations/${id}`, { headers: { Authorization: `Bearer ${token}` }});
      const data = await res.json();
      setCurrent(data);
    } catch (err) { console.error(err); }
  };

  const createNew = () => {
    setCurrent({ messages: [], title: 'New Study Plan' });
  };

  if (!user) return <div className="container py-8">Please log in to use the Study Planner AI.</div>;

  return (
    <main className="container py-8">
      <h2 className="text-2xl font-bold mb-4">AI Study Planner</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="col-span-1 border rounded p-4 bg-white dark:bg-gray-800 h-[70vh] overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold">Conversations</div>
            <button onClick={createNew} className="px-2 py-1 rounded bg-amber-500 text-white text-sm">New</button>
          </div>
          <div className="space-y-2">
            {conversations.map(c => (
              <div key={c._id} className={`p-2 rounded cursor-pointer ${current && current._id === c._id ? 'bg-gray-100 dark:bg-gray-700' : ''}`} onClick={()=>loadConversation(c._id)}>
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-gray-500">{c.updatedAt ? new Date(c.updatedAt).toLocaleString() : ''}</div>
              </div>
            ))}
            {conversations.length === 0 && <div className="text-sm text-gray-500">No saved conversations yet.</div>}
          </div>
        </aside>

        <section className="col-span-3 border rounded p-4 bg-white dark:bg-gray-800 h-[70vh] flex flex-col">
          <div className="flex-1 overflow-auto mb-4">
            <div className="text-sm text-gray-500 mb-2 font-medium">{current?.title || 'New Study Plan'}</div>
            <div>
              {(current?.messages || []).map((m, i) => <ChatMessage key={i} m={m} />)}
            </div>
          </div>

          <div className="mt-auto">
            <textarea value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Ask about a study plan, ask for topics, request exercises, or ask for schedules..." className="w-full p-3 border rounded mb-2" rows={3} />
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">Be polite and ask only academic questions — the assistant will refuse otherwise.</div>
              <div>
                <button onClick={sendMessage} disabled={loading} className="px-4 py-2 bg-amber-600 text-white rounded">
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
