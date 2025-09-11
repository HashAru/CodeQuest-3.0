// // backend/src/routes/ide.js
// import express from 'express';
// import axios from 'axios';
// import dotenv from 'dotenv';
// dotenv.config();

// const router = express.Router();

// // Configure these via .env
// // JUDGE0_URL example: https://ce.judge0.com
// // or RapidAPI endpoint, or your self-hosted Judge0 base URL
// const JUDGE0_URL = process.env.JUDGE0_URL || 'https://ce.judge0.com'; // change if needed
// const JUDGE0_KEY = process.env.JUDGE0_KEY || ''; // optional: if your Judge0 requires an API key

// const judgeAxios = axios.create({
//   baseURL: JUDGE0_URL,
//   headers: JUDGE0_KEY ? { 'X-Auth-Token': JUDGE0_KEY } : {}
// });

// // Helper: base64 encode safely
// const toBase64 = (s) => Buffer.from(s || '', 'utf8').toString('base64');

// // GET /api/ide/languages
// // Proxy languages list so frontend can display options
// router.get('/languages', async (req, res) => {
//   try {
//     const q = '?base64_encoded=false'; // languages are simple JSON
//     const r = await judgeAxios.get(`/languages${q}`);
//     // response usually contains array of objects { id, name, ... }
//     res.json(r.data);
//   } catch (err) {
//     console.error('GET /api/ide/languages error', err?.response?.data || err.message);
//     res.status(500).json({ message: 'Failed to fetch languages' });
//   }
// });

// // POST /api/ide/run
// // Body: { language_id: number, source: string, stdin?: string, options?: { wait?: boolean } }
// // This uses base64 encoding and wait=true to return result in one response if Judge0 supports it
// router.post('/run', async (req, res) => {
//   try {
//     const { language_id, source, stdin, options } = req.body || {};
//     if (!language_id || !source) return res.status(400).json({ message: 'language_id and source are required' });

//     const wait = options?.wait !== undefined ? !!options.wait : true; // default true for simplicity

//     const payload = {
//       language_id,
//       source_code: toBase64(source),
//       stdin: toBase64(stdin || ''),
//       // You can add more fields: expected_output, compile_timeout, run_timeout, etc.
//     };

//     const query = `?base64_encoded=true&wait=${wait}`;
//     const r = await judgeAxios.post(`/submissions/${query}`, payload, {
//       headers: { 'Content-Type': 'application/json' }
//     });

//     // r.data contains fields like stdout, stderr, compile_output, status, time, memory, token (if wait=false)
//     res.json(r.data);
//   } catch (err) {
//     console.error('POST /api/ide/run error', err?.response?.data || err.message);
//     // Judge0 may reply with detailed error JSON in err.response.data
//     const body = err?.response?.data || { message: err.message || 'Execution error' };
//     res.status(500).json(body);
//   }
// });

// export default router;

// backend/src/routes/ide.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// ENV variables you must set:
// RAPIDAPI_KEY -> your RapidAPI key
// RAPIDAPI_HOST -> the RapidAPI host string (e.g. judge0-ce.p.rapidapi.com)
// JUDGE0_BASE  -> optional full base URL (overrides RAPIDAPI_HOST), e.g. https://judge0-ce.p.rapidapi.com

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;
const JUDGE0_BASE = process.env.JUDGE0_BASE || (RAPIDAPI_HOST ? `https://${RAPIDAPI_HOST}` : null);

if (!JUDGE0_BASE) {
  console.warn('Warning: JUDGE0_BASE/RAPIDAPI_HOST not configured. Set RAPIDAPI_HOST or JUDGE0_BASE in .env');
}
if (!RAPIDAPI_KEY) {
  console.warn('Warning: RAPIDAPI_KEY not configured. Set RAPIDAPI_KEY in .env');
}

const axiosClient = axios.create({
  baseURL: JUDGE0_BASE || 'https://judge0-ce.p.rapidapi.com',
  headers: {
    'Content-Type': 'application/json',
    // RapidAPI requires these headers for the endpoint
    ...(RAPIDAPI_KEY ? { 'X-RapidAPI-Key': RAPIDAPI_KEY } : {}),
    ...(RAPIDAPI_HOST ? { 'X-RapidAPI-Host': RAPIDAPI_HOST } : {})
  },
  timeout: 60000
});

// helper to base64-encode a UTF-8 string
const toBase64 = (s = '') => Buffer.from(String(s), 'utf8').toString('base64');

// GET /api/ide/languages
// returns the list of supported languages from Judge0
router.get('/languages', async (req, res) => {
  try {
    // RapidAPI/Judge0 languages endpoint (no base64 param needed)
    const r = await axiosClient.get('/languages');
    return res.json(r.data);
  } catch (err) {
    console.error('GET /api/ide/languages error:', err?.response?.data || err.message);
    return res.status(500).json({ message: 'Failed to fetch languages', details: err?.response?.data || err.message });
  }
});

// POST /api/ide/run
// body: { language_id: number, source: string, stdin?: string, options?: { wait?: boolean } }
// If options.wait is true (default) the handler requests wait=true so Judge0 returns result in one response.
// If options.wait is false the handler will create a submission (wait=false) and return the token to the client.
router.post('/run', async (req, res) => {
  try {
    const { language_id, source, stdin = '', options = {} } = req.body || {};
    if (!language_id || !source) return res.status(400).json({ message: 'language_id and source are required' });

    const wait = options.wait === undefined ? true : Boolean(options.wait);

    // Judge0 expects base64 when base64_encoded=true
    const payload = {
      language_id: Number(language_id),
      source_code: toBase64(source),
      stdin: toBase64(stdin)
    };

    // include other optional fields if needed:
    // payload.expected_output = toBase64(expectedOutput)
    // payload.cpu_time_limit, etc.

    const query = `?base64_encoded=true&wait=${wait ? 'true' : 'false'}`;

    const response = await axiosClient.post(`/submissions/${query}`, payload);

    // When wait=true, response.data contains result fields (stdout, stderr, status, time, memory)
    // When wait=false, response.data contains { token: '...' }
    return res.json(response.data);
  } catch (err) {
    // axios error might have useful response data
    console.error('POST /api/ide/run error:', err?.response?.data || err.message);
    const details = err?.response?.data || { message: err.message || 'Execution error' };
    // Return 502 for upstream errors to indicate proxying issue
    return res.status(502).json({ message: 'Judge0 execution failed', details });
  }
});

export default router;
