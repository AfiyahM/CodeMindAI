'use client';

import { FileText, Search, GitBranch, Lightbulb, Zap, Settings, MoreHorizontal } from 'lucide-react';

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const activities = [
  { id: 'explorer', icon: FileText, label: 'Explorer', color: 'text-blue-400' },
  { id: 'search', icon: Search, label: 'Search', color: 'text-green-400' },
  { id: 'git', icon: GitBranch, label: 'Source Control', color: 'text-purple-400' },
  { id: 'mindmap', icon: Lightbulb, label: 'Mind Map', color: 'text-yellow-400' },
  { id: 'ai', icon: Zap, label: 'AI Assistant', color: 'text-orange-400' },
];

export default function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  return (
    <div className="w-14 bg-gradient-to-b from-[#2d2d30] to-[#1e1e1e] border-r border-[#3e3e42]/50 flex flex-col items-center py-4 gap-4 shadow-lg relative z-20">
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .activity-icon {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          position: relative;
        }

        .activity-icon:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: scale(1.1);
        }

        .activity-icon.active {
          background: rgba(14, 165, 233, 0.15);
          box-shadow: inset 0 0 0 2px rgba(14, 165, 233, 0.5), 0 0 15px rgba(14, 165, 233, 0.3);
        }

        .activity-icon.active::before {
          content: '';
          position: absolute;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          background: linear-gradient(to bottom, #0ea5e9, transparent);
          border-radius: 3px;
        }

        .tooltip {
          position: absolute;
          left: full;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transform: translateX(10px);
          transition: all 0.2s ease;
          z-index: 50;
        }

        .activity-icon:hover .tooltip {
          opacity: 1;
          transform: translateX(16px);
        }
      `}</style>

      <div className="flex flex-col gap-2">
        {activities.map(({ id, icon: Icon, label }) => (
          <div key={id} className="relative group">
            <button
              onClick={() => onViewChange(id)}
              className={`activity-icon ${activeView === id ? 'active' : ''}`}
              aria-label={label}
            >
              <Icon size={20} className={activeView === id ? 'text-[#0ea5e9]' : 'text-[#cccccc] group-hover:text-white'} />
              <div className="tooltip">{label}</div>
            </button>
          </div>
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex flex-col gap-2">
        <button
          onClick={() => {}}
          className="activity-icon hover:bg-[#3e3e42]/50"
          aria-label="More"
        >
          <MoreHorizontal size={20} className="text-[#858585] hover:text-[#cccccc]" />
          <div className="tooltip">More</div>
        </button>

        <button
          onClick={() => {}}
          className="activity-icon hover:bg-[#3e3e42]/50"
          aria-label="Settings"
        >
          <Settings size={20} className="text-[#858585] hover:text-[#cccccc]" />
          <div className="tooltip">Settings</div>
        </button>
      </div>
    </div>
  );
}
