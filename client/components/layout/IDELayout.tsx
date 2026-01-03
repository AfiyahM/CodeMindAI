'use client';

import { useState, ReactNode } from 'react';
import ActivityBar from './ActivityBar';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import Panel from './Panel';
import EditorTabs, { EditorTab } from './EditorTabs';
import AIChatView from '../views/AIChatView';
import ExplorerView, { FileNode } from '../views/ExplorerView';
import SearchView from '../views/SearchView';
import GitView from '../views/GitView';
import MindMapView from '../views/MindMapView';
import SettingsView from '../views/SettingsView';

interface IDELayoutProps {
  children?: ReactNode;
  files?: FileNode[];
  expandedDirs?: Record<string, boolean>;
  onFileClick?: (file: FileNode) => void;
  onDirToggle?: (path: string) => void;
  selectedFile?: FileNode | null;
  tabs?: EditorTab[];
  activeTabId?: string;
  onTabClick?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;

  // Analysis panel
  analysisPanel?: {
    content: string;
    isAnalyzing?: boolean;
    onClose: () => void;
  };

  statusBarProps?: {
    line?: number;
    column?: number;
    language?: string;
    branch?: string;
    aiStatus?: 'idle' | 'processing' | 'ready';
  };
}

export default function IDELayout({
  children,
  files = [],
  expandedDirs = {},
  onFileClick = () => {},
  onDirToggle = () => {},
  selectedFile = null,
  tabs = [],
  activeTabId = '',
  onTabClick = () => {},
  onTabClose = () => {},
  analysisPanel,
  statusBarProps = {}
}: IDELayoutProps) {
  const [activeView, setActiveView] = useState<string>('explorer');
  const [showSidebar, setShowSidebar] = useState(true);

  // Right side AI panel
  const [showAI, setShowAI] = useState(false);

  // Show analysis panel above terminal
  const shouldShowAnalysisPanel =
    !!(analysisPanel && (analysisPanel.content || analysisPanel.isAnalyzing));

  const handleActivityChange = (view: string) => {
    if (view === 'ai') {
      setShowAI(prev => !prev);
      return;
    }
    setActiveView(view);
    setShowSidebar(true);
  };

  const renderSidebarContent = () => {
    switch (activeView) {
      case 'explorer':
        return (
          <ExplorerView
            files={files}
            expandedDirs={expandedDirs}
            onFileClick={onFileClick}
            onDirToggle={onDirToggle}
            selectedFile={selectedFile}
          />
        );
      case 'search':
        return <SearchView />;
      case 'git':
        return <GitView />;
      case 'mindmap':
        return <MindMapView />;
      case 'extensions':
        return (
          <div className="p-3 text-sm text-[#858585] text-center">
            Extensions coming soon.
          </div>
        );
      case 'settings':
        return <SettingsView />;
      default:
        return null;
    }
  };

  const getSidebarTitle = () => {
    switch (activeView) {
      case 'explorer': return 'Explorer';
      case 'search': return 'Search';
      case 'git': return 'Source Control';
      case 'mindmap': return 'Mind Map';
      case 'settings': return 'Settings';
      case 'extensions': return 'Extensions';
      default: return '';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-[#ccc] overflow-hidden">

      <div className="flex-1 flex overflow-hidden relative">

        {/* ACTIVITY BAR */}
        <ActivityBar
          activeView={showAI ? 'ai' : activeView}
          onViewChange={handleActivityChange}
        />

        {/* LEFT SIDEBAR */}
        {showSidebar && (
          <Sidebar
            title={getSidebarTitle()}
            width={activeView === 'mindmap' ? 400 : 250}
            onClose={() => setShowSidebar(false)}
          >
            <div className="h-full overflow-hidden">
              {renderSidebarContent()}
            </div>
          </Sidebar>
        )}

        {/* CENTER AREA */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Editor Tabs */}
          {tabs.length > 0 && (
            <EditorTabs
              tabs={tabs}
              activeTabId={activeTabId}
              onTabClick={onTabClick}
              onTabClose={onTabClose}
            />
          )}

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>

          {/* ANALYSIS PANEL ABOVE TERMINAL */}
          {shouldShowAnalysisPanel && (
            <div
              className="border-t border-[#333] bg-[#1e1e1e]"
              style={{ minHeight: 130, maxHeight: '45vh', display: 'flex', flexDirection: 'column' }}
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#333] bg-[#252526]">
                <span className="text-sm font-semibold text-[#ccc]">AI Analysis</span>

                <button
                  onClick={analysisPanel?.onClose}
                  className="text-[#888] hover:text-[#fff]"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {analysisPanel?.content ? (
                  <pre className="text-sm whitespace-pre-wrap">
                    {analysisPanel.content}
                  </pre>
                ) : (
                  <span className="text-[#777]">
                    {analysisPanel?.isAnalyzing ? 'Analyzing…' : 'No analysis yet.'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TERMINAL ALWAYS AT BOTTOM */}
          <Panel />
        </div>

        {/* RIGHT SIDE AI CHAT PANEL */}
        {showAI && (
          <div className="w-[340px] h-full border-l border-[#333] bg-[#252526] flex-shrink-0 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#333] bg-[#bd0b0b]">
              <span className="text-sm font-semibold text-[#e6edf3]">
                AI Assistant
              </span>

              <button
                onClick={() => setShowAI(false)}
                className="text-[#888] hover:text-[#fff]"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <AIChatView />
            </div>
          </div>
        )}

      </div>

      <StatusBar {...statusBarProps} />
    </div>
  );
}
