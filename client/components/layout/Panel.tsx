'use client';

import { ReactNode } from 'react';
import { X, ChevronUp } from 'lucide-react';

interface PanelProps {
  onClose?: () => void;
  children?: ReactNode;
}

export default function Panel({ onClose = () => {} }: PanelProps) {
  return (
    <div className="h-48 bg-transparent border-t border-[#3e3e42]/50 flex flex-col shadow-2xl">

      <style jsx>{`
        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: linear-gradient(to bottom, rgba(45, 45, 48, 0.9), rgba(37, 37, 38, 0.8));
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease;
        }

        .panel-header:hover {
          background: linear-gradient(to bottom, rgba(50, 50, 54, 0.95), rgba(42, 42, 46, 0.9));
        }

        .panel-tabs {
          display: flex;
          gap: 2px;
        }

        .panel-tab {
          padding: 6px 12px;
          font-size: 12px;
          background: transparent;
          border: none;
          color: #858585;
          cursor: pointer;
          border-radius: 4px 4px 0 0;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .panel-tab:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #cccccc;
        }

        .panel-tab.active {
          background: rgba(14, 165, 233, 0.15);
          color: #0ea5e9;
          border-bottom: 2px solid #0ea5e9;
        }

        .panel-buttons {
          display: flex;
          gap: 4px;
        }

        .panel-btn {
          padding: 4px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #858585;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
        }

        .panel-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #cccccc;
          transform: scale(1.1);
        }

        .panel-btn:active {
          transform: scale(0.95);
        }

        .panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 12px 16px;
          font-size: 12px;
        }

        .panel-content::-webkit-scrollbar {
          width: 8px;
        }

        .panel-content::-webkit-scrollbar-track {
          background: rgba(30, 30, 30, 0.3);
        }

        .panel-content::-webkit-scrollbar-thumb {
          background: rgba(128, 128, 128, 0.3);
          border-radius: 4px;
        }

        .panel-content::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 128, 128, 0.5);
        }
      `}</style>

      <div className="panel-header">
        <div className="panel-tabs">
          <button className="panel-tab active">Problems</button>
          <button className="panel-tab">Output</button>
          <button className="panel-tab">Debug Console</button>
          <button className="panel-tab">Terminal</button>
        </div>

        <div className="panel-buttons">
          <button className="panel-btn" aria-label="Minimize">
            <ChevronUp size={16} />
          </button>
          <button className="panel-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="panel-content">
        <div className="text-[#858585] text-center py-6">
          <p className="mb-2">No problems detected</p>
          <p className="text-[11px] text-[#6d6d6d]">Linter: Ready</p>
        </div>
      </div>
    </div>
  );
}
