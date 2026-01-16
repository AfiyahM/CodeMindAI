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
 * Helper: Extract content from model response based on model type and source.
 * Handles CodeGemma (ollama.generate) and other models (ollama.chat) formats.
 * @param {Object} result - Result object from generateWithFallback
 * @param {string} result.source - 'local' or 'groq'
 * @param {string} result.model - Model name
 * @param {Object} result.response - Response object from the model
 * @returns {string} Extracted content text
 */
function extractModelContent(result) {
  if (!result || !result.response) {
    console.log('[extractModelContent] No result or response');
    return '';
  }

  // CodeGemma models use ollama.generate() which returns result.response.response
  const isCodeGemma = result.model && (
    result.model.startsWith('codemindai-gemma') || 
    result.model.startsWith('codegemma')
  );

  console.log('[extractModelContent] Model:', result.model, 'Source:', result.source, 'IsCodeGemma:', isCodeGemma);
  console.log('[extractModelContent] Response keys:', Object.keys(result.response || {}));

  if (result.source === 'local') {
    // For CodeGemma models, check response.response first
    if (isCodeGemma) {
      // ollama.generate() returns: { response: string, model: string, done: boolean, ... }
      // The response field contains the generated text
      let content = '';
      
      // Try primary path: response.response (most common for ollama.generate)
      if (result.response?.response && typeof result.response.response === 'string') {
        content = result.response.response;
        console.log('[extractModelContent] CodeGemma: Found content in response.response, length:', content.length);
      }
      // Try alternative paths
      else if (result.response?.text && typeof result.response.text === 'string') {
        content = result.response.text;
        console.log('[extractModelContent] CodeGemma: Found content in response.text, length:', content.length);
      }
      else if (result.response?.output && typeof result.response.output === 'string') {
        content = result.response.output;
        console.log('[extractModelContent] CodeGemma: Found content in response.output, length:', content.length);
      }
      else if (typeof result.response === 'string') {
        content = result.response;
        console.log('[extractModelContent] CodeGemma: Response is string, length:', content.length);
      }
      
      // Validate content is meaningful (not just a single character or very short)
      if (content && typeof content === 'string') {
        const trimmed = content.trim();
        if (trimmed.length > 10) { // Require at least 10 characters
          console.log('[extractModelContent] CodeGemma: Valid content found, length:', trimmed.length);
          return trimmed;
        } else {
          console.warn('[extractModelContent] CodeGemma: Content too short (length:', trimmed.length, '), preview:', trimmed);
        }
      }
      
      // If still empty or too short, log the full response structure for debugging
      console.error('[extractModelContent] CodeGemma: Failed to extract valid content');
      console.log('[extractModelContent] CodeGemma response structure:', JSON.stringify(result.response, null, 2).slice(0, 1000));
    }
    // For other local models (Qwen, etc.), check message.content
    // ollama.chat() returns: { message: { content: string, role: string }, ... }
    const content = result.response?.message?.content || 
                   result.response?.output?.[0]?.content?.[0]?.text || 
                   result.response?.response ||
                   result.response?.text ||
                   '';
    console.log('[extractModelContent] Other local model content length:', content?.length || 0);
    if (content && typeof content === 'string' && content.trim()) {
      return content;
    }
    // Log structure for debugging
    console.log('[extractModelContent] Other local response structure:', JSON.stringify(result.response, null, 2).slice(0, 500));
  } else if (result.source === 'groq') {
    // Groq format: message.content or raw.choices[0].message.content
    const content = result.response?.message?.content || 
                   result.response?.raw?.choices?.[0]?.message?.content || 
                   result.response?.raw?.choices?.[0]?.text || 
                   '';
    console.log('[extractModelContent] Groq content length:', content?.length || 0);
    if (content && typeof content === 'string' && content.trim()) {
      return content;
    }
  }

  // Fallback: try to stringify if nothing else works
  console.log('[extractModelContent] Using fallback, response type:', typeof result.response);
  const fallback = typeof result.response === 'string' 
    ? result.response 
    : JSON.stringify(result.response, null, 2);
  console.log('[extractModelContent] Fallback length:', fallback.length);
  return fallback;
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
      stream: false, // Explicitly disable streaming to get complete response
      options
    });

    // Log the full response structure for debugging
    console.log('[CODEGEMMA RESPONSE] Full response keys:', Object.keys(response || {}));
    console.log('[CODEGEMMA RESPONSE] Response type:', typeof response);
    console.log('[CODEGEMMA RESPONSE] Response.response type:', typeof response?.response);
    console.log('[CODEGEMMA RESPONSE] Response.response length:', response?.response?.length || 0);
    console.log('[CODEGEMMA RESPONSE] Response.response preview:', response?.response?.slice(0, 100) || 'N/A');
    console.log('[CODEGEMMA RESPONSE] Response.done:', response?.done);

    // Ensure response is complete
    if (response && response.done === false) {
      console.warn('[CODEGEMMA] Warning: Response may be incomplete (done: false)');
    }

    return response;
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
    // Extract content using unified helper function
    const rawContent = extractModelContent(result);

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
    return res.status(400).json({ 
      success: false,
      error: 'No files provided for analysis' 
    });
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

    // Language detection and statistics
    const languageMap = {
      'js': 'JavaScript', 'ts': 'TypeScript', 'jsx': 'JavaScript (React)', 'tsx': 'TypeScript (React)',
      'py': 'Python', 'java': 'Java', 'cpp': 'C++', 'c': 'C', 'cs': 'C#',
      'php': 'PHP', 'rb': 'Ruby', 'go': 'Go', 'rs': 'Rust',
      'html': 'HTML', 'css': 'CSS', 'scss': 'SCSS', 'sass': 'SASS',
      'json': 'JSON', 'yaml': 'YAML', 'yml': 'YAML', 'xml': 'XML',
      'md': 'Markdown', 'sh': 'Shell', 'bash': 'Bash',
      'sql': 'SQL', 'vue': 'Vue', 'svelte': 'Svelte'
    };

    const languageStats = {};
    files.forEach(file => {
      const ext = (file.path || '').split('.').pop()?.toLowerCase() || 'unknown';
      const lang = languageMap[ext] || ext.toUpperCase();
      if (!languageStats[lang]) {
        languageStats[lang] = { count: 0, files: [], totalSize: 0 };
      }
      languageStats[lang].count++;
      languageStats[lang].files.push(file.path);
      languageStats[lang].totalSize += file.size || 0;
    });

    // Get primary languages (sorted by file count)
    const primaryLanguages = Object.entries(languageStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([lang, stats]) => ({
        language: lang,
        files: stats.count,
        sizeKB: (stats.totalSize / 1024).toFixed(2),
        percentage: ((stats.count / files.length) * 100).toFixed(1)
      }));

    // Determine primary language
    const primaryLanguage = primaryLanguages[0]?.language || 'Unknown';

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

    // Include snippets from key files for more specific analysis
    const getFileSnippet = (file, maxLines = 30) => {
      if (!file || !file.content) return null;
      const lines = file.content.split('\n');
      const snippet = lines.slice(0, maxLines).join('\n');
      return snippet.length < file.content.length ? snippet + '\n... (truncated)' : snippet;
    };

    const keyFileSnippets = [];
    // Add entry point snippets
    entryPoints.slice(0, 2).forEach(ep => {
      const snippet = getFileSnippet(ep, 25);
      if (snippet) keyFileSnippets.push({ path: ep.path, content: snippet });
    });
    // Add config file snippets
    const mainConfig = configFiles.find(f => f.path.includes('package.json') || f.path.includes('config'));
    if (mainConfig) {
      const snippet = getFileSnippet(mainConfig, 40);
      if (snippet) keyFileSnippets.push({ path: mainConfig.path, content: snippet });
    }

    // Determine model type early to create appropriate prompt
    const localPrimary = await selectLocalModel(DEFAULT_LOCAL_PRIMARY);
    const isCodeGemmaModel = localPrimary.startsWith('codemindai-gemma') || localPrimary.startsWith('codegemma');
    
    // Create a much simpler, more direct prompt for CodeGemma
    const analysisPrompt = isCodeGemmaModel 
      ? `Analyze this code repository: ${owner}/${repo}

Repository stats:
- Files: ${files.length} files, ${totalSizeKb} KB
- Main language: ${primaryLanguage}
- Languages: ${primaryLanguages.slice(0, 5).map(l => l.language).join(', ')}
- Dependencies: ${allDependencies.length}
- Tests: ${testFiles.length} test files

Provide analysis covering:
1. What this project does
2. Main technologies used
3. Code structure overview
4. Dependencies status
5. Testing coverage
6. Code quality assessment
7. Key recommendations

Write clearly with bullet points.`
      : `Analyze the repository "${owner}/${repo}" and provide a structured analysis.

REPOSITORY INFORMATION:
- Repository: ${owner}/${repo}
- Total Files: ${files.length}
- Total Size: ${totalSizeKb} KB
- Primary Language: ${primaryLanguage}
- Languages Used: ${primaryLanguages.map(l => `${l.language} (${l.percentage}%)`).join(', ')}
- Top-level Directories: ${[...new Set(files.map(f => f.path.split('/')[0]))].slice(0,10).join(', ')}

${!isCodeGemmaModel ? `LANGUAGE BREAKDOWN:
${primaryLanguages.map((l, i) => `${i + 1}. ${l.language}: ${l.files} files (${l.percentage}%), ${l.sizeKB} KB`).join('\n')}

DIRECTORY STRUCTURE:
${truncatedDir.slice(0, 1500)}

DEPENDENCIES (${allDependencies.length}):
${allDependencies.length > 0 ? allDependencies.slice(0, 20).map(d => `- ${d.name}@${d.version}`).join('\n') : 'No package files found.'}
${allDependencies.length > 20 ? `... and ${allDependencies.length - 20} more` : ''}

KEY FILES:
- Entry Points: ${entryPoints.length > 0 ? entryPoints.map(e => e.path).join(', ') : 'None found'}
- Test Files: ${testFiles.length} files
- Config Files: ${configFiles.length} files  
- Documentation: ${docFiles.length} files

${keyFileSnippets.length > 0 ? `## Key File Content Snippets

${keyFileSnippets.map(f => `### ${f.path}
\`\`\`
${f.content}
\`\`\`
`).join('\n')}

*Use these code snippets to provide specific examples in your analysis.*\n` : ''}

---

ANALYSIS REQUIRED - Provide a structured analysis in the following format:
` : ''}

1. PROJECT OVERVIEW
   - What this project does (2-3 sentences)
   - Primary purpose and functionality
   - Technology stack: ${primaryLanguages.slice(0, 5).map(l => l.language).join(', ')}
   - Main language: ${primaryLanguage}

2. CODE STRUCTURE & ORGANIZATION
   - How files are organized
   - Main directories and their purposes
   - Entry points and key files
   - Code organization quality (good/fair/needs improvement)

3. KEY COMPONENTS & ARCHITECTURE
   - Main components/modules identified
   - How they interact
   - Architecture pattern (if identifiable)

4. DEPENDENCIES ANALYSIS
   - Main dependencies: ${allDependencies.slice(0, 10).map(d => d.name).join(', ')}
   - Dependency count: ${allDependencies.length}
   - Any security concerns or outdated packages

5. TESTING STATUS
   - Test files found: ${testFiles.length}
   - Test coverage assessment
   - Recommendations for testing

6. CODE QUALITY ASSESSMENT
   - Overall code quality (excellent/good/fair/poor)
   - Strengths
   - Areas for improvement
   - Code smells or issues found

7. RECOMMENDATIONS
   - Top 5 priority improvements
   - Quick wins for contributors
   - Production readiness checklist

8. SUMMARY
   - One paragraph summary
   - Overall assessment
   - Next steps

IMPORTANT: Write clearly and concisely. Use bullet points and short paragraphs. Start each section with a heading. Be specific about what you observe in the code.
`;

    const messages = isCodeGemmaModel ? [
      // Simpler prompt for CodeGemma - it works better with direct instructions
      {
        role: 'system',
        content: 'You are a code reviewer. Analyze repositories and provide structured, clear analysis with specific observations about code, languages, structure, dependencies, and recommendations.'
      },
      {
        role: 'user',
        content: analysisPrompt
      }
    ] : [
      { 
        role: 'system', 
        content: `You are an expert software architect and code reviewer. Provide comprehensive, structured analysis of codebases. Explain your findings clearly with specific examples. Use bullet points and clear headings.` 
      },
      { role: 'user', content: analysisPrompt }
    ];

    // This can be heavy -> allow longer timeout and more tokens
   // const result = await generateWithFallback(messages, { timeoutMs: 220000, num_predict: 1500, temperature: 0.2, max_tokens: 2000 });

    // Generate comprehensive analysis with higher token limits for detailed explanations
    // CodeGemma needs more tokens to generate complete responses
    const result = await generateWithFallback(messages, { 
      timeoutMs: 300000, // 5 minutes for comprehensive analysis
      num_predict: isCodeGemmaModel ? 4000 : 3000, // Even more tokens for CodeGemma
      temperature: 0.4, // Higher temperature for more varied, natural responses
      max_tokens: isCodeGemmaModel ? 4000 : 4000 // Increased token limit
    });

    // Extract analysis text using unified helper function
    const rawContent = extractModelContent(result);
    console.log('[analyze-repo] Raw content length:', rawContent?.length || 0);
    console.log('[analyze-repo] Raw content preview (first 500 chars):', rawContent?.slice(0, 500) || 'EMPTY');
    console.log('[analyze-repo] Raw content preview (last 200 chars):', rawContent?.slice(-200) || 'EMPTY');
    
    // Ensure analysis is always a non-empty string
    let analysis = '';
    if (rawContent && typeof rawContent === 'string') {
      const trimmed = rawContent.trim();
      
      // Validate the response is meaningful (not just a single character or very short)
      if (trimmed.length < 50) {
        console.error('[analyze-repo] WARNING: Response is suspiciously short (length:', trimmed.length, ')');
        console.error('[analyze-repo] Full content:', JSON.stringify(trimmed));
        analysis = `Analysis response appears incomplete (only ${trimmed.length} characters received). This may indicate:\n` +
                   `1. The model response was truncated\n` +
                   `2. The model encountered an error\n` +
                   `3. Network timeout occurred\n\n` +
                   `Received content: "${trimmed}"\n\n` +
                   `Please try again or check the server logs for more details.`;
      } else {
        analysis = trimmed;
      }
    } else if (rawContent) {
      // If rawContent exists but isn't a string, stringify it
      analysis = String(rawContent);
      console.warn('[analyze-repo] Raw content was not a string, converted to string');
    } else {
      analysis = 'No analysis generated - check model response format. The model may not have returned a valid response.';
      console.error('[analyze-repo] ERROR: No raw content extracted from model response');
    }

    console.log('[analyze-repo] Final analysis length:', analysis.length);
    console.log('[analyze-repo] Analysis complete. Source:', result.source, 'Model:', result.model);
    
    // Final validation
    if (analysis.length < 50) {
      console.error('[analyze-repo] CRITICAL: Final analysis is too short, this indicates a problem');
    }

    // Always return consistent response format with enhanced metadata
    return res.json({
      success: true,
      analysis: analysis, // Always a string
      metadata: {
        totalFiles: files.length,
        fileTypes: Object.keys(fileTypes).length,
        dependencies: allDependencies.length,
        usedModel: result.model,
        source: result.source,
        analyzedAt: new Date().toISOString(),
        // Add language information for better display
        languages: primaryLanguages.slice(0, 5).map(l => ({
          name: l.language,
          files: l.count,
          percentage: l.percentage,
          sizeKB: l.sizeKB
        })),
        primaryLanguage: primaryLanguage,
        entryPoints: entryPoints.map(e => e.path),
        testFilesCount: testFiles.length,
        configFilesCount: configFiles.length
      }
    });


    // We want the AI to respond normally (analysis, not code-only)
  //   //const analysis = typeof rawContent === 'string'
  // ? rawContent.trim()
  // : JSON.stringify(rawContent, null, 2);


  //   console.log('[analyze-repo] Analysis complete. Source:', result.source, 'Model:', result.model);

  //   return res.json({
  //     success: true,
  //     analysis,
  //     metadata: {
  //       totalFiles: files.length,
  //       fileTypes: Object.keys(fileTypes).length,
  //       dependencies: allDependencies.length,
  //       usedModel: result.model,
  //       source: result.source,
  //       analyzedAt: new Date().toISOString()
  //     }
  //   });

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

    // Extract content using unified helper function
    const rawContent = extractModelContent(result);
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

    // Extract content using unified helper function
    const rawContent = extractModelContent(result);
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
