// C:\codemind1\server\index.js (COMPLETE - Corrected App Initialization - UPDATED)
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const aiRoutes = require('./routes/ai');
const githubRoutes = require('./routes/github');

// Create Express app FIRST
const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:4000/api/github/callback';

// Setup middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running ✓',
    timestamp: new Date(),
    port: PORT
  });
});

// Mount routes
app.use('/api/github', githubRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist`,
    availableEndpoints: [
      'GET /health',
      'GET /api/github/auth/github-url',
      'GET /api/github/auth/callback',
      'GET /api/github/callback',
      'GET /api/github/repos',
      'POST /api/github/repos',
      'GET /api/github/repo-content',
      'POST /api/github/repo-content',
      'POST /api/ai/complete',
      'POST /api/ai/analyze-repo'
    ]
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('[Error Handler]', {
    message: err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date()
  });

  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    status: err.status || 500
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║         🚀 CodeMind.AI Server Started ✨           ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║  Server:   http://localhost:${PORT}               ║
║  Frontend: ${FRONTEND_URL}                    ║
║  Health:   http://localhost:${PORT}/health       ║
║  Env:      ${process.env.NODE_ENV || 'development'}                           ║
║                                                    ║
║  GitHub OAuth:                                     ║
║  ✓ Client ID: ${process.env.GITHUB_CLIENT_ID ? 'Set ✓' : 'NOT SET ✗'}                        ║
║  ✓ Callback URL: ${GITHUB_CALLBACK_URL.substring(0, 35)}║
║                                                    ║
╚════════════════════════════════════════════════════╝
  `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
