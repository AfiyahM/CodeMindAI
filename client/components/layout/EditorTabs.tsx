'use client';

import { X } from 'lucide-react';

export interface EditorTab {
  id: string;
  name: string;
  language?: string;
  isDirty?: boolean;
}

interface EditorTabsProps {
  tabs: EditorTab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

export default function EditorTabs({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose
}: EditorTabsProps) {
  return (
    <div className="h-10 bg-gradient-to-r from-[#2d2d30] to-[#1e1e1e] border-b border-[#3e3e42]/50 flex items-center gap-1 px-2 overflow-x-auto scroll-smooth shadow-md">
      <style jsx>{`
        ::-webkit-scrollbar {
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(128, 128, 128, 0.3);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 128, 128, 0.5);
        }

        .editor-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: transparent;
          border-radius: 4px 4px 0 0;
          cursor: pointer;
          font-size: 12px;
          color: #858585;
          user-select: none;
          white-space: nowrap;
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          height: 100%;
        }

        .editor-tab:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #cccccc;
        }

        .editor-tab.active {
          background: linear-gradient(to bottom, rgba(37, 37, 38, 1), rgba(30, 30, 30, 1));
          color: #cccccc;
          border-bottom-color: #0ea5e9;
          box-shadow: inset 0 -2px 0 #0ea5e9;
        }

        .editor-tab.active::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #0ea5e9, transparent);
          border-radius: 2px;
          opacity: 0.5;
        }

        .tab-name {
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 500;
        }

        .tab-dirty {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #0ea5e9;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .close-btn {
          padding: 2px 4px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
        }

        .editor-tab:hover .close-btn {
          opacity: 1;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .close-btn:active {
          transform: scale(0.9);
        }
      `}</style>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`editor-tab relative ${activeTabId === tab.id ? 'active' : ''}`}
          onClick={() => onTabClick(tab.id)}
        >
          <span className="tab-name">{tab.name}</span>

          {tab.isDirty && <div className="tab-dirty" />}

          <button
            className="close-btn"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
