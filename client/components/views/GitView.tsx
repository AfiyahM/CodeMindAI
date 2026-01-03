'use client';

import { GitBranch, GitCommit, GitPullRequest } from 'lucide-react';

export default function GitView() {
  return (
    <div className="h-full flex flex-col bg-[#252526] p-3">
      <style jsx>{`
        .git-section {
          margin-bottom: 16px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 0;
          margin-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #858585;
          transition: all 0.2s ease;
        }

        .section-header:hover {
          color: #cccccc;
        }

        .git-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: #cccccc;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .git-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .branch-name {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          color: #0ea5e9;
          font-weight: 500;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 2px 6px;
          background: rgba(14, 165, 233, 0.2);
          color: #0ea5e9;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
        }
      `}</style>

      <div className="git-section">
        <div className="section-header">
          <GitBranch size={14} />
          Current Branch
        </div>
        <div className="git-item">
          <div className="w-3 h-3 rounded-full bg-[#0ea5e9]" />
          <span className="branch-name">main</span>
          <div className="ml-auto badge">Local</div>
        </div>
      </div>

      <div className="git-section">
        <div className="section-header">
          <GitCommit size={14} />
          Recent Commits
        </div>
        <div className="space-y-2">
          <div className="git-item">
            <span className="text-[#858585]">feat:</span>
            <span>Add IDE enhancements</span>
          </div>
          <div className="git-item">
            <span className="text-[#858585]">fix:</span>
            <span>Update component styling</span>
          </div>
          <div className="git-item">
            <span className="text-[#858585]">docs:</span>
            <span>Update README</span>
          </div>
        </div>
      </div>

      <div className="git-section">
        <div className="section-header">
          <GitPullRequest size={14} />
          Pull Requests
        </div>
        <div className="text-[#858585] text-[12px] px-2 py-4">
          No open pull requests
        </div>
      </div>
    </div>
  );
}
