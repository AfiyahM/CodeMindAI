// C:\codemind1\server\routes\github.js (FINAL - CORRECTED & COMPLETE)
const express = require('express');
const axios = require('axios');
const router = express.Router();

// GitHub OAuth config from env
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Prefer the explicit env callback; default to /api/github/callback
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const FALLBACK_CALLBACK = 'http://localhost:4000/api/github/callback';
const GITHUB_CALLBACK_URL =
  process.env.GITHUB_CALLBACK_URL && process.env.GITHUB_CALLBACK_URL.trim().length > 0
    ? process.env.GITHUB_CALLBACK_URL.trim()
    : FALLBACK_CALLBACK;

console.log('[GitHub Routes] OAuth Config:', {
  CLIENT_ID: GITHUB_CLIENT_ID ? 'Set ✓' : 'Missing ✗',
  CALLBACK_URL: GITHUB_CALLBACK_URL
});

// Middleware: Verify GitHub access token
const verifyGitHubToken = (req, res, next) => {
  const accessToken =
    req.body.accessToken ||
    req.query.token ||
    req.headers['authorization']?.replace('Bearer ', '').replace('token ', '');

  if (!accessToken) {
    return res.status(401).json({
      error: 'GitHub access token is required',
      message: 'Provide token in body.accessToken, query.token or Authorization Bearer header'
    });
  }
  req.githubAccessToken = accessToken;
  next();
};

// ==================== OAUTH ROUTES ====================

// GET /api/github/auth/github-url - Get GitHub OAuth authorization URL
router.get('/auth/github-url', (req, res) => {
  try {
    if (!GITHUB_CLIENT_ID) {
      return res.status(500).json({ error: 'GitHub Client ID not configured' });
    }

    const githubOAuthUrl =
      `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(GITHUB_CALLBACK_URL)}` +
      `&scope=repo,user`;

    console.log('[OAuth URL Generated]', githubOAuthUrl.substring(0, 120) + '...');
    res.json({ url: githubOAuthUrl });
  } catch (err) {
    console.error('[OAuth URL Error]', err);
    res.status(500).json({ error: 'Failed to generate OAuth URL' });
  }
});

// Shared handler to exchange code and redirect to frontend
async function handleOAuthCallback(req, res) {
  const { code } = req.query;

  if (!code) {
    console.error('[OAuth Callback] Missing authorization code');
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    console.log('[OAuth Callback] Exchanging code for token...');

    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code
      },
      {
        headers: { Accept: 'application/json' },
        timeout: 10000
      }
    );

    if (tokenResponse.data.error) {
      console.error('[OAuth Callback] GitHub error:', tokenResponse.data.error_description);
      return res.status(400).json({
        error: 'Authentication failed',
        details: tokenResponse.data.error_description
      });
    }

    const accessToken = tokenResponse.data.access_token;
    console.log('[OAuth Callback] Token received successfully ✓');

    // Redirect to frontend with token
    const redirectUrl = `${FRONTEND_URL}/?token=${accessToken}`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('[OAuth Callback] Error:', err.message);
    return res.status(500).json({
      error: 'Failed to get access token',
      details: err.message
    });
  }
}

// GET /api/github/auth/callback - primary callback route
router.get('/auth/callback', handleOAuthCallback);

// GET /api/github/callback - alias for teams using the shorter path in GitHub settings
router.get('/callback', handleOAuthCallback);

// ==================== GITHUB API ROUTES ====================

// GET /api/github/repos - Fetch user repositories
router.get('/repos', verifyGitHubToken, async (req, res) => {
  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${req.githubAccessToken}`,
        Accept: 'application/vnd.github.v3+json',
       // 'User-Agent': 'CodeMind.AI'
      },
      params: { sort: 'updated', per_page: 100, page: req.query.page || 1 },
      timeout: 10000
    });

    console.log(`[Repos] Fetched ${response.data.length} repositories`);
    res.json(response.data);
  } catch (error) {
    console.error('[Repos GET Error]', error.response?.status, error.response?.data?.message || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch repositories',
      details: error.response?.data?.message || error.message
    });
  }
});

// POST /api/github/repos - Fetch user repositories (POST variant)
router.post('/repos', verifyGitHubToken, async (req, res) => {
  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${req.githubAccessToken}`,
        Accept: 'application/vnd.github.v3+json',
       // 'User-Agent': 'CodeMind.AI'
      },
      params: { sort: 'updated', per_page: 100, page: req.body.page || req.query.page || 1 },
      timeout: 10000
    });

    console.log(`[Repos] Fetched ${response.data.length} repositories`);
    res.json(response.data);
  } catch (error) {
    console.error('[Repos POST Error]', error.response?.status, error.response?.data?.message || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch repositories',
      details: error.response?.data?.message || error.message
    });
  }
});

// GET /api/github/repo-content - Fetch repository file/folder content
router.get('/repo-content', verifyGitHubToken, async (req, res) => {
  try {
    const { owner, repo, path = '' } = req.query;

    if (!owner || !repo) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'owner and repo query parameters are required'
      });
    }

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `token ${req.githubAccessToken}`,
          Accept: 'application/vnd.github.v3+json',
       //   'User-Agent': 'CodeMind.AI'
        },
        timeout: 10000
      }
    );

    console.log(`[Repo Content] Fetched: ${owner}/${repo}/${path}`);
    res.json(response.data);
  } catch (error) {
    console.error('[Repo Content GET Error]', error.response?.status, error.response?.data?.message || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch repository content',
      details: error.response?.data?.message || error.message
    });
  }
});

// POST /api/github/repo-content - Fetch repository file/folder content (POST variant)
router.post('/repo-content', verifyGitHubToken, async (req, res) => {
  try {
    const { owner, repo, path = '' } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'owner and repo fields are required in request body'
      });
    }

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `token ${req.githubAccessToken}`,
          Accept: 'application/vnd.github.v3+json',
       //   'User-Agent': 'CodeMind.AI'
        },
        timeout: 10000
      }
    );

    console.log(`[Repo Content] Fetched: ${owner}/${repo}/${path}`);
    res.json(response.data);
  } catch (error) {
    console.error('[Repo Content POST Error]', error.response?.status, error.response?.data?.message || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch repository content',
      details: error.response?.data?.message || error.message
    });
  }
});

module.exports = router;
