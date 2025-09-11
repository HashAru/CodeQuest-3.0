// 'use client';
// import React, { useEffect, useState } from 'react';
// import Editor from '@monaco-editor/react';
// import { API_BASE } from '../../lib/api';

// export default function IDEPage() {
//   const [languages, setLanguages] = useState([]);
//   const [langId, setLangId] = useState(null);
//   const [source, setSource] = useState('// write your code here\n');
//   const [stdin, setStdin] = useState('');
//   const [output, setOutput] = useState('');
//   const [running, setRunning] = useState(false);
//   const [time, setTime] = useState(null);
//   const [memory, setMemory] = useState(null);
//   const [status, setStatus] = useState(null);

//   useEffect(() => {
//     fetch(`${API_BASE}/api/ide/languages`).then(r => r.json()).then(list => {
//       // Judge0 returns array of languages: pick a default (C++/Python/JS if found)
//       setLanguages(list);
//       if (list && list.length) {
//         // prefer C++ (common), else first
//         const prefer = ['C++ (GCC 9.2.0)', 'Python (3.8.1)', 'JavaScript (Node.js 12.14.0)'];
//         const found = list.find(l => prefer.includes(l.name)) || list[0];
//         if (found) setLangId(found.id);
//         // Optionally set starter templates for common languages:
//         if (found && /C\+\+|C\+\+/.test(found.name)) {
//           setSource(`#include <bits/stdc++.h>\nusing namespace std;\nint main(){ cout<<\"Hello from C++\"; return 0; }`);
//         } else if (found && /Python/.test(found.name)) {
//           setSource(`print(\"Hello from Python\")`);
//         } else if (found && /Node/.test(found.name) || found && /JavaScript/.test(found.name)) {
//           setSource(`console.log('Hello from JavaScript')`);
//         }
//       }
//     }).catch(err=>{ console.error('languages fetch', err); });
//   }, []);

//   const runCode = async () => {
//     if (!langId) return alert('Select a language');
//     setRunning(true);
//     setOutput('');
//     setTime(null);
//     setMemory(null);
//     setStatus('Submitting...');

//     try {
//       const body = { language_id: Number(langId), source, stdin, options: { wait: true } };
//       const r = await fetch(`${API_BASE}/api/ide/run`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body)
//       });
//       const data = await r.json();
//       if (!r.ok) {
//         console.error('run error', data);
//         setOutput(JSON.stringify(data, null, 2));
//         setStatus('Error');
//       } else {
//         // Judge0 returns base64-encoded stdout/stderr if we set base64_encoded=true
//         // Our backend used base64_encoded=true. The response fields are base64 strings.
//         const decode = (s) => {
//           if (!s) return '';
//           try { return atob(s); } catch { // fallback Node Buffer decode handled on backend; but client may need to decode
//             try { return Buffer.from(s, 'base64').toString('utf8'); } catch { return s; }
//           }
//         };
//         // Fields: stdout, stderr, compile_output, message, status, time, memory
//         const stdout = data.stdout ? decode(data.stdout) : '';
//         const stderr = data.stderr ? decode(data.stderr) : '';
//         const compile_output = data.compile_output ? decode(data.compile_output) : '';
//         const message = data.message ? decode(data.message) : '';

//         const combined = [
//           stdout && `--- stdout ---\n${stdout}`,
//           stderr && `--- stderr ---\n${stderr}`,
//           compile_output && `--- compile output ---\n${compile_output}`,
//           message && `--- message ---\n${message}`,
//         ].filter(Boolean).join('\n\n') || '(no output)';

//         setOutput(combined);
//         setTime(data.time ?? null);
//         setMemory(data.memory ?? null);
//         setStatus(data.status?.description || data.status_id || 'Done');
//       }
//     } catch (err) {
//       console.error('runCode error', err);
//       setOutput(String(err));
//       setStatus('Error');
//     } finally {
//       setRunning(false);
//     }
//   };

//   return (
//     <main className="container py-8">
//       <h2 className="text-2xl font-bold mb-4">Online IDE</h2>

//       <div className="mb-4 flex items-center gap-3">
//         <select value={langId || ''} onChange={(e)=>setLangId(e.target.value)} className="px-3 py-1 border rounded-md">
//           <option value="">Select language</option>
//           {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
//         </select>

//         <button onClick={runCode} disabled={running} className={`px-4 py-2 rounded ${running ? 'bg-gray-400' : 'bg-amber-600 text-white'}`}>
//           {running ? 'Running...' : 'Run'}
//         </button>

//         <div className="text-sm text-gray-600 ml-auto">
//           {status && <span className="mr-3">Status: {status}</span>}
//           {time != null && <span className="mr-3">Time: {time}s</span>}
//           {memory != null && <span>Memory: {memory}KB</span>}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2">
//           <Editor
//             height="60vh"
//             defaultLanguage="cpp"
//             language={languages.find(x=>x.id===Number(langId))?.name?.toLowerCase()?.includes('python') ? 'python' : 'cpp'}
//             value={source}
//             onChange={(v)=>setSource(v)}
//             options={{ fontSize:14, minimap:{enabled:false} }}
//           />
//         </div>

//         <aside className="rounded-lg p-4 border bg-white dark:bg-gray-800">
//           <label className="block text-sm font-medium mb-1">stdin</label>
//           <textarea value={stdin} onChange={e=>setStdin(e.target.value)} className="w-full border rounded p-2 mb-3" rows={6} />
//           <label className="block text-sm font-medium mb-1">Output</label>
//           <pre className="text-sm bg-black text-white rounded p-3 h-64 overflow-auto">{output}</pre>
//         </aside>
//       </div>
//     </main>
//   );
// }

'use client';
import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { API_BASE } from '../../lib/api';

function normalizeLanguages(resp) {
  // resp may be:
  // - an array: [ { id, name, ... }, ... ]
  // - an object: { languages: [...], data: [...] }
  // - an error object: { message: '...' }
  // - some unexpected shape from RapidAPI; try to be forgiving
  if (!resp) return [];

  if (Array.isArray(resp)) return resp;

  if (Array.isArray(resp.languages)) return resp.languages;
  if (Array.isArray(resp.data)) return resp.data;

  // If it's an object with numeric keys or entries that look like language objects:
  const entries = Object.values(resp);
  if (Array.isArray(entries) && entries.length > 0 && entries[0] && typeof entries[0] === 'object' && ('id' in entries[0] || 'name' in entries[0])) {
    return entries;
  }

  // Nothing matched, return empty array
  return [];
}

export default function IDEPage() {
  const [languages, setLanguages] = useState([]);
  const [langId, setLangId] = useState(null);
  const [source, setSource] = useState('// write your code here\n');
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(null);
  const [memory, setMemory] = useState(null);
  const [status, setStatus] = useState(null);
  const [langLoadError, setLangLoadError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadLanguages() {
      try {
        setLangLoadError(null);
        const res = await fetch(`${API_BASE}/api/ide/languages`);
        const data = await res.json();

        // Debug: log raw response once to help diagnose shape issues
        console.debug('IDE languages raw response:', data);

        const list = normalizeLanguages(data);

        if (!Array.isArray(list) || list.length === 0) {
          // Provide a helpful message and keep languages empty
          setLangLoadError('No languages found (unexpected response shape). Check backend or RapidAPI configuration. See console for raw response.');
          console.warn('IDE languages could not be normalized. Raw response:', data);
          setLanguages([]);
          return;
        }

        if (!mounted) return;
        setLanguages(list);

        // pick a sensible default language id if none selected
        if (!langId) {
          // prefer Python, JavaScript, or C++
          const preferNames = ['Python', 'JavaScript', 'Node', 'C++', 'C'];
          let pick = list.find(l => preferNames.some(p => (l.name || '').includes(p)));
          if (!pick) pick = list[0];
          if (pick) {
            setLangId(pick.id);
            // small templates for some languages
            const lname = (pick.name || '').toLowerCase();
            if (/python/.test(lname)) setSource('print("Hello from Python")');
            else if (/javascript|node/.test(lname)) setSource("console.log('Hello from JavaScript');");
            else if (/c\+\+|cpp/.test(lname)) setSource('#include <bits/stdc++.h>\\nusing namespace std;\\nint main(){ cout << \"Hello from C++\"; return 0; }');
            else setSource('// write your code here');
          }
        }
      } catch (err) {
        console.error('Failed to fetch languages for IDE:', err);
        setLangLoadError('Failed to load languages (see console for details).');
        setLanguages([]);
      }
    }
    loadLanguages();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  const runCode = async () => {
    if (!langId) return alert('Select a language');
    setRunning(true);
    setOutput('');
    setTime(null);
    setMemory(null);
    setStatus('Submitting...');

    try {
      const body = { language_id: Number(langId), source, stdin, options: { wait: true } };
      const r = await fetch(`${API_BASE}/api/ide/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await r.json();

      if (!r.ok) {
        console.error('IDE run request failed:', data);
        setOutput(JSON.stringify(data, null, 2));
        setStatus('Error');
      } else {
        // Judge0 returns base64-encoded fields when we request base64_encoded=true
        const safeDecode = (s) => {
          if (!s) return '';
          try {
            // browser atob
            return atob(s);
          } catch (e) {
            // fallback for Node Buffer strings (shouldn't be needed in browser)
            try { return Buffer.from(s, 'base64').toString('utf8'); } catch { return s; }
          }
        };

        const stdout = data.stdout ? safeDecode(data.stdout) : '';
        const stderr = data.stderr ? safeDecode(data.stderr) : '';
        const compile_output = data.compile_output ? safeDecode(data.compile_output) : '';
        const message = data.message ? safeDecode(data.message) : '';

        const combined = [
          stdout && `--- stdout ---\n${stdout}`,
          stderr && `--- stderr ---\n${stderr}`,
          compile_output && `--- compile output ---\n${compile_output}`,
          message && `--- message ---\n${message}`,
        ].filter(Boolean).join('\n\n') || '(no output)';

        setOutput(combined);
        setTime(data.time ?? null);
        setMemory(data.memory ?? null);
        setStatus(data.status?.description || data.status?.id || 'Done');
      }
    } catch (err) {
      console.error('runCode error', err);
      setOutput(String(err));
      setStatus('Error');
    } finally {
      setRunning(false);
    }
  };

  return (
    <main className="container py-8">
      <h2 className="text-2xl font-bold mb-4">Online IDE</h2>

      <div className="mb-4 flex items-center gap-3">
        <select value={langId || ''} onChange={(e)=>setLangId(e.target.value)} className="px-3 py-1 border rounded-md">
          <option value="">Select language</option>
          {Array.isArray(languages) && languages.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        <button onClick={runCode} disabled={running} className={`px-4 py-2 rounded ${running ? 'bg-gray-400' : 'bg-amber-600 text-white'}`}>
          {running ? 'Running...' : 'Run'}
        </button>

        <div className="text-sm text-gray-600 ml-auto">
          {status && <span className="mr-3">Status: {status}</span>}
          {time != null && <span className="mr-3">Time: {time}s</span>}
          {memory != null && <span>Memory: {memory}KB</span>}
        </div>
      </div>

      {langLoadError && <div className="mb-4 p-3 rounded bg-red-50 text-red-700">{langLoadError}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Editor
            height="60vh"
            defaultLanguage="cpp"
            language={(() => {
              const l = languages.find(x=>x.id === Number(langId));
              if (!l) return 'plaintext';
              const name = (l.name || '').toLowerCase();
              if (name.includes('python')) return 'python';
              if (name.includes('javascript') || name.includes('node')) return 'javascript';
              if (name.includes('java')) return 'java';
              if (name.includes('c++') || name.includes('cpp')) return 'cpp';
              return 'plaintext';
            })()}
            value={source}
            onChange={(v)=>setSource(v || '')}
            options={{ fontSize:14, minimap:{enabled:false} }}
          />
        </div>

        <aside className="rounded-lg p-4 border bg-white dark:bg-gray-800">
          <label className="block text-sm font-medium mb-1">stdin</label>
          <textarea value={stdin} onChange={e=>setStdin(e.target.value)} className="w-full border rounded p-2 mb-3" rows={6} />
          <label className="block text-sm font-medium mb-1">Output</label>
          <pre className="text-sm bg-black text-white rounded p-3 h-64 overflow-auto whitespace-pre-wrap">{output}</pre>
        </aside>
      </div>
    </main>
  );
}
