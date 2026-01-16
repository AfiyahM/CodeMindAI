'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface VoiceSettings {
  autoSpeak: boolean;
  rate: number;
  pitch: number;
  volume: number;
  voiceName: string | null;
}

interface VoiceSettingsContextType {
  settings: VoiceSettings;
  updateSettings: (updates: Partial<VoiceSettings>) => void;
}

const defaultSettings: VoiceSettings = {
  autoSpeak: false,  // Disabled since controls are removed
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  voiceName: null,
};

const VoiceSettingsContext = createContext<VoiceSettingsContextType | undefined>(undefined);

export function VoiceSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('voiceSettings');
      if (saved) {
        try {
          return { ...defaultSettings, ...JSON.parse(saved) };
        } catch {
          return defaultSettings;
        }
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('voiceSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<VoiceSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return (
    <VoiceSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </VoiceSettingsContext.Provider>
  );
}

export function useVoiceSettings() {
  const context = useContext(VoiceSettingsContext);
  if (context === undefined) {
    throw new Error('useVoiceSettings must be used within a VoiceSettingsProvider');
  }
  return context;
}
