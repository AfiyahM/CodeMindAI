'use client';

import { FolderOpen, File, ChevronRight, ChevronDown } from 'lucide-react';

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
}

function FileTreeItem({
  file,
  expanded,
  selected,
  onFileClick,
  onDirToggle
}: {
  file: FileNode;
  expanded: boolean;
  selected: boolean;
  onFileClick: (file: FileNode) => void;
  onDirToggle: (path: string) => void;
}) {
  const isDirectory = file.type === 'directory';

  return (
    <div key={file.id}>
      <div
        className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-all duration-150 rounded-sm ${
          selected
            ? 'bg-[#094771] text-[#cccccc]'
            : 'text-[#cccccc] hover:bg-[#3e3e42]/30'
        }`}
        onClick={() => {
          if (isDirectory) {
            onDirToggle(file.id);
          } else {
            onFileClick(file);
          }
        }}
      >
        {isDirectory ? (
          <>
            {expanded ? (
              <ChevronDown size={16} className="text-[#0ea5e9]" />
            ) : (
              <ChevronRight size={16} className="text-[#858585]" />
            )}
            <FolderOpen size={16} className="text-[#dcb939]" />
          </>
        ) : (
          <>
            <div className="w-4" />
            <File size={16} className="text-[#6ba3ff]" />
          </>
        )}
        <span className="text-[13px] flex-1 truncate font-medium">{file.name}</span>
      </div>

      {isDirectory && expanded && file.children && (
        <div className="ml-2 border-l border-[#3e3e42]/50">
          {file.children.map((child) => (
            <FileTreeItem
              key={child.id}
              file={child}
              expanded={true}
              selected={selected}
              onFileClick={onFileClick}
              onDirToggle={onDirToggle}
            />
          ))}
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
  selectedFile
}: ExplorerViewProps) {
  return (
    <div className="p-3 text-[#cccccc]">
      <style jsx>{`
        .explorer-section {
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #858585;
          padding: 8px 0 6px 8px;
          margin-bottom: 6px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: color 0.2s ease;
        }

        .section-title:hover {
          color: #cccccc;
        }
      `}</style>

      <div className="explorer-section">
        <div className="section-title">OPEN EDITORS</div>
        <div className="space-y-0.5">
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
  );
}
