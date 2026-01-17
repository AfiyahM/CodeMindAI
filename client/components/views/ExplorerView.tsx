'use client';

import { FolderOpen, Folder, File, ChevronRight, ChevronDown } from 'lucide-react';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  icon?: string;
}

interface ExplorerViewProps {
  files: FileNode[];
  expandedDirs: Record<string, boolean>;
  onFileClick: (file: FileNode) => void;
  onDirToggle: (path: string) => void;
  selectedFile: FileNode | null;
  currentPath?: string;
  onNavigateToPath?: (path: string) => void;
}

function FileTreeItem({
  file,
  expanded,
  selected,
  onFileClick,
  onDirToggle,
  expandedDirs,
  depth = 0,
  selectedFile
}: {
  file: FileNode;
  expanded: boolean;
  selected: boolean;
  onFileClick: (file: FileNode) => void;
  onDirToggle: (path: string) => void;
  expandedDirs: Record<string, boolean>;
  depth?: number;
  selectedFile?: FileNode | null;
}) {
  const isDirectory = file.type === 'directory';
  const hasChildren = file.children && file.children.length > 0;
  const isExpanded = expanded && hasChildren;

  return (
    <div key={file.id} className="select-none">
      <div
        className={`flex items-center gap-1.5 px-1 py-0.5 cursor-pointer transition-colors duration-75 ${
          selected
            ? 'bg-[#094771] text-[#cccccc]'
            : 'text-[#cccccc] hover:bg-[#2a2d2e]'
        }`}
        style={{ paddingLeft: `${4 + depth * 18}px` }}
        onClick={() => {
          if (isDirectory) {
            onDirToggle(file.id);
          } else {
            onFileClick(file);
          }
        }}
      >
        {/* Tree lines and spacing */}
        {depth > 0 && (
          <div className="absolute left-0 w-full pointer-events-none" style={{ left: `${4 + (depth - 1) * 18}px`, width: '18px' }}>
            {/* Vertical line */}
            <div 
              className="absolute top-0 bottom-0 w-px bg-[#3e3e42]/40"
              style={{ left: '8px' }}
            />
          </div>
        )}

        {/* Chevron for directories */}
        {isDirectory ? (
          <>
            {hasChildren ? (
              <div className="flex-shrink-0 w-[18px] flex items-center justify-center">
                {isExpanded ? (
                  <ChevronDown size={12} className="text-[#858585]" />
                ) : (
                  <ChevronRight size={12} className="text-[#858585]" />
                )}
              </div>
            ) : (
              <div className="w-[18px] flex-shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen size={16} className="text-[#dcb939] flex-shrink-0" />
            ) : (
              <Folder size={16} className="text-[#dcb939] flex-shrink-0 opacity-70" />
            )}
          </>
        ) : (
          <>
            <div className="w-[18px] flex-shrink-0" />
            <File size={16} className="text-[#6ba3ff] flex-shrink-0" />
          </>
        )}
        <span className="text-[13px] flex-1 truncate font-normal leading-tight select-none">{file.name}</span>
      </div>

      {/* Render children with proper indentation */}
      {isDirectory && file.children && file.children.length > 0 && (
        <div className="relative">
          {file.children!.map((child, index) => {
            const isLastChild = index === file.children!.length - 1;
            const childExpanded = expandedDirs[child.id] || false;
            
            return (
              <div key={child.id} className="relative">
                {/* Tree line connector - horizontal line */}
                {!isLastChild && (
                  <div
                    className="absolute left-0 top-0 h-px bg-[#3e3e42]/40 z-0"
                    style={{
                      left: `${4 + depth * 18 + 8}px`,
                      width: '10px'
                    }}
                  />
                )}
                
                <FileTreeItem
                  file={child}
                  expanded={childExpanded}
                  selected={selectedFile?.id === child.id || false}
                  onFileClick={onFileClick}
                  onDirToggle={onDirToggle}
                  expandedDirs={expandedDirs}
                  depth={depth + 1}
                  selectedFile={selectedFile}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ExplorerView({
  files,
  expandedDirs,
  onFileClick,
  onDirToggle,
  selectedFile,
  currentPath = '',
  onNavigateToPath
}: ExplorerViewProps) {
  // Generate breadcrumb navigation
  const generateBreadcrumbs = () => {
    if (!currentPath) return [{ name: 'root', path: '' }];
    
    const parts = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'root', path: '' }];
    
    let currentPathSegment = '';
    parts.forEach((part, index) => {
      currentPathSegment += (currentPathSegment ? '/' : '') + part;
      breadcrumbs.push({
        name: part,
        path: currentPathSegment
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  return (
    <div className="h-full flex flex-col text-[#cccccc] overflow-hidden">
      <style jsx>{`
        .explorer-section {
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #858585;
          padding: 6px 8px;
          margin-bottom: 4px;
          transition: color 0.2s ease;
          user-select: none;
        }

        .section-title:hover {
          color: #cccccc;
        }

        .explorer-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 4px 0;
        }

        .explorer-content::-webkit-scrollbar {
          width: 10px;
        }

        .explorer-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .explorer-content::-webkit-scrollbar-thumb {
          background: rgba(128, 128, 128, 0.2);
          border-radius: 5px;
        }

        .explorer-content::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 128, 128, 0.3);
        }
      `}</style>
      
      <div className="explorer-content px-2">
        {/* Breadcrumb Navigation */}
        {currentPath && (
          <div className="explorer-section">
            <div className="section-title">NAVIGATION</div>
            <div className="flex items-center gap-1 px-2 py-1 text-xs text-[#858585] flex-wrap">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center gap-1">
                  {index > 0 && <span className="text-[#3e3e42]">/</span>}
                  <button
                    onClick={() => onNavigateToPath?.(crumb.path)}
                    className="hover:text-[#cccccc] transition-colors truncate max-w-24"
                    title={crumb.name}
                  >
                    {crumb.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      <div className="explorer-section">
        <div className="section-title">EXPLORER</div>
        <div className="space-y-0">
          {files.length === 0 && (
            <div className="text-[#858585] text-[12px] px-3 py-2">
              No open editors
            </div>
          )}
          {files.map((file) => (
            <FileTreeItem
              key={file.id}
              file={file}
              expanded={expandedDirs[file.id] || false}
              selected={selectedFile?.id === file.id}
              onFileClick={onFileClick}
              onDirToggle={onDirToggle}
              expandedDirs={expandedDirs}
              depth={0}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      </div>

      <div className="explorer-section">
        <div className="section-title">RECENT</div>
        <div className="text-[#858585] text-[12px] px-3 py-2">
          No recent files
        </div>
      </div>
      </div>
    </div>
  );
}
