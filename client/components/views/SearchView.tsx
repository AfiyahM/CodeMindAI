'use client';

import { Search } from 'lucide-react';

export default function SearchView() {
  return (
    <div className="h-full flex flex-col bg-[#252526]">
      <style jsx>{`
        .search-input-container {
          padding: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: linear-gradient(to bottom, rgba(45, 45, 48, 0.8), rgba(37, 37, 38, 0.6));
        }

        .search-input {
          width: 100%;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: #cccccc;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: #0ea5e9;
          box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2);
        }

        .search-input::placeholder {
          color: #858585;
        }

        .search-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 12px;
          color: #858585;
        }

        .empty-icon {
          opacity: 0.3;
        }
      `}</style>

      <div className="search-input-container">
        <div className="flex items-center gap-2 relative">
          <Search size={16} className="text-[#858585] absolute left-3" />
          <input
            type="text"
            placeholder="Search files..."
            className="search-input pl-8"
          />
        </div>
      </div>

      <div className="search-content">
        <div className="empty-state">
          <Search size={40} className="empty-icon" />
          <p className="text-center text-[13px]">
            Enter a search term to find files
          </p>
        </div>
      </div>
    </div>
  );
}
