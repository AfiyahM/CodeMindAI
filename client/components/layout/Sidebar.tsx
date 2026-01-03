'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface SidebarProps {
  title: string;
  width?: number;
  onClose?: () => void;
  children: ReactNode;
}

export default function Sidebar({
  title,
  width = 250,
  onClose = () => {},
  children
}: SidebarProps) {
  return (
    <div
      className="flex flex-col h-full bg-[#252526] border-r border-[#3e3e42]/50 shadow-lg"
      style={{ width: `${width}px` }}
    >
      <style jsx>{`
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: linear-gradient(to bottom, rgba(45, 45, 48, 0.8), rgba(37, 37, 38, 0.8));
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }

        .sidebar-header:hover {
          background: linear-gradient(to bottom, rgba(50, 50, 54, 0.9), rgba(42, 42, 46, 0.9));
        }

        .sidebar-title {
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #cccccc;
          transition: color 0.2s ease;
        }

        .close-btn {
          padding: 4px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #858585;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #cccccc;
          transform: scale(1.1);
        }

        .close-btn:active {
          transform: scale(0.95);
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar-content::-webkit-scrollbar {
          width: 8px;
        }

        .sidebar-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-content::-webkit-scrollbar-thumb {
          background: rgba(128, 128, 128, 0.3);
          border-radius: 4px;
        }

        .sidebar-content::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 128, 128, 0.5);
        }
      `}</style>

      <div className="sidebar-header">
        <h2 className="sidebar-title">{title}</h2>
        <button
          onClick={onClose}
          className="close-btn"
          aria-label="Close sidebar"
        >
          <X size={16} />
        </button>
      </div>

      <div className="sidebar-content">
        {children}
      </div>
    </div>
  );
}
