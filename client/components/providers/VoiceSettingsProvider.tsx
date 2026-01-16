'use client';

import { VoiceSettingsProvider as BaseProvider } from '../../lib/voiceSettings';

export default function VoiceSettingsProvider({ children }: { children: React.ReactNode }) {
  return <BaseProvider>{children}</BaseProvider>;
}
