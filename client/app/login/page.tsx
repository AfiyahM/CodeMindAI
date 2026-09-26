'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Github, Brain, Code, Zap, Loader, ArrowRight, UserPlus } from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function LoginPage() {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');

  // Check if already authenticated
  useEffect(() => {
    const token = localStorage.getItem('github_token');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleGitHubLogin = async () => {
    setIsSigningIn(true);
    setError('');
    try {
      console.log('[Login] Requesting GitHub OAuth URL from backend...');
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
      window.location.href = data.url;
    } catch (error: any) {
      console.error('[Login Error]', error);
      setError(error.message || 'Failed to initiate GitHub login. Please try again.');
      setIsSigningIn(false);
    }
  };

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
            Welcome back! Sign in to continue your coding journey.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#161b22]/80 backdrop-blur-sm border border-[#30363d] rounded-xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-[#f0f6fc] mb-2">Sign In</h2>
          <p className="text-[#7d8590] text-sm mb-6">
            Use your GitHub account to access your repositories
          </p>

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
            className="w-full bg-gradient-to-r from-[#2f81f7] to-[#1f6feb] hover:from-[#1f6feb] hover:to-[#0d47a1] disabled:from-gray-600 disabled:to-gray-500 text-white font-semibold py-3.5 px-6 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg disabled:transform-none disabled:cursor-not-allowed"
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
                <ArrowRight size={18} className="ml-auto" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#30363d]"></div>
            <span className="text-[#7d8590] text-xs">OR</span>
            <div className="flex-1 h-px bg-[#30363d]"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-[#7d8590] text-sm">
              Don't have an account?{' '}
              <Link 
                href="/signup" 
                className="text-[#2f81f7] hover:text-[#1f6feb] font-medium transition-colors inline-flex items-center gap-1"
              >
                Sign up
                <UserPlus size={14} />
              </Link>
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 space-y-3">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-[#161b22]/50 backdrop-blur-sm border border-[#30363d]/50 hover:border-[#2f81f7]/50 transition-all">
            <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
              <Code className="w-5 h-5 text-[#2f81f7]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f0f6fc]">Access Your Repos</h3>
              <p className="text-xs text-[#7d8590] mt-1">Browse and edit your GitHub repositories seamlessly</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-[#161b22]/50 backdrop-blur-sm border border-[#30363d]/50 hover:border-purple-500/50 transition-all">
            <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f0f6fc]">AI-Powered Analysis</h3>
              <p className="text-xs text-[#7d8590] mt-1">Get intelligent insights and code suggestions</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-[#161b22]/50 backdrop-blur-sm border border-[#30363d]/50 hover:border-green-500/50 transition-all">
            <div className="p-2 bg-green-500/20 rounded-lg flex-shrink-0">
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f0f6fc]">Professional IDE</h3>
              <p className="text-xs text-[#7d8590] mt-1">Monaco editor with full syntax highlighting</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

