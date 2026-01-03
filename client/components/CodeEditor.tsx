'use client';

import { useState, useRef } from "react";
import dynamic from 'next/dynamic';
import axios from "axios";
import { Sparkles, X, Check, AlertCircle, Loader2 } from 'lucide-react';

// Dynamically import the Monaco editor with no SSR
const Editor = dynamic(
  () => import('@monaco-editor/react'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-[#0d1117]">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    )
  }
);

// Get API base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

type Props = {
  code: string;
  language: string;
  height?: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
};

const CodeEditor = ({ code, language, height = "70vh", onChange, readOnly = false }: Props) => {
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);

  const handleSuggest = async () => {
    if (!code.trim()) {
      setError("Please write some code first");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuggestion("");
    setShowSuggestion(true);

    try {
      // FIXED: Send proper request body matching backend expectations
      const response = await axios.post(
        `${API_BASE_URL}/api/ai/complete`,
        { 
          code: code,  // Backend expects 'prompt' not 'code'
          language: language || 'javascript'
        },
        { 
          timeout: 120000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.data && response.data.suggestion) {
        setSuggestion(response.data.suggestion);
      } else if (response.data && response.data.completion) {
        // Some backends return 'completion' instead
        setSuggestion(response.data.completion);
      } else if (response.data && response.data.error) {
        throw new Error(response.data.error);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error("AI Suggestion Error:", err);
      let errorMessage = "Failed to get AI suggestions.";

      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMessage = "⚠️ Cannot connect to AI service. Please ensure the server is running on port 4000.\n\nRun: cd server && npm start";
      } else if (err.response) {
        const { data, status } = err.response;
        
        // Handle 400 Bad Request specifically
        if (status === 400) {
          errorMessage = `⚠️ Bad Request: ${data.error || data.message || 'Invalid request format'}`;
          if (data.details) {
            errorMessage += `\n\nDetails: ${data.details}`;
          }
        } else {
          errorMessage = data.error || data.message || errorMessage;
          if (data.details) {
            errorMessage += `\n${data.details}`;
          }
        }
        
        if (data.suggestion) {
          errorMessage += `\n\n💡 Tip: ${data.suggestion}`;
        }
      } else if (err.request) {
        errorMessage = "⚠️ No response from AI service. Check if the server is running.";
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = "⏱️ Request timed out. The AI service is taking too long.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = () => {
    if (onChange && suggestion) {
      onChange(code + "\n" + suggestion);
      setSuggestion("");
      setShowSuggestion(false);
    }
  };

  const dismissSuggestion = () => {
    setSuggestion("");
    setShowSuggestion(false);
    setError("");
  };

  const editorRef = useRef(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure Monaco theme
    monaco.editor.defineTheme('codemind-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#e6edf3',
        'editorLineNumber.foreground': '#7d8590',
        'editor.selectionBackground': '#1f6feb',
        'editor.inactiveSelectionBackground': '#1f6feb33',
        'editorCursor.foreground': '#58a6ff',
        'editor.lineHighlightBackground': '#161b2233',
      }
    });

    monaco.editor.setTheme('codemind-dark');
  };

  return (
    <div className="h-full flex flex-col bg-[#0d1117] border border-[#30363d]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7d8590] font-mono">{language}</span>
        </div>
        <button
          onClick={handleSuggest}
          disabled={isLoading || readOnly || !code.trim()}
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs font-semibold transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Get AI Suggestion
            </>
          )}
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => onChange?.(value)}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
            lineNumbers: 'on',
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            readOnly: readOnly,
            theme: 'codemind-dark',
            formatOnPaste: true,
            formatOnType: true,
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            automaticLayout: true,
          }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border-t border-red-500/50 text-red-300 text-sm whitespace-pre-wrap font-mono">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
            <button
              onClick={() => setError("")}
              className="text-red-300 hover:text-red-200"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Suggestion Panel */}
      {showSuggestion && suggestion && (
        <div className="px-4 py-3 bg-blue-500/10 border-t border-blue-500/50 max-h-48 overflow-y-auto">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-blue-300" />
              <p className="text-xs font-semibold text-blue-300">AI Suggestion</p>
            </div>
            <button
              onClick={dismissSuggestion}
              className="text-blue-300 hover:text-blue-200 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <pre className="text-xs text-blue-100 font-mono mb-3 bg-[#0d1117] p-3 rounded border border-blue-500/30 overflow-x-auto">
            {suggestion}
          </pre>
          <div className="flex gap-2">
            <button
              onClick={applySuggestion}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition-all"
            >
              <Check size={14} />
              Apply
            </button>
            <button
              onClick={dismissSuggestion}
              className="px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] rounded text-xs font-semibold transition-all border border-[#30363d]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
