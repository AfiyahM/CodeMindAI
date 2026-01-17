// C:\codemind1\client\app\page.tsx (COMPLETE - HOME PAGE WITH OAUTH - UPDATED)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Github, Code, Brain, Zap, Loader, Search, Star, GitFork, Eye } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string | null;
  owner: {
    login: string;
  };
}

export default function HomePage() {
  const router = useRouter();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  // Check for existing token and handle OAuth callback
  useEffect(() => {
    const token = localStorage.getItem('github_token');
    if (token) {
      setIsAuthenticated(true);
      fetchUserRepos(token);
    }

    // Check for auth-success callback from backend with token
    const params = new URLSearchParams(window.location.search);
    const callbackToken = params.get('token');
    if (callbackToken) {
      console.log('[Auth Success] Token received from backend callback');
      localStorage.setItem('github_token', callbackToken);
      setIsAuthenticated(true);
      window.history.replaceState({}, document.title, '/');
      fetchUserRepos(callbackToken);
    }
  }, []);

  const fetchUserRepos = async (token: string) => {
    try {
      setIsLoading(true);
      setError('');
      console.log('[Repos] Fetching user repositories...');

      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=30', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('github_token');
          setIsAuthenticated(false);
          setError('Token expired. Please sign in again.');
          return;
        }
        throw new Error('Failed to fetch repos');
      }

      const data = await response.json();
      console.log(`[Repos] Successfully fetched ${data.length} repositories`);
      setRepos(data);
    } catch (error) {
      console.error('[Repos Error]', error);
      setError('Failed to fetch repositories');
      localStorage.removeItem('github_token');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setIsSigningIn(true);
    setError('');
    try {
      console.log('[Login] Requesting GitHub OAuth URL from backend...');
      // FIXED: Correct endpoint to match backend route /api/github/auth/github-url
      const response = await fetch(`${API_BASE_URL}/api/github/auth/github-url`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error('No OAuth URL returned from backend');
      }

      console.log('[Login] Redirecting to GitHub OAuth...');
      // Backend will redirect from GitHub back to http://localhost:4000/api/github/callback
      // Then backend redirects to http://localhost:3000/?token=... or /auth-success?token=...
      window.location.href = data.url;
    } catch (error) {
      console.error('[Login Error]', error);
      setError(`Failed to initiate GitHub login. Please try again.`);
      setIsSigningIn(false);
    }
  };

  const handleRepoSelect = (owner: string, repo: string) => {
    router.push(`/repo/${owner}/${repo}`);
  };

  const handleLogout = () => {
    console.log('[Logout] User logging out...');
    localStorage.removeItem('github_token');
    setIsAuthenticated(false);
    setRepos([]);
    setError('');
  };

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Not authenticated - show login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d1117] via-[#1a1a2e] to-[#16213e] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animation: 'pulse 8s ease-in-out infinite' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animation: 'pulse 8s ease-in-out 2s infinite' }} />

        <div className="relative z-10 max-w-md w-full">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-[#f0f6fc]">CodeMind.AI</h1>
            </div>
            <p className="text-[#7d8590] text-sm leading-relaxed">
              A VS Code-like IDE with integrated AI assistance for code analysis, debugging, and development.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Sign In Button */}
          <button
            onClick={handleGitHubLogin}
            disabled={isSigningIn}
            className="w-full bg-gradient-to-r from-[#2f81f7] to-[#1f6feb] hover:from-[#1f6feb] hover:to-[#0d47a1] disabled:from-gray-600 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
          >
            {isSigningIn ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Github size={20} />
                Sign in with GitHub
              </>
            )}
          </button>

          {/* Features Grid */}
          <div className="mt-12 space-y-3">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-[#161b22]/50 backdrop-blur-sm border border-[#30363d]/50 hover:border-[#2f81f7]/50 transition-all">
              <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                <Code className="w-5 h-5 text-[#2f81f7]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc]">Browse & Edit</h3>
                <p className="text-xs text-[#7d8590] mt-1">Explore repositories with intuitive file tree navigation</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-[#161b22]/50 backdrop-blur-sm border border-[#30363d]/50 hover:border-purple-500/50 transition-all">
              <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc]">AI Analysis</h3>
                <p className="text-xs text-[#7d8590] mt-1">Real-time Ollama-powered code analysis and insights</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-[#161b22]/50 backdrop-blur-sm border border-[#30363d]/50 hover:border-green-500/50 transition-all">
              <div className="p-2 bg-green-500/20 rounded-lg flex-shrink-0">
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc]">Monaco Editor</h3>
                <p className="text-xs text-[#7d8590] mt-1">Professional code editing with syntax highlighting</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - show repositories
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1117] to-[#161b22] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Search (GitHub-style) */}
        <div className="flex items-center justify-between mb-10 gap-6">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#f0f6fc]">CodeMind.AI</h1>
              <p className="text-xs text-[#7d8590]">Your Repositories</p>
            </div>
          </div>

          {/* Center: Search */}
          <div className="relative w-[360px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8590]"
            />
            <input
              type="text"
              placeholder="Search repositories"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
        w-full
        h-9
        pl-9
        pr-3
        bg-[#0d1117]
        border border-[#30363d]
        rounded-md
        text-sm
        text-[#e6edf3]
        placeholder-[#7d8590]
        focus:outline-none
        focus:border-[#2f81f7]
        focus:ring-1
        focus:ring-[#2f81f7]
      "
            />
          </div>

          {/* Right: Sign Out */}
          <button
            onClick={handleLogout}
            className="
      h-9
      px-4
      bg-[#21262d]
      hover:bg-[#30363d]
      border border-[#30363d]
      text-[#e6edf3]
      rounded-md
      text-sm
      font-medium
      transition-colors
    "
          >
            Sign Out
          </button>
        </div>


        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-12 h-12 text-[#2f81f7] animate-spin mx-auto mb-4" />
              <p className="text-[#7d8590]">Loading your repositories...</p>
            </div>
          </div>
        ) : filteredRepos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepos.map((repo) => (
              <button
                key={repo.id}
                onClick={() => handleRepoSelect(repo.owner.login, repo.name)}
                className="p-5 rounded-lg bg-[#161b22] border border-[#30363d] hover:border-[#2f81f7]/50 hover:bg-[#1c2128] transition-all duration-300 transform hover:scale-105 active:scale-95 text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <Github className="w-8 h-8 text-[#2f81f7] group-hover:text-[#1f6feb] transition-colors" />
                  {repo.language && (
                    <span className="px-2 py-1 bg-[#2f81f7]/20 text-[#2f81f7] rounded-full text-xs font-semibold">
                      {repo.language}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-[#f0f6fc] group-hover:text-[#2f81f7] transition-colors truncate">
                  {repo.name}
                </h3>

                {repo.description && (
                  <p className="text-sm text-[#7d8590] mt-2 line-clamp-2">
                    {repo.description}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-3 text-xs text-[#7d8590]">
                  {repo.stargazers_count > 0 && (
                    <div className="flex items-center gap-1 hover:text-[#2f81f7] transition-colors">
                      <Star className="w-3 h-3" />
                      {repo.stargazers_count}
                    </div>
                  )}
                  {repo.forks_count > 0 && (
                    <div className="flex items-center gap-1 hover:text-[#2f81f7] transition-colors">
                      <GitFork className="w-3 h-3" />
                      {repo.forks_count}
                    </div>
                  )}
                  {repo.watchers_count > 0 && (
                    <div className="flex items-center gap-1 hover:text-[#2f81f7] transition-colors">
                      <Eye className="w-3 h-3" />
                      {repo.watchers_count}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[#7d8590] mb-4">
              {searchQuery ? 'No repositories found matching your search' : 'No repositories available'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#2f81f7] hover:text-[#1f6feb] transition-colors text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
