// C:\codemind1\client\app\repo\[owner]\[repo]\page.tsx (COMPLETE - REPO PAGE WITH FILE EXPLORER & AI)
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Code, File as FileIcon, FileText, FileImage, Sparkles, Loader2, ChevronRight, ChevronDown, Folder, AlertCircle } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import IDELayout from '@/components/layout/IDELayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
}

interface EditorTab {
  id: string;
  name: string;
  isDirty?: boolean;
}

export default function RepoPage() {
  const params = useParams();
  const router = useRouter();
  const { owner, repo } = params as { owner: string; repo: string };

  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [repoContent, setRepoContent] = useState<GitHubFile[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<GitHubFile | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [streamingAnalysis, setStreamingAnalysis] = useState('');

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getLanguage = (filename: string): string => {
    const ext = getFileExtension(filename);
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'md': 'markdown',
      'json': 'json',
      'html': 'html',
      'css': 'css',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
    };
    return languageMap[ext] || 'plaintext';
  };

  const analyzeRepository = async () => {
    if (!repoContent.length) {
      setError('No repository content available to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setShowAnalysis(true);
    setStreamingAnalysis('');

    try {
      const githubToken = localStorage.getItem('github_token');
      if (!githubToken) {
        throw new Error('GitHub authentication required. Please sign in with GitHub.');
      }

      const importantFiles = repoContent
        .filter(file => file.type === 'file' &&
          (file.name.endsWith('.js') ||
            file.name.endsWith('.ts') ||
            file.name.endsWith('.py') ||
            file.name.endsWith('.java') ||
            file.name.endsWith('package.json') ||
            file.name.endsWith('requirements.txt') ||
            file.name.endsWith('README.md')
          )
        )
        .slice(0, 10);

      if (importantFiles.length === 0) {
        throw new Error('No supported files found for analysis');
      }

      console.log(`[Analysis] Analyzing ${importantFiles.length} important files...`);

      const BATCH_SIZE = 2;
      const filesWithContent = [];

      for (let i = 0; i < importantFiles.length; i += BATCH_SIZE) {
        const batch = importantFiles.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map(async (file) => {
            try {
              const response = await axios.get(
                `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
                {
                  headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3.raw'
                  },
                  responseType: 'text',
                  timeout: 10000
                }
              );

              return {
                path: file.path,
                name: file.name,
                content: response.data || '',
                language: getFileExtension(file.name) || 'text',
                size: file.size || 0
              };
            } catch (error) {
              console.error(`[Analysis] Error fetching ${file.path}:`, error);
              return null;
            }
          })
        );

        filesWithContent.push(...batchResults.filter(Boolean));

        if (i + BATCH_SIZE < importantFiles.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (filesWithContent.length === 0) {
        throw new Error('Failed to fetch any file contents for analysis');
      }

      console.log(`[Analysis] Successfully fetched ${filesWithContent.length} files`);

      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-repo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${githubToken}`
        },
        body: JSON.stringify({
          files: filesWithContent,
          owner,
          repo
        })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }
// ---- NEW NON-STREAMING LOGIC ---- //
const data = await response.json();

if (!data.success) {
  throw new Error(data.error || 'Analysis failed');
}

setStreamingAnalysis(data.analysis || '');

      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to analyze repository';
      console.error('[Analysis Error]', errorMessage);
      setError(`Analysis failed: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchRepoContent = useCallback(async (path: string = '') => {
    if (!owner || !repo) return;
    try {
      setIsLoading(true);
      setError('');
      const githubToken = localStorage.getItem('github_token');
      if (!githubToken) {
        throw new Error('GitHub authentication required. Please sign in with GitHub.');
      }

      console.log(`[Repo] Fetching repository content for path: ${path}`);

      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
           // 'User-Agent': 'CodeMind.AI'
          },
          timeout: 10000
        }
      );

      if (!response.data) {
        throw new Error('No data received from GitHub API');
      }

      if (Array.isArray(response.data)) {
        console.log(`[Repo] Successfully loaded ${response.data.length} items`);
        setRepoContent(response.data);
      } else if ('message' in response.data) {
        throw new Error((response.data as any).message);
      } else {
        setRepoContent([response.data]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load repository content';
      console.error('[Repo Error]', errorMessage);
      setError(`Error: ${errorMessage}`);

      if (err.response?.status === 401) {
        localStorage.removeItem('github_token');
        router.push('/');
      }
    } finally {
      setIsLoading(false);
    }
  }, [owner, repo, router]);

  useEffect(() => {
    fetchRepoContent('');
  }, [fetchRepoContent]);

  const fetchFileContent = useCallback(async (file: GitHubFile) => {
    try {
      setIsLoadingFile(true);
      setError('');
      const githubToken = localStorage.getItem('github_token');
      if (!githubToken) {
        throw new Error('GitHub authentication required');
      }

      console.log(`[File] Fetching content for: ${file.path}`);

      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
        {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
           // 'User-Agent': 'CodeMind.AI'
          },
          timeout: 10000
        }
      );

      if (response.data.size > 1024 * 100) {
        setFileContent(`// File is too large to display (${(response.data.size / 1024).toFixed(1)}KB)`);
        setSelectedFile(file);
        return;
      }

      if (response.data.content && response.data.encoding === 'base64') {
        const decodedContent = atob(response.data.content.replace(/\n/g, ''));
        setFileContent(decodedContent);
      } else {
        setFileContent('// Unable to decode file content');
      }

      setSelectedFile(file);
    } catch (err: any) {
      console.error('[File Error]', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load file content';
      setError(`Error: ${errorMessage}`);
      setFileContent(`// Error loading file: ${errorMessage}`);
    } finally {
      setIsLoadingFile(false);
    }
  }, [owner, repo]);

  const handleItemClick = useCallback((item: GitHubFile) => {
    if (item.type === 'dir') {
      setExpandedDirs(prev => ({
        ...prev,
        [item.path]: !prev[item.path]
      }));
      fetchRepoContent(item.path);
    } else {
      fetchFileContent(item);
    }
  }, [fetchRepoContent, fetchFileContent]);

  const getFileIcon = (filename: string) => {
    const extension = getFileExtension(filename);
    const codeExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'go', 'rs', 'rb', 'php', 'swift', 'kt', 'dart'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];

    if (codeExtensions.includes(extension)) {
      return <Code className="w-4 h-4 text-blue-400" />;
    } else if (extension === 'md') {
      return <FileText className="w-4 h-4 text-yellow-400" />;
    } else if (imageExtensions.includes(extension)) {
      return <FileImage className="w-4 h-4 text-green-400" />;
    } else {
      return <FileIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const convertToFileNodes = (githubFiles: GitHubFile[]): FileNode[] => {
    return githubFiles.map(file => ({
      id: file.sha,
      name: file.name,
      type: file.type === 'dir' ? 'directory' : 'file'
    }));
  };

  const convertFileToNode = (file: GitHubFile | null): FileNode | null => {
    if (!file) return null;
    return {
      id: file.sha,
      name: file.name,
      type: file.type === 'dir' ? 'directory' : 'file'
    };
  };

  const handleFileNodeClick = (node: FileNode) => {
    const githubFile = repoContent.find(f => f.sha === node.id);
    if (githubFile) {
      handleItemClick(githubFile);
    }
  };

  const handleDirToggle = (nodeId: string) => {
    const dir = repoContent.find(f => f.sha === nodeId);
    if (dir && dir.type === 'dir') {
      setExpandedDirs(prev => ({
        ...prev,
        [dir.path]: !prev[dir.path]
      }));
      fetchRepoContent(dir.path);
    }
  };

  const tabs: EditorTab[] = selectedFile ? [{
    id: selectedFile.sha,
    name: selectedFile.name,
    isDirty: false
  }] : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d1117]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#2f81f7] animate-spin mx-auto mb-4" />
          <p className="text-[#7d8590]">Loading repository...</p>
        </div>
      </div>
    );
  }

 return (
  <IDELayout
    files={convertToFileNodes(repoContent)}
    expandedDirs={expandedDirs}
    onFileClick={handleFileNodeClick}
    onDirToggle={handleDirToggle}
    selectedFile={convertFileToNode(selectedFile)}
    tabs={tabs}
    activeTabId={selectedFile?.sha || ''}
    onTabClick={() => {}}
    onTabClose={() => {
      setSelectedFile(null);
      setFileContent('');
    }}
    statusBarProps={{
      language: selectedFile ? getLanguage(selectedFile.name) : 'plaintext',
      branch: 'main',
      aiStatus: isAnalyzing ? 'processing' : 'ready'
    }}
    // ADD THIS: Analysis panel prop
    analysisPanel={streamingAnalysis || isAnalyzing ? {
      content: streamingAnalysis,
      isAnalyzing: isAnalyzing,
      onClose: () => {
        setStreamingAnalysis('');
        setIsAnalyzing(false);
      }
    } : undefined}
  >
    <div className="h-full flex flex-col">
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm mb-4 flex items-center gap-2 mx-4 mt-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* AI Analysis Button */}
      <div className="p-4 border-b border-[#30363d]">
        <button
          onClick={analyzeRepository}
          disabled={isAnalyzing || repoContent.length === 0}
          className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Analyze Repository
            </>
          )}
        </button>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 overflow-hidden">
        {selectedFile ? (
          <CodeEditor
            code={fileContent}
            language={getLanguage(selectedFile.name)}
            height="100%"
            onChange={(newContent) => setFileContent(newContent || '')}
            readOnly={false}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-center flex-col">
            <Code className="w-16 h-16 text-[#7d8590] mb-4 opacity-50" />
            <p className="text-[#7d8590]">No file selected</p>
            <p className="text-[#7d8590] text-sm mt-2">Select a file from the Explorer to view its contents</p>
          </div>
        )}
      </div>
    </div>
  </IDELayout>
);
}