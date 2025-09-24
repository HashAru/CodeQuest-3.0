// 'use client';
// import React, { useEffect, useState } from 'react';
// import { API_BASE } from '../../lib/api';
// import { useAuth } from '../../lib/authContext';

// function ChatMessage({ m }) {
//   const isUser = m.role === 'user';
//   return (
//     <div className={`mb-3 ${isUser ? 'text-right' : 'text-left'}`}>
//       <div className={`inline-block p-3 rounded-lg ${isUser ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'}`}>
//         {m.content}
//       </div>
//       <div className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
//     </div>
//   );
// }

// export default function AIPage() {
//   const { user } = useAuth();
//   const [conversations, setConversations] = useState([]);
//   const [current, setCurrent] = useState(null);
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const token = typeof window !== 'undefined' ? localStorage.getItem('cq_token') : null;

//   const fetchConversations = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/api/ai/conversations`, { headers: { Authorization: `Bearer ${token}` }});
//       const data = await res.json();
//       setConversations(data);
//       if (!current && data && data.length) setCurrent(data[0]);
//     } catch (err) { console.error(err); }
//   };

//   useEffect(() => { if (user) fetchConversations(); }, [user]);

//   const sendMessage = async () => {
//     if (!input.trim()) return;
//     setLoading(true);
//     try {
//       const body = {
//         conversationId: current?._id,
//         message: input,
//         title: current ? undefined : `Study: ${input.slice(0,40)}`
//       };
//       const res = await fetch(`${API_BASE}/api/ai/chat`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         body: JSON.stringify(body)
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'Chat failed');

//       // update local conversation state
//       setCurrent(data.conversation);
//       // update list
//       setConversations(prev => {
//         // put updated conversation on top
//         const rest = prev.filter(c => c._id !== data.conversation._id);
//         return [data.conversation, ...rest];
//       });
//       setInput('');
//     } catch (err) {
//       alert(err.message || 'Send failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadConversation = async (id) => {
//     try {
//       const res = await fetch(`${API_BASE}/api/ai/conversations/${id}`, { headers: { Authorization: `Bearer ${token}` }});
//       const data = await res.json();
//       setCurrent(data);
//     } catch (err) { console.error(err); }
//   };

//   const createNew = () => {
//     setCurrent({ messages: [], title: 'New Study Plan' });
//   };

//   if (!user) return <div className="container py-8">Please log in to use the Study Planner AI.</div>;

//   return (
//     <main className="container py-8">
//       <h2 className="text-2xl font-bold mb-4">AI Study Planner</h2>

//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//         <aside className="col-span-1 border rounded p-4 bg-white dark:bg-gray-800 h-[70vh] overflow-auto">
//           <div className="flex items-center justify-between mb-4">
//             <div className="font-semibold">Conversations</div>
//             <button onClick={createNew} className="px-2 py-1 rounded bg-amber-500 text-white text-sm">New</button>
//           </div>
//           <div className="space-y-2">
//             {conversations.map(c => (
//               <div key={c._id} className={`p-2 rounded cursor-pointer ${current && current._id === c._id ? 'bg-gray-100 dark:bg-gray-700' : ''}`} onClick={()=>loadConversation(c._id)}>
//                 <div className="font-medium">{c.title}</div>
//                 <div className="text-xs text-gray-500">{c.updatedAt ? new Date(c.updatedAt).toLocaleString() : ''}</div>
//               </div>
//             ))}
//             {conversations.length === 0 && <div className="text-sm text-gray-500">No saved conversations yet.</div>}
//           </div>
//         </aside>

//         <section className="col-span-3 border rounded p-4 bg-white dark:bg-gray-800 h-[70vh] flex flex-col">
//           <div className="flex-1 overflow-auto mb-4">
//             <div className="text-sm text-gray-500 mb-2 font-medium">{current?.title || 'New Study Plan'}</div>
//             <div>
//               {(current?.messages || []).map((m, i) => <ChatMessage key={i} m={m} />)}
//             </div>
//           </div>

//           <div className="mt-auto">
//             <textarea value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Ask about a study plan, ask for topics, request exercises, or ask for schedules..." className="w-full p-3 border rounded mb-2" rows={3} />
//             <div className="flex items-center justify-between">
//               <div className="text-xs text-gray-500">Be polite and ask only academic questions — the assistant will refuse otherwise.</div>
//               <div>
//                 <button onClick={sendMessage} disabled={loading} className="px-4 py-2 bg-amber-600 text-white rounded">
//                   {loading ? 'Sending...' : 'Send'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// }

// 'use client';
// import React, { useEffect, useRef, useState } from 'react';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
// import rehypeHighlight from 'rehype-highlight';
// import 'highlight.js/styles/github.css'; // choose any highlight.js theme you like

// import { API_BASE } from '../../lib/api';
// import { useAuth } from '../../lib/authContext';

// function ChatMessage({ m }) {
//   const isUser = m.role === 'user';

//   return (
//     <div className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
//       <div className={`max-w-[85%] inline-block p-3 rounded-lg shadow-sm ${isUser ? 'bg-amber-500 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
//         {/* <ReactMarkdown
//           remarkPlugins={[remarkGfm]}
//           rehypePlugins={[rehypeHighlight]}
//           className="prose prose-sm max-w-none dark:prose-invert"
//         >
//           {m.content}
//         </ReactMarkdown> */}
//         <div className="prose prose-sm max-w-none dark:prose-invert">
//           <ReactMarkdown
//             remarkPlugins={[remarkGfm]}
//             rehypePlugins={[rehypeHighlight]}
//           >
//             {m.content}
//           </ReactMarkdown>
//         </div>
//         <div className="text-xs text-gray-400 mt-2 text-right">
//           {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function AIPage() {
//   const { user } = useAuth();
//   const [conversations, setConversations] = useState([]);
//   const [current, setCurrent] = useState(null);
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const token = typeof window !== 'undefined' ? localStorage.getItem('cq_token') : null;
//   const chatScrollRef = useRef(null);

//   const fetchConversations = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/api/ai/conversations`, { headers: { Authorization: `Bearer ${token}` } });
//       const data = await res.json();
//       setConversations(data || []);
//       if (!current && data && data.length) setCurrent(data[0]);
//     } catch (err) { console.error(err); }
//   };

//   useEffect(() => { if (user) fetchConversations(); }, [user]);

//   // auto-scroll to bottom when current messages change
//   useEffect(() => {
//     if (!chatScrollRef.current) return;
//     // small timeout to allow DOM update
//     const t = setTimeout(() => {
//       chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
//     }, 50);
//     return () => clearTimeout(t);
//   }, [current?.messages?.length]);

//   const sendMessage = async () => {
//     if (!input.trim()) return;
//     setLoading(true);
//     try {
//       const body = {
//         conversationId: current?._id,
//         message: input,
//         title: current ? undefined : `Study: ${input.slice(0, 40)}`
//       };
//       const res = await fetch(`${API_BASE}/api/ai/chat`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         body: JSON.stringify(body)
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || data.details || 'Chat failed');

//       // update local conversation state and list
//       setCurrent(data.conversation);
//       setConversations(prev => {
//         const rest = prev.filter(c => c._id !== data.conversation._id);
//         return [data.conversation, ...rest];
//       });
//       setInput('');
//     } catch (err) {
//       alert(err.message || 'Send failed');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadConversation = async (id) => {
//     try {
//       const res = await fetch(`${API_BASE}/api/ai/conversations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
//       const data = await res.json();
//       setCurrent(data);
//     } catch (err) { console.error(err); }
//   };

//   const createNew = () => {
//     setCurrent({ messages: [], title: 'New Study Plan' });
//   };

//   if (!user) return <div className="container py-8">Please log in to use the Study Planner AI.</div>;

//   return (
//     <main className="container py-8">
//       <h2 className="text-2xl font-bold mb-4">AI Study Planner</h2>

//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//         <aside className="col-span-1 border rounded p-4 bg-white dark:bg-gray-800 h-[70vh] overflow-auto">
//           <div className="flex items-center justify-between mb-4">
//             <div className="font-semibold">Conversations</div>
//             <button onClick={createNew} className="px-2 py-1 rounded bg-amber-500 text-white text-sm">New</button>
//           </div>
//           <div className="space-y-2">
//             {conversations.map(c => (
//               <div
//                 key={c._id}
//                 className={`p-2 rounded cursor-pointer ${current && current._id === c._id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
//                 onClick={() => loadConversation(c._id)}
//               >
//                 <div className="font-medium">{c.title}</div>
//                 <div className="text-xs text-gray-500">{c.updatedAt ? new Date(c.updatedAt).toLocaleString() : ''}</div>
//               </div>
//             ))}
//             {conversations.length === 0 && <div className="text-sm text-gray-500">No saved conversations yet.</div>}
//           </div>
//         </aside>

//         <section className="col-span-3 border rounded p-4 bg-white dark:bg-gray-800 h-[70vh] flex flex-col">
//           <div className="flex-1 overflow-auto mb-4" ref={chatScrollRef}>
//             <div className="text-sm text-gray-500 mb-2 font-medium">{current?.title || 'New Study Plan'}</div>
//             <div className="flex flex-col">
//               {(current?.messages || []).map((m, i) => <ChatMessage key={i} m={m} />)}
//             </div>
//           </div>

//           <div className="mt-auto">
//             <textarea
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder="Ask about a study plan, ask for topics, request exercises, or ask for schedules..."
//               className="w-full p-3 border rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//               rows={3}
//             />
//             <div className="flex items-center justify-between">
//               <div className="text-xs text-gray-500">Be polite and ask only academic questions — the assistant will refuse otherwise.</div>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => { setInput(''); }}
//                   type="button"
//                   className="px-3 py-2 border rounded text-sm"
//                 >
//                   Clear
//                 </button>
//                 <button
//                   onClick={sendMessage}
//                   disabled={loading}
//                   className="px-4 py-2 bg-amber-600 text-white rounded"
//                 >
//                   {loading ? 'Sending...' : 'Send'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// }


'use client';
import React, { useEffect, useRef, useState } from 'react';
import { API_BASE } from '../../lib/api';
import { useAuth } from '../../lib/authContext';

// Conversation item with dropdown menu
function ConversationItem({ conversation, isActive, onSelect, onRename, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(conversation.title);

  const handleRename = () => {
    if (newTitle.trim() && newTitle !== conversation.title) {
      onRename(newTitle.trim());
    }
    setIsRenaming(false);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      onDelete();
    }
    setShowMenu(false);
  };

  return (
    <div className={`relative p-3 rounded-lg cursor-pointer group transition-all duration-200 ${
      isActive 
        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700/50' 
        : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0" onClick={onSelect}>
          {isRenaming ? (
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setIsRenaming(false);
                  setNewTitle(conversation.title);
                }
              }}
              className="w-full text-sm font-medium bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400"
              autoFocus
            />
          ) : (
            <div className="font-medium text-sm truncate">{conversation.title}</div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            {conversation.updatedAt ? new Date(conversation.updatedAt).toLocaleString() : ''}
          </div>
        </div>
        
        <div className="relative ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-opacity"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border rounded shadow-lg py-1 z-10 min-w-[120px]">
              <button
                onClick={() => {
                  setIsRenaming(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Rename
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Typing indicator (animated dots)
function TypingIndicator() {
  return (
    <div className="mb-4 flex justify-start">
      <div className="inline-block p-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce-slow" />
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce-slow animation-delay-75" />
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce-slow animation-delay-150" />
        </div>
      </div>
    </div>
  );
}

// individual chat bubble (renders markdown)
function ChatMessage({ m }) {
  const isUser = m.role === 'user';

  return (
    <div className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] inline-block p-4 rounded-2xl shadow-sm ${
        isUser 
          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' 
          : 'bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-slate-600'
      }`}>
        <div className="whitespace-pre-wrap break-words">
          {m.content || ''}
        </div>

        <div className={`text-xs mt-3 text-right ${
          isUser ? 'text-emerald-100' : 'text-gray-400 dark:text-gray-500'
        }`}>
          {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
        </div>
      </div>
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

  const chatScrollRef = useRef(null);

  // Mock data for demo purposes
  const createNew = () => {
    setCurrent({ 
      messages: [], 
      title: 'New Study Plan',
      _id: 'demo-' + Date.now()
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    
    // Add user message
    const userMessage = {
      role: 'user',
      content: input,
      createdAt: new Date().toISOString()
    };
    
    // Mock AI response
    const aiResponse = {
      role: 'assistant',
      content: `I understand you're asking about: "${input}"\n\nThis is a demo response. In a full implementation, this would connect to an AI service to provide personalized study plans, coding guidance, and educational content.\n\nSome suggestions based on your query:\n• Break down complex topics into smaller parts\n• Practice with hands-on coding exercises\n• Review fundamental concepts regularly\n• Track your progress over time`,
      createdAt: new Date().toISOString()
    };
    
    setTimeout(() => {
      setCurrent(prev => ({
        ...prev,
        messages: [...(prev?.messages || []), userMessage, aiResponse]
      }));
      setInput('');
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (!chatScrollRef.current) return;
    const t = setTimeout(() => {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }, 50);
    return () => clearTimeout(t);
  }, [current?.messages?.length, loading]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container py-8">
          <div className="max-w-md mx-auto p-6 rounded-lg border bg-white dark:bg-gray-800 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
            <p className="text-gray-600 dark:text-gray-400">Please log in to use the AI Study Planner.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container py-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">AI Study Planner</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Get personalized study plans and coding guidance from our intelligent assistant</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="col-span-1">
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-slate-800 h-[85vh] overflow-auto shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="font-semibold text-gray-900 dark:text-gray-100">Conversations</div>
                <button 
                  onClick={createNew} 
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  + New
                </button>
              </div>

              <div className="space-y-2">
                {current && (
                  <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700/50">
                    <div className="font-medium text-sm">{current.title}</div>
                    <div className="text-xs text-gray-500 mt-1">Active conversation</div>
                  </div>
                )}
                {!current && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">💬</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start a new chat to begin</div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <section className="col-span-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-slate-800 h-[85vh] flex flex-col shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-slate-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white text-lg">🤖</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{current?.title || 'New Study Plan'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">AI-powered learning assistant</div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6" ref={chatScrollRef}>
              {!current ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Welcome to AI Study Planner
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Start a new conversation to get personalized study plans and coding guidance
                  </p>
                  <button 
                    onClick={createNew}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    Start New Conversation
                  </button>
                </div>
              ) : (
                <div className="flex flex-col">
                  {(current?.messages || []).map((m, i) => (
                    <ChatMessage key={i} m={m} />
                  ))}
                  {loading && <TypingIndicator />}
                </div>
              )}
            </div>

            {current && (
              <div className="p-6 border-t border-gray-200 dark:border-slate-600">
                <div className="flex gap-3">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about study plans, coding topics, or request guidance..."
                    className="flex-1 p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
