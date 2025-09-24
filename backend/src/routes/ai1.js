// // backend/src/routes/ai.js
// import express from 'express';
// import dotenv from 'dotenv';
// dotenv.config();

// import Conversation from '../models/Conversation.js';
// import auth from '../middleware/auth.js';

// const router = express.Router();

// // Configuration from .env
// const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
// const GEMINI_MODEL = process.env.GEMINI_MODEL || 'models/gemini-2.0-flash';
// const GEMINI_BASE = process.env.GEMINI_BASE || 'https://generativelanguage.googleapis.com/v1beta';

// /**
//  * Attempt to initialize the official Gemini SDK client if available.
//  * If SDK is not installed, we'll fall back to a REST call.
//  *
//  * Note: Install the SDK if you prefer the SDK path:
//  *   npm install @google/generative-ai
//  */
// let sdkClient = null;
// try {
//   // Attempt to import SDK (may throw if package not installed)
//   // eslint-disable-next-line import/no-extraneous-dependencies, no-eval
//   const { GoogleGenerativeAI } = await (async () => {
//     try {
//       return await import('@google/generative-ai');
//     } catch (e) {
//       return null;
//     }
//   })();

//   if (GoogleGenerativeAI) {
//     // SDK available — instantiate client
//     // The SDK will use ADC if available; if you have an API key you can pass it to constructor if supported.
//     // Some SDKs accept an API key or rely on ADC; we attempt to pass the key in options if provided.
//     try {
//       sdkClient = new GoogleGenerativeAI({ apiKey: GEMINI_KEY || undefined });
//     } catch (e) {
//       // If instantiation fails, keep sdkClient null and fallback to REST
//       sdkClient = null;
//       console.warn('Gemini SDK present but failed to initialize — will use REST fallback.');
//     }
//   }
// } catch (err) {
//   // ignore: SDK not present
//   sdkClient = null;
// }

// /* -------------------------
//    Helpers: prompt builder
//    ------------------------- */
// function messagesToPrompt(messages) {
//   // Simple conversion: system/user/assistant to labeled blocks.
//   // This is used for both SDK and REST fallbacks.
//   return messages.map(m => `${(m.role || 'user').toUpperCase()}: ${m.content}`).join('\n\n');
// }

// /* -------------------------
//    Helper: call Gemini via SDK (if available)
//    ------------------------- */
// async function callGeminiSdk(messages) {
//   if (!sdkClient) {
//     const e = new Error('Gemini SDK not available');
//     e.isSdkMissing = true;
//     throw e;
//   }

//   // Convert messages to a single prompt text for the SDK generate call.
//   const promptText = messagesToPrompt(messages);

//   // The SDK API differs across releases. We'll attempt a few common shapes.
//   try {
//     // Preferred shape used earlier in examples: getGenerativeModel + generateContent
//     const model = sdkClient.getGenerativeModel
//       ? sdkClient.getGenerativeModel({ model: GEMINI_MODEL })
//       : sdkClient.model?.(GEMINI_MODEL) || sdkClient;

//     // Attempt generateContent if supported
//     if (model && typeof model.generateContent === 'function') {
//       const resp = await model.generateContent({ text: promptText, temperature: 0.2 });
//       // Many SDKs offer a convenient .text() accessor
//       if (resp?.response?.text) return { raw: resp, text: resp.response.text() || resp?.response?.text };
//       if (resp?.response?.content) return { raw: resp, text: resp.response.content?.toString?.() || String(resp.response.content) };
//       // fallback: stringify whole response
//       return { raw: resp, text: String(JSON.stringify(resp)).slice(0, 2000) };
//     }

//     // fallback attempt: generateText or simple generate call
//     if (model && typeof model.generateText === 'function') {
//       const resp = await model.generateText({ prompt: promptText, temperature: 0.2 });
//       if (resp?.candidates && resp.candidates[0]) {
//         const cand = resp.candidates[0];
//         if (cand?.content?.parts) return { raw: resp, text: cand.content.parts.map(p => p.text || '').join('') };
//         if (cand?.output) return { raw: resp, text: cand.output };
//       }
//       if (resp?.output) return { raw: resp, text: resp.output };
//       return { raw: resp, text: String(JSON.stringify(resp)) };
//     }

//     // If SDK exists but we couldn't call the model, throw to let REST fallback try
//     const err = new Error('SDK present but no supported generate method found');
//     err.isSdkUnsupported = true;
//     throw err;
//   } catch (err) {
//     // bubble up
//     throw err;
//   }
// }

// /* -------------------------
//    Helper: call Gemini via REST (fallback)
//    ------------------------- */
// import axios from 'axios';

// async function callGeminiRest(messages) {
//   if (!GEMINI_KEY) {
//     const e = new Error('GEMINI_API_KEY not configured on server');
//     e.isConfig = true;
//     throw e;
//   }

//   // Build a prompt text from messages
//   const promptText = messages.map(m => `${(m.role || 'user').toUpperCase()}: ${m.content}`).join('\n\n');

//   // payload matching the generateContent API shape
//   const payload = {
//     // use contents/parts shape — works with generateContent
//     contents: [{ parts: [{ text: promptText }] }],
//     temperature: 0.2,
//     // maxOutputTokens: 1024
//   };

//   // We'll try each base (v1beta first, then v1beta2) with :generateContent
//   // and log full response/error details for debugging.
//   let lastError = null;
//   for (const base of GEMINI_BASES) {
//     const url = `${base}/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`;
//     try {
//       const r = await axios.post(url, payload, {
//         headers: { 'Content-Type': 'application/json' },
//         timeout: 120000
//       });

//       const data = r.data;
//       // DEBUG: log the modelVersion once for visibility (optional)
//       console.info('Gemini REST success from', url, 'modelVersion=', data?.modelVersion || data?.model || 'unknown');

//       // Robust parse: candidates[].content.parts[].text
//       let assistantText = '';

//       if (Array.isArray(data?.candidates) && data.candidates.length > 0) {
//         const cand = data.candidates[0];
//         // new style: candidate.content.parts
//         if (cand?.content?.parts && Array.isArray(cand.content.parts)) {
//           assistantText = cand.content.parts.map(p => p.text || '').join('');
//         }
//         // alternate: candidate.content is an array of blocks
//         else if (Array.isArray(cand.content)) {
//           assistantText = cand.content.map(c => c?.text || '').join('');
//         }
//         // alternate: candidate.output string
//         else if (typeof cand.output === 'string') {
//           assistantText = cand.output;
//         }
//       }

//       // fallback shapes
//       if (!assistantText && typeof data?.output === 'string') assistantText = data.output;
//       if (!assistantText && data?.generated_text) assistantText = data.generated_text;
//       if (!assistantText && Array.isArray(data?.candidates) && data.candidates[0]?.content) {
//         // try to stringify candidate content
//         const c = data.candidates[0].content;
//         if (typeof c === 'string') assistantText = c;
//         else if (Array.isArray(c)) assistantText = c.map(x => x.text || '').join('');
//       }

//       assistantText = String(assistantText || '').trim();

//       return { raw: data, text: assistantText };
//     } catch (err) {
//       // capture and log helpful info so we can see what the API returned
//       const info = {
//         message: err.message,
//         isAxios: !!err.isAxiosError,
//         status: err.response?.status,
//         statusText: err.response?.statusText,
//         headers: err.response?.headers,
//         data: err.response?.data
//       };
//       console.error('Gemini REST attempt failed for URL:', url, '\n', JSON.stringify(info, null, 2));
//       lastError = info;
//       // continue to next base
//     }
//   }

//   // If we reach here, all attempts failed
//   const wrapper = new Error('All Gemini REST endpoints failed');
//   wrapper.info = lastError;
//   throw wrapper;
// }

// /* -------------------------
//    Main route: POST /api/ai/chat
//    ------------------------- */
// /**
//  * Request body:
//  *   { conversationId?: string, message: string, title?: string }
//  *
//  * Response:
//  *   200: { conversationId, assistant, conversation }
//  */
// router.post('/chat', auth, async (req, res) => {
//   try {
//     const userId = req.userId;
//     const { conversationId, message, title } = req.body || {};

//     if (!message || typeof message !== 'string') return res.status(400).json({ message: 'message required' });

//     // Load or create conversation
//     let conversation;
//     if (conversationId) {
//       conversation = await Conversation.findById(conversationId);
//       if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
//       if (String(conversation.user) !== String(userId)) return res.status(403).json({ message: 'Not your conversation' });
//     } else {
//       conversation = new Conversation({ user: userId, title: title || 'Study Plan', messages: [] });
//     }

//     // System prompt instructing academic persona
//     const systemPrompt = `You are StudyBuddy — a friendly, enthusiastic, technically grounded study planner assistant.
// Focus on academic study topics (programming, algorithms, data structures, interview prep, machine learning, math). Provide structured study plans, step-by-step guidance, estimated time, and practice recommendations.`;

//     // Build messages array to pass to the model (system + last history + new user message)
//     const messagesForModel = [
//       { role: 'system', content: systemPrompt },
//       ...conversation.messages.slice(-12).map(m => ({ role: m.role, content: m.content })),
//       { role: 'user', content: message }
//     ];

//     // Save user message immediately
//     conversation.messages.push({ role: 'user', content: message });
//     await conversation.save();

//     // Call model (prefer SDK, fallback to REST)
//     let modelResp;
//     try {
//       if (sdkClient) {
//         modelResp = await callGeminiSdk(messagesForModel);
//       } else {
//         modelResp = await callGeminiRest(messagesForModel);
//       }
//     } catch (err) {
//       // return detailed error for debugging (non-sensitive)
//       console.error('Gemini call error:', err?.info || err?.message || err);
//       // if configuration error, return 500 with message
//       if (err?.isConfig) return res.status(500).json({ message: err.message });
//       return res.status(502).json({ message: 'Gemini API request failed', details: err?.info || err?.message || 'See server logs' });
//     }

//     const assistantText = modelResp?.text || 'Sorry, I could not produce a response.';
//     conversation.messages.push({ role: 'assistant', content: assistantText });
//     await conversation.save();

//     return res.json({ conversationId: conversation._id, assistant: assistantText, conversation });
//   } catch (err) {
//     console.error('POST /api/ai/chat error:', err?.message || err);
//     return res.status(500).json({ message: 'AI chat failed', details: err?.message || String(err) });
//   }
// });

// /* -------------------------
//    Conversations endpoints (list/get/rename/delete)
//    ------------------------- */

// router.get('/conversations', auth, async (req, res) => {
//   try {
//     const conversations = await Conversation.find({ user: req.userId }).sort({ updatedAt: -1 }).lean();
//     return res.json(conversations);
//   } catch (err) {
//     console.error('GET /api/ai/conversations error', err);
//     return res.status(500).json({ message: 'Failed to list conversations' });
//   }
// });

// router.get('/conversations/:id', auth, async (req, res) => {
//   try {
//     const conv = await Conversation.findById(req.params.id).lean();
//     if (!conv || String(conv.user) !== String(req.userId)) return res.status(404).json({ message: 'Not found' });
//     return res.json(conv);
//   } catch (err) {
//     console.error('GET /api/ai/conversations/:id error', err);
//     return res.status(500).json({ message: 'Failed to load conversation' });
//   }
// });

// router.post('/conversations/:id/title', auth, async (req, res) => {
//   try {
//     const conv = await Conversation.findById(req.params.id);
//     if (!conv || String(conv.user) !== String(req.userId)) return res.status(404).json({ message: 'Not found' });
//     conv.title = req.body.title || conv.title;
//     await conv.save();
//     return res.json(conv);
//   } catch (err) {
//     console.error('POST /api/ai/conversations/:id/title error', err);
//     return res.status(500).json({ message: 'Failed to rename' });
//   }
// });

// router.delete('/conversations/:id', auth, async (req, res) => {
//   try {
//     const conv = await Conversation.findById(req.params.id);
//     if (!conv || String(conv.user) !== String(req.userId)) return res.status(404).json({ message: 'Not found' });
//     await conv.remove();
//     return res.json({ success: true });
//   } catch (err) {
//     console.error('DELETE /api/ai/conversations/:id error', err);
//     return res.status(500).json({ message: 'Failed to delete' });
//   }
// });

// export default router;

// backend/src/routes/ai.js
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import Conversation from '../models/Conversation.js';
import auth from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

/* -------------------------
   Config (from .env)
   ------------------------- */
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'; // set to exact model name from models list
const GEMINI_BASES = [
  process.env.GEMINI_BASE || 'https://generativelanguage.googleapis.com/v1'
  // 'https://generativelanguage.googleapis.com/v1beta2'
];

/* -------------------------
   SDK init (lazy/dynamic)
   ------------------------- */
let sdkClient = null;
let sdkInitTried = false;

async function initSdkIfAvailable() {
  if (sdkInitTried) return sdkClient;
  sdkInitTried = true;

  try {
    let mod = null;
    try {
      // prefer official package name
      mod = await import('@google/generative-ai');
    } catch (e1) {
      try {
        // alternative package name if present
        mod = await import('@google-ai/generative-ai');
      } catch (e2) {
        mod = null;
      }
    }

    if (!mod) {
      console.info('[Gemini SDK] not installed — REST fallback will be used.');
      sdkClient = null;
      return sdkClient;
    }

    // Attempt to discover an exported client class / factory
    const GoogleGen = mod.GoogleGenerativeAI || mod.GoogleGenerativeAIClient || mod.default || null;

    if (GoogleGen) {
      try {
        // Try to construct client; some SDK builds accept { apiKey }
        sdkClient = new GoogleGen({ apiKey: GEMINI_KEY || undefined });
        console.info('[Gemini SDK] Initialized SDK client.');
        return sdkClient;
      } catch (err1) {
        try {
          // fallback: try calling default export as factory
          sdkClient = await (mod.default ? mod.default({ apiKey: GEMINI_KEY || undefined }) : null);
          console.info('[Gemini SDK] Initialized SDK client (fallback).');
          return sdkClient;
        } catch (err2) {
          console.warn('[Gemini SDK] SDK present but failed to instantiate, falling back to REST.', err2?.message || err2);
          sdkClient = null;
          return sdkClient;
        }
      }
    }

    console.info('[Gemini SDK] Module loaded but no usable export found — using REST fallback.');
    sdkClient = null;
    return sdkClient;
  } catch (err) {
    console.info('[Gemini SDK] dynamic import error — using REST fallback.', err?.message || err);
    sdkClient = null;
    return sdkClient;
  }
}

/* -------------------------
   Prompt builder
   ------------------------- */
function messagesToPrompt(messages) {
  return messages.map(m => `${(m.role || 'user').toUpperCase()}: ${m.content}`).join('\n\n');
}

/* -------------------------
   Gemini via SDK (preferred)
   ------------------------- */
async function callGeminiSdk(messages) {
  await initSdkIfAvailable();
  if (!sdkClient) {
    const e = new Error('Gemini SDK not available');
    e.isSdkMissing = true;
    throw e;
  }

  const promptText = messagesToPrompt(messages);

  try {
    // Try a few common SDK shapes defensively
    if (typeof sdkClient.getGenerativeModel === 'function') {
      const model = sdkClient.getGenerativeModel({ model: GEMINI_MODEL });
      if (model && typeof model.generateContent === 'function') {
        const resp = await model.generateContent({ text: promptText, temperature: 0.2 });
        if (resp?.response?.text) return { raw: resp, text: resp.response.text() || String(resp.response.text) };
        if (resp?.response?.content) {
          if (typeof resp.response.content === 'string') return { raw: resp, text: resp.response.content };
          return { raw: resp, text: resp.response.content?.toString?.() || JSON.stringify(resp.response.content) };
        }
        return { raw: resp, text: String(JSON.stringify(resp)).slice(0, 2000) };
      }
    }

    if (typeof sdkClient.generateContent === 'function') {
      const resp = await sdkClient.generateContent({ model: GEMINI_MODEL, text: promptText, temperature: 0.2 });
      if (resp?.response?.text) return { raw: resp, text: resp.response.text() };
      if (resp?.candidates && resp.candidates[0]) {
        const cand = resp.candidates[0];
        if (cand?.content?.parts) return { raw: resp, text: cand.content.parts.map(p => p.text || '').join('') };
        if (cand?.output) return { raw: resp, text: cand.output };
      }
      return { raw: resp, text: String(JSON.stringify(resp)) };
    }

    if (typeof sdkClient.generateText === 'function') {
      const resp = await sdkClient.generateText({ model: GEMINI_MODEL, prompt: promptText, temperature: 0.2 });
      if (resp?.candidates && resp.candidates[0]) {
        const cand = resp.candidates[0];
        if (cand?.content?.parts) return { raw: resp, text: cand.content.parts.map(p => p.text || '').join('') };
        if (cand?.output) return { raw: resp, text: cand.output };
      }
      if (resp?.output) return { raw: resp, text: resp.output };
      return { raw: resp, text: String(JSON.stringify(resp)) };
    }

    const err = new Error('SDK present but no supported generate method found');
    err.isSdkUnsupported = true;
    throw err;
  } catch (err) {
    // Re-throw for caller to decide fallback
    throw err;
  }
}

/* -------------------------
   Gemini via REST fallback
   ------------------------- */
async function callGeminiRest(messages) {
  if (!GEMINI_KEY) {
    const e = new Error('GEMINI_API_KEY not configured on server');
    e.isConfig = true;
    throw e;
  }

  const promptText = messagesToPrompt(messages);
  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: promptText }]
      }
    ],
    generationConfig: { temperature: 0.2 }
  };

  let lastError = null;

  for (const base of GEMINI_BASES) {
    // Keep model slashes intact — do NOT encode slashes in model path
    const rawUrl = `${base}/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`;
    const url = encodeURI(rawUrl);

    console.info('[Gemini REST] Trying URL:', url);

    try {
      const resp = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' }, timeout: 120000 });
      const data = resp.data;
      console.info('[Gemini REST] Success from', url, 'modelVersion=', data?.modelVersion || data?.model || 'unknown');

      // Parse likely response shapes
      let assistantText = '';

      if (Array.isArray(data?.candidates) && data.candidates.length > 0) {
        const cand = data.candidates[0];
        if (cand?.content?.parts && Array.isArray(cand.content.parts)) {
          assistantText = cand.content.parts.map(p => p.text || '').join('');
        } else if (Array.isArray(cand.content)) {
          assistantText = cand.content.map(c => c?.text || '').join('');
        } else if (typeof cand.output === 'string') {
          assistantText = cand.output;
        }
      }

      if (!assistantText && typeof data?.output === 'string') assistantText = data.output;
      if (!assistantText && data?.generated_text) assistantText = data.generated_text;
      if (!assistantText && Array.isArray(data?.candidates) && data.candidates[0]?.content) {
        const c = data.candidates[0].content;
        if (typeof c === 'string') assistantText = c;
        else if (Array.isArray(c)) assistantText = c.map(x => x.text || '').join('');
      }

      assistantText = String(assistantText || '').trim();
      return { raw: data, text: assistantText };
    } catch (err) {
      const info = {
        message: err.message,
        isAxios: !!err.isAxiosError,
        status: err.response?.status,
        statusText: err.response?.statusText,
        headers: err.response?.headers,
        data: err.response?.data
      };
      console.error('[Gemini REST] attempt failed for URL:', url, '\n', JSON.stringify(info, null, 2));
      lastError = info;
      // try next base
    }
  }

  const wrapper = new Error('All Gemini REST endpoints failed');
  wrapper.info = lastError;
  throw wrapper;
}

/* -------------------------
   POST /api/ai/chat
   - Body: { conversationId?: string, message: string, title?: string }
   - Auth required (auth middleware should set req.userId)
   ------------------------- */
router.post('/chat', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId, message, title } = req.body || {};

    if (!message || typeof message !== 'string') return res.status(400).json({ message: 'message required' });

    // load or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
      if (String(conversation.user) !== String(userId)) return res.status(403).json({ message: 'Not your conversation' });
    } else {
      conversation = new Conversation({ user: userId, title: title || 'Study Plan', messages: [] });
    }

    const systemPrompt = `You are StudyBuddy — a friendly, enthusiastic, technically grounded study planner assistant.
Focus on academic study topics (programming, algorithms, data structures, interview prep, machine learning, math). Provide structured study plans, step-by-step guidance, estimated time, and practice recommendations.`;

    const messagesForModel = [
      { role: 'system', content: systemPrompt },
      ...conversation.messages.slice(-12).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    // persist user message
    conversation.messages.push({ role: 'user', content: message });
    await conversation.save();

    // call model (SDK preferred, fallback to REST)
    let modelResp;
    try {
      try {
        modelResp = await callGeminiSdk(messagesForModel);
      } catch (sdkErr) {
        if (sdkErr?.isSdkMissing || sdkErr?.isSdkUnsupported || !sdkClient) {
          console.info('[AI] SDK unavailable/unsupported, falling back to REST:', sdkErr?.message || sdkErr);
          modelResp = await callGeminiRest(messagesForModel);
        } else {
          throw sdkErr;
        }
      }
    } catch (err) {
      console.error('[AI] Gemini call error:', err?.info || err?.message || err);
      if (err?.isConfig) return res.status(500).json({ message: err.message });
      return res.status(502).json({ message: 'Gemini API request failed', details: err?.info || err?.message || 'See server logs' });
    }

    const assistantText = modelResp?.text || 'Sorry, I could not produce a response.';
    conversation.messages.push({ role: 'assistant', content: assistantText });
    await conversation.save();

    return res.json({ conversationId: conversation._id, assistant: assistantText, conversation });
  } catch (err) {
    console.error('[AI] POST /api/ai/chat error:', err?.message || err);
    return res.status(500).json({ message: 'AI chat failed', details: err?.message || String(err) });
  }
});

/* -------------------------
   Conversation management routes
   ------------------------- */
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({ user: req.userId }).sort({ updatedAt: -1 }).lean();
    return res.json(conversations);
  } catch (err) {
    console.error('[AI] GET /conversations error:', err);
    return res.status(500).json({ message: 'Failed to list conversations' });
  }
});

router.get('/conversations/:id', auth, async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id).lean();
    if (!conv || String(conv.user) !== String(req.userId)) return res.status(404).json({ message: 'Not found' });
    return res.json(conv);
  } catch (err) {
    console.error('[AI] GET /conversations/:id error:', err);
    return res.status(500).json({ message: 'Failed to load conversation' });
  }
});

// Update conversation title (PATCH method for better REST semantics)
router.patch('/conversations/:id', auth, async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv || String(conv.user) !== String(req.userId)) return res.status(404).json({ message: 'Not found' });
    
    if (req.body.title) {
      conv.title = req.body.title;
      await conv.save();
    }
    
    return res.json(conv);
  } catch (err) {
    console.error('[AI] PATCH /conversations/:id error:', err);
    return res.status(500).json({ message: 'Failed to update conversation' });
  }
});

router.delete('/conversations/:id', auth, async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv || String(conv.user) !== String(req.userId)) return res.status(404).json({ message: 'Not found' });
    await conv.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    console.error('[AI] DELETE /conversations/:id error:', err);
    return res.status(500).json({ message: 'Failed to delete' });
  }
});

// Notes endpoints
router.get('/notes', auth, async (req, res) => {
  try {
    // For simplicity, we'll store notes in a separate collection or as a special conversation
    // Let's use a simple approach with a special conversation type
    let notesConv = await Conversation.findOne({ 
      user: req.userId, 
      title: '__USER_NOTES__' 
    }).lean();
    
    if (!notesConv) {
      return res.json({ content: '' });
    }
    
    // Get the latest message content as notes
    const lastMessage = notesConv.messages[notesConv.messages.length - 1];
    return res.json({ content: lastMessage?.content || '' });
  } catch (err) {
    console.error('[AI] GET /notes error:', err);
    return res.status(500).json({ message: 'Failed to load notes' });
  }
});

router.post('/notes', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    let notesConv = await Conversation.findOne({ 
      user: req.userId, 
      title: '__USER_NOTES__' 
    });
    
    if (!notesConv) {
      notesConv = new Conversation({
        user: req.userId,
        title: '__USER_NOTES__',
        messages: []
      });
    }
    
    // Replace or add the notes content
    notesConv.messages = [{ role: 'user', content: content || '' }];
    await notesConv.save();
    
    return res.json({ success: true, content });
  } catch (err) {
    console.error('[AI] POST /notes error:', err);
    return res.status(500).json({ message: 'Failed to save notes' });
  }
});

export default router;
