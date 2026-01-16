'use client';

import { Network } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FileNode } from './ExplorerView';

interface TriggerGeneration {
  type: 'flowchart' | 'mindmap' | null;
  timestamp?: number;
}

interface MindMapViewProps {
  selectedFileContent?: string | null;
  triggerGeneration?: TriggerGeneration;
  onGenerateVisualization?: (node: FileNode, type: 'flowchart' | 'mindmap') => void;
}

export default function MindMapView({ selectedFileContent = null, triggerGeneration, onGenerateVisualization }: MindMapViewProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    if (triggerGeneration && triggerGeneration.type && triggerGeneration.timestamp) {
      // A simple hook point: when triggerGeneration changes, we could auto-generate
      // For now, just log — the parent can call onGenerateVisualization when needed.
      console.log('[MindMapView] triggerGeneration', triggerGeneration.type, triggerGeneration.timestamp);
    }
  }, [triggerGeneration]);

  return (
    <div className="h-full flex flex-col bg-[#252526] overflow-hidden">
      <style jsx>{`
        .mindmap-header {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: linear-gradient(to bottom, rgba(45, 45, 48, 0.8), rgba(37, 37, 38, 0.6));
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #cccccc;
        }

        .mindmap-canvas {
          flex: 1;
          overflow: auto;
          padding: 20px;
          background: linear-gradient(135deg, rgba(30, 30, 30, 0.5) 0%, rgba(20, 20, 20, 0.3) 100%);
          position: relative;
        }

        .mindmap-canvas::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 50%);
          pointer-events: none;
        }

        .mindmap-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .mindmap-node {
          padding: 8px 12px;
          border-radius: 6px;
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(59, 130, 246, 0.1));
          border: 1px solid rgba(14, 165, 233, 0.4);
          color: #0ea5e9;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          position: relative;
          z-index: 10;
        }

        .mindmap-node:hover {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.3), rgba(59, 130, 246, 0.2));
          border-color: rgba(14, 165, 233, 0.6);
          transform: scale(1.05);
          box-shadow: 0 0 15px rgba(14, 165, 233, 0.3);
        }

        .mindmap-node.selected {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.4), rgba(59, 130, 246, 0.3));
          border-color: rgba(14, 165, 233, 0.8);
          box-shadow: 0 0 20px rgba(14, 165, 233, 0.5);
        }

        .mindmap-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          padding: 40px;
          align-content: center;
          height: 100%;
        }
      `}</style>

      <div className="mindmap-header">
        <Network size={16} />
        Mind Map
      </div>

      <div className="mindmap-canvas">
        {/* Optional small preview of the active file content for context */}
        {selectedFileContent ? (
          <div className="p-2 mb-2 text-xs text-[#9ca3af] border-b border-[#2d2d2d]">
            <strong className="text-sm text-[#ccc]">File Preview:</strong>
            <div className="truncate">{selectedFileContent.slice(0, 240)}</div>
          </div>
        ) : null}
        <div className="mindmap-grid">
          <div
            className={`mindmap-node ${selectedNode === 'feature1' ? 'selected' : ''}`}
            onClick={() => setSelectedNode('feature1')}
          >
            Component
          </div>
          <div
            className={`mindmap-node ${selectedNode === 'feature2' ? 'selected' : ''}`}
            onClick={() => setSelectedNode('feature2')}
          >
            Layout
          </div>
          <div
            className={`mindmap-node ${selectedNode === 'feature3' ? 'selected' : ''}`}
            onClick={() => setSelectedNode('feature3')}
          >
            Animation
          </div>
          <div
            className={`mindmap-node ${selectedNode === 'feature4' ? 'selected' : ''}`}
            onClick={() => setSelectedNode('feature4')}
          >
            Styling
          </div>
          <div className="mindmap-node" style={{ placeSelf: 'center' }}>
            IDE
          </div>
          <div
            className={`mindmap-node ${selectedNode === 'feature5' ? 'selected' : ''}`}
            onClick={() => setSelectedNode('feature5')}
          >
            Theme
          </div>
          <div
            className={`mindmap-node ${selectedNode === 'feature6' ? 'selected' : ''}`}
            onClick={() => setSelectedNode('feature6')}
          >
            Views
          </div>
          <div
            className={`mindmap-node ${selectedNode === 'feature7' ? 'selected' : ''}`}
            onClick={() => setSelectedNode('feature7')}
          >
            Editor
          </div>
          <div
            className={`mindmap-node ${selectedNode === 'feature8' ? 'selected' : ''}`}
            onClick={() => setSelectedNode('feature8')}
          >
            Performance
          </div>
        </div>
      </div>
    </div>
  );
}
