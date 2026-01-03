'use client';

import { Palette, Volume2, Bell, Eye } from 'lucide-react';
import { useState } from 'react';

export default function SettingsView() {
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState(12);
  const [notifications, setNotifications] = useState(true);
  const [minimap, setMinimap] = useState(true);

  return (
    <div className="h-full flex flex-col bg-[#252526] overflow-hidden">
      <style jsx>{`
        .settings-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .settings-content::-webkit-scrollbar {
          width: 8px;
        }

        .settings-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .settings-content::-webkit-scrollbar-thumb {
          background: rgba(128, 128, 128, 0.3);
          border-radius: 4px;
        }

        .settings-content::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 128, 128, 0.5);
        }

        .settings-section {
          margin-bottom: 24px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #0ea5e9;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .setting-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px;
          margin-bottom: 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.02);
          transition: all 0.2s ease;
        }

        .setting-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .setting-label {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 12px;
          color: #cccccc;
        }

        .setting-description {
          font-size: 11px;
          color: #858585;
        }

        .toggle-switch {
          position: relative;
          width: 36px;
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .toggle-switch.active {
          background: #0ea5e9;
          border-color: #0ea5e9;
        }

        .toggle-switch::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .toggle-switch.active::after {
          transform: translateX(16px);
        }

        .select-control {
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: #cccccc;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .select-control:hover {
          border-color: #0ea5e9;
          background: rgba(14, 165, 233, 0.1);
        }

        .slider {
          width: 80px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background: #0ea5e9;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 8px rgba(14, 165, 233, 0.5);
        }

        .slider-value {
          font-size: 11px;
          color: #858585;
          min-width: 30px;
          text-align: right;
        }
      `}</style>

      <div className="settings-content">
        <div className="settings-section">
          <div className="section-title">
            <Palette size={14} />
            Appearance
          </div>
          <div className="setting-item">
            <div className="setting-label">
              <span>Theme</span>
              <span className="setting-description">Choose color scheme</span>
            </div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="select-control"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <span>Font Size</span>
              <span className="setting-description">Editor font size in pixels</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="range"
                min="10"
                max="18"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="slider"
              />
              <span className="slider-value">{fontSize}px</span>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <span>Minimap</span>
              <span className="setting-description">Show code minimap</span>
            </div>
            <button
              onClick={() => setMinimap(!minimap)}
              className={`toggle-switch ${minimap ? 'active' : ''}`}
            />
          </div>
        </div>

        <div className="settings-section">
          <div className="section-title">
            <Bell size={14} />
            Notifications
          </div>
          <div className="setting-item">
            <div className="setting-label">
              <span>Enable Notifications</span>
              <span className="setting-description">Show desktop notifications</span>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`toggle-switch ${notifications ? 'active' : ''}`}
            />
          </div>
        </div>

        <div className="settings-section">
          <div className="section-title">
            <Volume2 size={14} />
            Sound
          </div>
          <div className="setting-item">
            <div className="setting-label">
              <span>Sound Effects</span>
              <span className="setting-description">Play UI sounds</span>
            </div>
            <button className="toggle-switch active" />
          </div>
        </div>

        <div className="settings-section">
          <div className="section-title">
            <Eye size={14} />
            Editor
          </div>
          <div className="setting-item">
            <div className="setting-label">
              <span>Word Wrap</span>
              <span className="setting-description">Wrap long lines</span>
            </div>
            <button className="toggle-switch active" />
          </div>
          <div className="setting-item">
            <div className="setting-label">
              <span>Line Numbers</span>
              <span className="setting-description">Show line numbers</span>
            </div>
            <button className="toggle-switch active" />
          </div>
        </div>
      </div>
    </div>
  );
}
