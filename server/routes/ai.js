// server/routes/aiRouter.js
// Updated router: local Qwen 2.5 Coder 3B (Ollama) with Groq fallback (llama-3.1-8b then 70b)
// Requires: npm install ollama node-fetch dotenv

const express = require('express');
const router = express.Router();
const { Ollama } = require('ollama');
const fetch = require('node-fetch'); // for Groq fallback
require('dotenv').config(); // ensure .env is loaded

// Initialize Ollama client
const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
  requestTimeout: 60000 // 60s default request timeout for Ollama SDK
});

// Groq configuration (fallback)
const GROQ_API_KEY = process.env.GROQ_API_KEY || null;
//const GROQ_ENDPOINT = 'https://api.groq.com/v1/chat/completions'; // generic path; adjust if Groq provides different endpoint in future
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
//const GROQ_ENDPOINT = 'https://api.groq.com/v1';

// Small utility constants
// Prefer codemindai-gemma:latest if available locally; fallback to prior gemma name
const DEFAULT_LOCAL_PRIMARY = 'codemindai-gemma:latest';
const DEFAULT_LOCAL_FALLBACK = 'codegemma:2b';
const GROQ_PRIMARY = 'llama-3.1-8b-instant';
const GROQ_SECONDARY = 'llama-3.1-70b-versatile';

const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds for higher-level requests

// Basic fallback suggestions if everything fails
const FALLBACK_RESPONSES = [
  "// Suggestion: break function into smaller functions for clarity.",
  "// Suggestion: add basic input validation for this function.",
  "// Suggestion: consider early returns to reduce nesting.",
  "// Suggestion: add try/catch to improve error handling.",
  "// Suggestion: improve naming for readability."
];

function getFallbackResponse() {
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

/**
 * Utility: sleep for ms
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Utility: run a Promise with a timeout
 */
function withTimeout(promise, ms, timeoutMessage = 'Request timed out') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(timeoutMessage)), ms))
  ]);
}

/**
 * Utility: extract code-only content from AI message.
 * Preferred behavior:
 * 1. If there are triple-backtick code blocks, return their contents concatenated.
 * 2. Otherwise, remove lines starting with //, #, /*, or ``` and return what's left.
 * 3. If the result is empty, return the original content as fallback.
 */
function extractCodeOnly(aiText) {
  if (!aiText || typeof aiText !== 'string') return '';

  // Find all ``` blocks (support ```lang and ``` with no lang)
  const codeBlockRegex = /```(?:[\w-]+)?\n?([\s\S]*?)```/g;
  const codeBlocks = [];
  let match;
  while ((match = codeBlockRegex.exec(aiText)) !== null) {
    codeBlocks.push(match[1].trim());
  }
  if (codeBlocks.length > 0) {
    return codeBlocks.join('\n\n');
  }

  // If no fences, remove explanation lines and keep likely code lines
  const lines = aiText.split('\n');
  const filtered = lines.filter(line => {
    const t = line.trim();
    if (!t) return false;
    if (t.startsWith('//') || t.startsWith('#') || t.startsWith('/*') || t.startsWith('*') || t.startsWith('```')) return false;
    // we keep typical code lines, including lines ending with ; or { or }
    // keep lines with parentheses (function calls), "const" "let" "var" "function", "class", import/export, return
    const likelyCodeKeywords = ['const ', 'let ', 'var ', 'function ', 'class ', 'import ', 'export ', 'return ', '=>', ';', '{', '}', 'console.', 'if(', 'if (', 'for(', 'for (', 'while(', 'try{', 'try {'];
    return likelyCodeKeywords.some(k => t.includes(k)) || /[;{}()=<>]/.test(t);
  });

  const joined = filtered.join('\n').trim();
  if (joined.length > 0) return joined;

  // As last resort return original cleaned (but not comments)
  return lines.filter(l => l.trim() !== '' && !l.trim().startsWith('```')).join('\n').trim() || aiText.trim();
}

/**
 * Helper: Run a chat completion on local Ollama using provided model and messages.
 * Returns parsed response object or throws.
 */
async function callLocalOllama(model, messages = [], options = {}) {

  // ---- CodeGemma requires instruction-style prompt ----
  if (model.startsWith('codemindai-gemma') || model.startsWith('codegemma')) {
    const prompt = messages.map(m => m.content).join('\n\n');

    console.log('[CODEGEMMA PROMPT]');
    console.log(prompt.slice(0, 500));

    const response = await ollama.generate({
      model,
      prompt,
      options
    });

    return {
      message: {
        content: response.message?.content || ''
      }
    };
  }

  // ---- Other models (Qwen / Groq) use chat ----
  return await ollama.chat({
    model,
    messages,
    stream: false,
    options
  });
}



/**
 * Helper: Call Groq Chat Completion API as fallback.
 * Note: We assume the Groq endpoint accepts similar chat schema. Adjust if Groq changes API.
 */
async function callGroq(model, messages = [], options = {}) {
  if (!GROQ_API_KEY) {
    throw new Error('No Groq API key configured (GROQ_API_KEY not set).');
  }

  // Create a Groq-style chat payload (approximate)
  const payload = {
    model,
    messages: messages.map(m => {
      // Groq expects roles too; keep same schema
      return { role: m.role, content: m.content };
    }),
    max_tokens: options.max_tokens || 512,
    temperature: options.temperature !== undefined ? options.temperature : 0.2,
    top_p: options.top_p !== undefined ? options.top_p : 0.95
  };

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    timeout: options.requestTimeout || 30000
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error: ${res.status} ${res.statusText} - ${text}`);
  }

  const json = await res.json();
  // Normalize: many chat APIs return choices[0].message.content
  const content = json.choices && json.choices[0] && (json.choices[0].message?.content || json.choices[0].text) ?
    (json.choices[0].message?.content || json.choices[0].text) :
    (json.output?.[0]?.content?.[0]?.text || JSON.stringify(json));
  return { message: { content } , raw: json };
}

/**
 * Decide which local model to use based on installed models.
 * Priority:
 *  1) codemindai-gemma
 *  2) codegemma:2b
 *  3) qwen2.5:3b
 *  4) fallback to model param
 */
async function selectLocalModel(preferred = DEFAULT_LOCAL_PRIMARY) {
  try {
    const listed = (await ollama.list()).models || [];
    const names = listed.map(m => m.name || m);
    // Prefer 'codemindai-gemma:latest' if present (common naming), then older internal names
    if (names.includes('codemindai-gemma:latest')) return 'codemindai-gemma:latest';
    //if (names.includes('codemindai-gemma')) return 'codemindai-gemma';
    if (names.includes('codegemma:2b')) return 'codegemma:2b';
    if (names.includes('qwen2.5:3b')) return 'qwen2.5:3b';
    // If nothing found, just return preferred (attempt to run may trigger download)
    return preferred;
  } catch (err) {
    // If ollama.list fails, still return preferred to try
    return preferred;
  }
}

/**
 * High-level inference: Try local -> local fallback -> Groq 8b -> Groq 70b
 * messages: array of {role, content}
 * options: { timeoutMs, num_predict, temperature, top_p, max_tokens }
 */
async function generateWithFallback(messages = [], options = {}) {
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;

  // Prepare models to attempt in order
  const localPrimary = await selectLocalModel(DEFAULT_LOCAL_PRIMARY);
  const localFallback = DEFAULT_LOCAL_FALLBACK;

  const attemptLocal = async (modelToUse) => {
    try {
      const response = await callLocalOllama(modelToUse, messages, {
        num_predict: options.num_predict || 200,
        temperature: options.temperature !== undefined ? options.temperature : 0.2,
        top_p: options.top_p !== undefined ? options.top_p : 0.95,
        top_k: options.top_k !== undefined ? options.top_k : 40
      });
      // Standardize return
      return { source: 'local', model: modelToUse, response };
    } catch (e) {
      // bubble up to the caller; they will try next fallback
      throw e;
    }
  };

  // Try primary local model
  try {
    const resp = await withTimeout(attemptLocal(localPrimary), timeoutMs, `Local model ${localPrimary} timed out after ${timeoutMs}ms`);
    return resp;
  } catch (localPrimaryErr) {
    // try local fallback
    try {
      const resp = await withTimeout(attemptLocal(localFallback), timeoutMs, `Local fallback ${localFallback} timed out`);
      return resp;
    } catch (localFallbackErr) {
      // local failed; try Groq fallback chain
      // If no Groq key, fail here
      if (!GROQ_API_KEY) {
        throw new Error(`Local models failed: ${localPrimaryErr.message}; ${localFallbackErr.message}. No Groq API key configured for cloud fallback.`);
      }

      // Try Groq 8B then 70B
      try {
        const groqResp = await withTimeout(callGroq(GROQ_PRIMARY, messages, options), timeoutMs, `Groq ${GROQ_PRIMARY} timed out`);
        return { source: 'groq', model: GROQ_PRIMARY, response: groqResp };
      } catch (g8Err) {
        try {
          const groqResp2 = await withTimeout(callGroq(GROQ_SECONDARY, messages, options), timeoutMs * 2, `Groq ${GROQ_SECONDARY} timed out`);
          return { source: 'groq', model: GROQ_SECONDARY, response: groqResp2 };
        } catch (g70Err) {
          // All fail
          throw new Error(`All model attempts failed. Local errors: ${localPrimaryErr.message}; ${localFallbackErr.message}. Groq errors: ${g8Err?.message || '8B unknown'}; ${g70Err?.message || '70B unknown'}`);
        }
      }
    }
  }
}

/* ---------------------------
   ROUTES
   ---------------------------*/

/**
 * POST /api/ai/complete
 * Expects: { code: string }
 * Returns: { suggestion: string }
 *
 * This endpoint will:
 * - create a short chat prompt telling the model to respond only with code
 * - call local Qwen model with fallback to Groq
 * - clean the response to return code-only text
 */
router.post('/complete', async (req, res) => {
  const { code } = req.body;
  console.log('[/complete] Request received. Code size:', code ? code.length : 0);

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'No code provided in request body.' });
  }

  const systemPrompt = 'You are a helpful coding assistant. Respond only with the completed or improved code, no explanations.';
  const userPrompt = `Complete or improve the following code. Respond with code only (use code blocks if possible):\n\n${code}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  try {
    const result = await generateWithFallback(messages, { timeoutMs: 120000, num_predict: 200, temperature: 0.2 });
    // Extract content text (different shapes for local/groq)
    let rawContent = '';
    if (result.source === 'local') {
      rawContent = result.response.message?.content || result.response.output?.[0]?.content?.[0]?.text || JSON.stringify(result.response);
    } else if (result.source === 'groq') {
      rawContent = result.response.message?.content || result.response.raw?.choices?.[0]?.text || JSON.stringify(result.response.raw);
    } else {
      rawContent = JSON.stringify(result.response);
    }

    const codeOnly = extractCodeOnly(rawContent);

    // If after extraction nothing useful, use fallback suggestion
    const suggestion = codeOnly && codeOnly.length > 5 ? codeOnly : getFallbackResponse();

    return res.json({ suggestion });
  } catch (err) {
    console.error('[complete] Error:', err);
    return res.status(500).json({
      error: 'Failed to get AI completion. Check Ollama and Groq configuration.',
      details: err.message,
      suggestion: getFallbackResponse()
    });
  }
});

/**
 * POST /api/ai/analyze-repo
 * Expects: { files: [{ path, content, language, size, updated_at, created_at }], owner: string, repo: string }
 * Returns: { success, analysis, metadata }
 *
 * This endpoint builds a long analysis prompt and requests a repository analysis.
 * It attempts local model first, then Groq fallback. Because repo analysis can be large,
 * we use longer timeouts and max tokens.
 */
router.post('/analyze-repo', async (req, res) => {
  const { files = [], owner = 'unknown', repo = 'unknown' } = req.body;

  if (!Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'No files provided for analysis' });
  }

  try {
    console.log(`[analyze-repo] Analyzing ${owner}/${repo}. Files: ${files.length}`);

    // Build fileStructure summary
    const fileStructure = files.map(f => ({ path: f.path, language: f.language || 'unknown', size: f.size || 0 }));
    const packageFiles = {
      'package.json': files.find(f => f.path.endsWith('package.json')),
      'requirements.txt': files.find(f => f.path.endsWith('requirements.txt')),
      'pom.xml': files.find(f => f.path.endsWith('pom.xml')),
      'build.gradle': files.find(f => f.path.endsWith('build.gradle')),
      'composer.json': files.find(f => f.path.endsWith('composer.json')),
      'Gemfile': files.find(f => f.path.endsWith('Gemfile')),
      'Cargo.toml': files.find(f => f.path.endsWith('Cargo.toml'))
    };

    const getDependencies = (file) => {
      if (!file || !file.content) return [];
      try {
        if (file.path.endsWith('package.json')) {
          const pkg = JSON.parse(file.content);
          return Object.entries({
            ...(pkg.dependencies || {}),
            ...(pkg.devDependencies || {})
          }).map(([name, version]) => ({ name, version }));
        }
      } catch (e) {
        console.warn(`[analyze-repo] Error parsing ${file.path}:`, e.message);
      }
      return [];
    };

    const allDependencies = [];
    Object.values(packageFiles).forEach(file => {
      if (file) allDependencies.push(...getDependencies(file));
    });

    const fileTypes = files.reduce((acc, file) => {
      const extParts = (file.path || '').split('.');
      const ext = extParts.length > 1 ? extParts.pop() : 'other';
      if (!acc[ext]) acc[ext] = [];
      acc[ext].push(file);
      return acc;
    }, {});

    // directory structure (shallow)
    const dirStructure = {};
    files.forEach(file => {
      const parts = (file.path || '').split('/');
      let current = dirStructure;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1;
        if (!current[part]) {
          current[part] = isFile ? { _type: 'file', path: file.path, language: file.language, size: file.size } : { _type: 'dir' };
        }
        if (!isFile) {
          current = current[part];
        }
      }
    });

    // Entry points heuristic
    const entryPoints = files.filter(file => /(src\/index|app\/main|src\/main|src\/app)/.test(file.path) || ['main.js','app.js','index.js','server.js'].some(n => file.path.endsWith(n))).slice(0, 6);
    const testFiles = files.filter(file => file.path.includes('test/') || file.path.includes('__tests__') || file.path.endsWith('.test.js') || file.path.endsWith('.spec.js')).slice(0, 8);
    const configFiles = files.filter(file => file.path.match(/\.(json|yaml|yml|toml|env|config|conf|rc)$/) || file.path.match(/(package\.json|webpack\.config|babel\.config|tsconfig\.json|jest\.config)/)).slice(0, 8);
    const docFiles = files.filter(file => file.path.match(/(README|CONTRIBUTING|LICENSE|CHANGELOG|CODE_OF_CONDUCT)/i)).slice(0, 6);

    // Prepare a summary prompt (trim large fields)
    const totalSizeKb = (files.reduce((sum, f) => sum + (f.size || 0), 0) / 1024).toFixed(2);
    const typesSummary = Object.entries(fileTypes).sort((a,b) => b[1].length - a[1].length).map(([ext, arr]) => `${ext} (${arr.length})`).join(', ');

    const truncatedDir = JSON.stringify(dirStructure, null, 2).slice(0, 2000); // keep within prompt size

    const analysisPrompt = `# Repository analysis request: ${owner}/${repo}

Total files: ${files.length}
Total size: ${totalSizeKb} KB
File types: ${typesSummary}
Top-level directories: ${[...new Set(files.map(f => f.path.split('/')[0]))].slice(0,10).join(', ')}

Directory structure snapshot:
\`\`\`json
${truncatedDir}
\`\`\`

Dependencies (${allDependencies.length}):
${allDependencies.length > 0 ? allDependencies.map(d => `- ${d.name} ${d.version}`).join('\n') : 'No package files parsed.'}

Entry points:
${entryPoints.length > 0 ? entryPoints.map(e => `- ${e.path}`).join('\n') : 'None found'}

Tests: ${testFiles.length}
Config files: ${configFiles.length}
Docs: ${docFiles.length}

Please provide:
1) High-level summary of project purpose.
2) Architecture and main components.
3) Dependency risks and outdated packages.
4) Quick list of highest priority improvements (security, tests, CI).
5) Example small tasks for a new contributor (3 tasks).
6) Actionable next steps for production readiness.

Be concise but thorough. Use numbered lists and code examples when required.
`;

    const messages = [
      { role: 'system', content: 'You are an expert software architect analyzing code repositories. Provide clear, actionable recommendations.' },
      { role: 'user', content: analysisPrompt }
    ];

    // This can be heavy -> allow longer timeout and more tokens
    const result = await generateWithFallback(messages, { timeoutMs: 220000, num_predict: 1500, temperature: 0.2, max_tokens: 2000 });

    // Get text
    let rawContent = '';
  if (result.source === 'local') {
  rawContent =
    result.response.response ||               // CodeGemma output
    result.response.message?.content ||       // Qwen output
    result.response.output?.[0]?.content?.[0]?.text ||
    '';
}


    // We want the AI to respond normally (analysis, not code-only)
    const analysis = typeof rawContent === 'string'
  ? rawContent.trim()
  : JSON.stringify(rawContent, null, 2);


    console.log('[analyze-repo] Analysis complete. Source:', result.source, 'Model:', result.model);

    return res.json({
      success: true,
      analysis,
      metadata: {
        totalFiles: files.length,
        fileTypes: Object.keys(fileTypes).length,
        dependencies: allDependencies.length,
        usedModel: result.model,
        source: result.source,
        analyzedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[analyze-repo] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze repository',
      details: error.message
    });
  }
});

/**
 * POST /api/ai/explain
 * Expects: { code: string }
 * Returns: { explanation: string }
 *
 * Uses local model for explanation; prefers a friendly, concise explanation
 */
router.post('/explain', async (req, res) => {
  const { code } = req.body;
  if (!code || typeof code !== 'string') return res.status(400).json({ error: 'No code provided' });

  const messages = [
    { role: 'system', content: 'You are a helpful coding assistant. Explain the provided code in simple, clear steps.' },
    { role: 'user', content: `Explain what the following code does in simple steps. Be concise but thorough:\n\n${code}` }
  ];

  try {
    const result = await generateWithFallback(messages, { timeoutMs: 40000, num_predict: 400, temperature: 0.3 });

    let rawContent = '';
    if (result.source === 'local') {
      rawContent = result.response.message?.content || result.response.output?.[0]?.content?.[0]?.text || JSON.stringify(result.response);
    } else if (result.source === 'groq') {
      rawContent = result.response.message?.content || result.response.raw?.choices?.[0]?.text || JSON.stringify(result.response.raw);
    } else {
      rawContent = JSON.stringify(result.response);
    }

    const explanation = (rawContent && rawContent.trim()) ? rawContent.trim() : 'No explanation available.';
    return res.json({ explanation, usedModel: result.model, source: result.source });

  } catch (error) {
    console.error('[explain] Error:', error);
    return res.status(500).json({
      error: 'Failed to generate explanation',
      details: error.message,
      suggestion: 'Try a shorter code snippet or ensure local model is downloaded.'
    });
  }
});

/**
 * POST /api/ai/chat
 * Expects: { message: string, conversationHistory: [{role, content}] }
 * Returns: { response: string }
 *
 * Uses local chat model with context, falls back to Groq.
 */
router.post('/chat', async (req, res) => {
  const { message, conversationHistory } = req.body;

  if (!message || typeof message !== 'string') return res.status(400).json({ error: 'No message provided' });

  try {
    console.log('[chat] Message length:', message.length);

    const systemMsg = {
      role: 'system',
      content: 'You are an expert AI coding assistant integrated into an IDE. Help with code analysis, debugging, refactoring, and programming questions. Provide clear, actionable answers; use code blocks when showing code.'
    };

    const messages = [systemMsg];
    if (Array.isArray(conversationHistory)) {
      // Only keep last N messages to avoid huge context
      const trimmed = conversationHistory.slice(-12);
      messages.push(...trimmed);
    }

    messages.push({ role: 'user', content: message });

    const result = await generateWithFallback(messages, { timeoutMs: 30000, num_predict: 600, temperature: 0.6 });

    let rawContent = '';
    if (result.source === 'local') {
      rawContent = result.response.message?.content || result.response.output?.[0]?.content?.[0]?.text || JSON.stringify(result.response);
    } else if (result.source === 'groq') {
      rawContent = result.response.message?.content || result.response.raw?.choices?.[0]?.text || JSON.stringify(result.response.raw);
    } else {
      rawContent = JSON.stringify(result.response);
    }
//     if (result.source === 'local') {
//   rawContent =
//     result.response.response ||               // CodeGemma output
//     result.response.message?.content ||       // Qwen output
//     result.response.output?.[0]?.content?.[0]?.text ||
//     '';
// }


    const aiResponse = rawContent && rawContent.trim() ? rawContent.trim() : 'I could not generate a response. Please try again.';

    return res.json({ response: aiResponse, usedModel: result.model, source: result.source });

  } catch (error) {
    console.error('[chat] Error:', error);

    const fallback = error.message && error.message.includes('timed out')
      ? 'I apologize, the request took too long. Please try again or break your request into smaller parts.'
      : 'I encountered an error while processing your request. Please try again.';

    return res.status(500).json({
      error: 'Failed to generate chat response',
      response: fallback,
      details: error.message
    });
  }
});

/* ---------------------------
   Utility endpoints (optional)
   - /models -> lists installed models via Ollama
   - /health  -> simple health check
   ---------------------------*/

/**
 * GET /api/ai/models
 * Returns: { installed: [names], defaultLocalPrimary, defaultLocalFallback }
 */
router.get('/models', async (req, res) => {
  try {
    const listed = (await ollama.list()).models || [];
    const names = listed.map(m => m.name || m);
    return res.json({
      installed: names,
      defaultLocalPrimary: DEFAULT_LOCAL_PRIMARY,
      defaultLocalFallback: DEFAULT_LOCAL_FALLBACK
    });
  } catch (err) {
    console.warn('[models] Could not list models:', err.message);
    // Return empty but still informative
    return res.status(200).json({
      installed: [],
      note: 'Could not fetch model list; is Ollama running?',
      defaultLocalPrimary: DEFAULT_LOCAL_PRIMARY,
      defaultLocalFallback: DEFAULT_LOCAL_FALLBACK
    });
  }
});

/**
 * GET /api/ai/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    localHost: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
    groqConfigured: !!GROQ_API_KEY
  });
});

/* ---------------------------
   Export router
   ---------------------------*/
module.exports = router;
