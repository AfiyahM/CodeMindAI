'use client';

import { Zap } from 'lucide-react';

interface StatusBarProps {
  line?: number;
  column?: number;
  language?: string;
  branch?: string;
  aiStatus?: 'idle' | 'processing' | 'ready';
}

export default function StatusBar({
  line = 1,
  column = 1,
  language = 'typescript',
  branch = 'main',
  aiStatus = 'ready'
}: StatusBarProps) {
  return (
    <div className="h-7 bg-gradient-to-r from-[#007acc]/30 via-[#1e1e1e] to-[#1e1e1e] border-t border-[#3e3e42]/50 flex items-center px-4 gap-6 text-[11px] shadow-lg">
      <style jsx>{`
        .status-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 8px;
          cursor: pointer;
          border-radius: 3px;
          transition: all 0.2s ease;
          color: #858585;
        }

        .status-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #cccccc;
        }

        .status-item.active {
          color: #0ea5e9;
          background: rgba(14, 165, 233, 0.1);
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .status-indicator.idle {
          background-color: #858585;
        }

        .status-indicator.processing {
          background-color: #fbbf24;
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .status-indicator.ready {
          background-color: #34d399;
          box-shadow: 0 0 8px rgba(52, 211, 153, 0.5);
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .divider {
          width: 1px;
          height: 16px;
          background: rgba(255, 255, 255, 0.1);
        }

        .status-text {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-weight: 500;
        }
      `}</style>

      <div className="status-item">
        <div className={`status-indicator ${aiStatus}`} />
        <span className="status-text">
          {aiStatus === 'idle' && 'AI Ready'}
          {aiStatus === 'processing' && 'AI Processing...'}
          {aiStatus === 'ready' && 'AI Active'}
        </span>
      </div>

      <div className="divider" />

      <div className="status-item">
        <span className="status-text">Ln {line}</span>
      </div>

      <div className="status-item">
        <span className="status-text">Col {column}</span>
      </div>

      <div className="divider" />

      <div className="status-item active">
        <span className="status-text uppercase">{language}</span>
      </div>

      <div className="flex-1" />

      <div className="status-item">
        <span className="status-text">🌿 {branch}</span>
      </div>

      <div className="divider" />

      <div className="status-item">
        <Zap size={12} />
        <span className="status-text">1.5s</span>
      </div>
    </div>
  );
}
