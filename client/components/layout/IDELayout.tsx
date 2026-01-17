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

interface TriggerGeneration {
  type: 'flowchart' | 'mindmap' | null;
  timestamp?: number;
}

interface IDELayoutProps {
  children?: ReactNode;
  files?: FileNode[];
  expandedDirs?: Record<string, boolean>;
  onFileClick?: (file: FileNode) => void;
  onDirToggle?: (path: string) => void;
  selectedFile?: FileNode | null;
  currentPath?: string;
  onNavigateToPath?: (path: string) => void;
  tabs?: EditorTab[];
  activeTabId?: string;
  onTabClick?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  fileContent?: string;
  visualizationTrigger?: TriggerGeneration;

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
  // Allow requesting visualizations from the layout (forwarded into MindMapView)
  onGenerateVisualization?: (node: FileNode, type: 'flowchart' | 'mindmap') => void;
}

export default function IDELayout({
  children,
  files = [],
  expandedDirs = {},
  onFileClick = () => {},
  onDirToggle = () => {},
  selectedFile = null,
  currentPath = '',
  onNavigateToPath = () => {},
  tabs = [],
  activeTabId = '',
  onTabClick = () => {},
  onTabClose = () => {},
  analysisPanel,
  statusBarProps = {},
  fileContent = '',
  visualizationTrigger = { type: null },
  onGenerateVisualization = () => {}
}: IDELayoutProps) {
  const [activeView, setActiveView] = useState<string>('explorer');
  const [showSidebar, setShowSidebar] = useState(true);

  // Right side AI panel
  const [showAI, setShowAI] = useState(false);

  // Mind map modal state
  const [showMindMap, setShowMindMap] = useState(false);

  // Show analysis panel above terminal
 const shouldShowAnalysisPanel =
  !!analysisPanel; 

  const handleActivityChange = (view: string) => {
    if (view === 'ai') {
      setShowAI(prev => !prev);
      return;
    }
    if (view === 'mindmap') {
      setShowMindMap(prev => !prev);
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
            currentPath={currentPath}
            onNavigateToPath={onNavigateToPath}
          />
        );
      case 'search':
        return <SearchView />;
      case 'git':
        return <GitView />;
      case 'mindmap':
        return (
          <div className="p-3 text-sm text-[#858585] text-center">
            Click the mind map button again to open the mind map view
          </div>
        );
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
                {analysisPanel?.isAnalyzing ? (
                  <div className="flex items-center gap-2 text-[#777]">
                    <span>Analyzing…</span>
                  </div>
                ) : (
                  <div className="text-sm whitespace-pre-wrap text-[#ddd] leading-relaxed">
                    {analysisPanel?.content && analysisPanel.content.trim() ? (
                      <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed">
                        {analysisPanel.content}
                      </pre>
                    ) : (
                      <div className="text-[#888] italic">
                        No analysis content available. Check console for details.
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TERMINAL ALWAYS AT BOTTOM */}
          <Panel />
        </div>

        {/* RIGHT SIDE AI CHAT PANEL */}
        {showAI && (
          <div className="w-[340px] h-full border-l border-[#333] bg-[#252526] shrink-0 overflow-hidden">
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

        {/* MIND MAP MODAL OVERLAY */}
        {showMindMap && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="w-[90%] h-[90%] max-w-6xl max-h-[90vh] bg-[#1e1e1e] rounded-lg shadow-2xl overflow-hidden">
              <MindMapView 
                selectedFileContent={selectedFile ? fileContent : null}
                triggerGeneration={visualizationTrigger}
                onGenerateVisualization={onGenerateVisualization}
                onClose={() => setShowMindMap(false)}
              />
            </div>
          </div>
        )}

      </div>

      <StatusBar {...statusBarProps} />
    </div>
  );
}
