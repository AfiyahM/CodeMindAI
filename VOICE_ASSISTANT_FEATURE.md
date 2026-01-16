# Voice Assistant Feature Documentation

## Overview

The voice assistant feature has been successfully implemented in CodeMindAI, providing both **Speech-to-Text** (STT) and **Text-to-Speech** (TTS) capabilities for a complete voice interaction experience.

## Features

### ✅ Speech-to-Text (Voice Input)
- **Browser-based voice recognition** using Web Speech API
- Real-time transcription with interim results
- Continuous listening mode
- Visual feedback with pulsing microphone button
- Error handling and browser compatibility checks

### ✅ Text-to-Speech (Voice Output)
- **Browser-based speech synthesis** using Web Speech Synthesis API
- Automatic reading of AI responses (optional)
- Manual playback controls (play/pause/stop)
- Per-message voice controls
- Customizable voice settings

### ✅ Voice Settings
- **Auto-speak toggle** - Automatically read AI responses
- **Voice selection** - Choose from available system voices
- **Speech rate** - Adjust speed (0.5x - 2.0x)
- **Speech pitch** - Adjust pitch (0.5 - 2.0)
- **Speech volume** - Adjust volume (0% - 100%)
- Settings persist in localStorage

## Implementation Details

### Files Created/Modified

#### New Files:
1. **`client/hooks/useTextToSpeech.ts`**
   - Custom hook for text-to-speech functionality
   - Manages speech synthesis, voice selection, and playback controls

2. **`client/lib/voiceSettings.ts`**
   - Context provider for voice settings
   - Manages persistent voice preferences

3. **`client/components/providers/VoiceSettingsProvider.tsx`**
   - Client component wrapper for voice settings provider

#### Modified Files:
1. **`client/hooks/useSpeechToText.ts`**
   - Enhanced with better error handling
   - Added browser compatibility checks
   - Improved interim results handling

2. **`client/components/views/AIChatView.tsx`**
   - Integrated TTS controls in header
   - Added per-message voice playback buttons
   - Integrated voice settings from context
   - Enhanced microphone button with error feedback

3. **`client/components/views/SettingsView.tsx`**
   - Added comprehensive voice settings section
   - Voice selection dropdown
   - Sliders for rate, pitch, and volume

4. **`client/app/layout.tsx`**
   - Added VoiceSettingsProvider wrapper

5. **`server/routes/ai.js`**
   - Added placeholder endpoint for future server-side voice processing

## Usage

### Voice Input (Speech-to-Text)

1. **Click the microphone button** in the chat input area
2. **Speak your question** - the button will pulse red while listening
3. **Your speech is transcribed** in real-time to the input field
4. **Click the microphone again** or send the message to stop listening

**Note:** Requires browser microphone permissions and Web Speech API support (Chrome, Edge, Safari).

### Voice Output (Text-to-Speech)

#### Auto-Speak Mode:
1. **Enable auto-speak** via the volume icon in the chat header
2. **AI responses will automatically be read aloud** when received

#### Manual Playback:
1. **Hover over any AI message** to see the voice button
2. **Click the voice button** to read that specific message
3. **Use header controls** to pause/resume/stop playback

### Voice Settings

1. **Open Settings** (gear icon in activity bar)
2. **Navigate to "Voice Assistant" section**
3. **Adjust settings:**
   - Toggle auto-speak on/off
   - Select preferred voice
   - Adjust speech rate, pitch, and volume
4. **Settings are saved automatically**

## Browser Compatibility

### Speech-to-Text (Web Speech API)
- ✅ Chrome/Edge (Chromium) - Full support
- ✅ Safari - Full support
- ⚠️ Firefox - Limited support (may require flags)
- ❌ Other browsers - Not supported

### Text-to-Speech (Web Speech Synthesis API)
- ✅ Chrome/Edge - Full support
- ✅ Safari - Full support
- ✅ Firefox - Full support
- ✅ Most modern browsers - Supported

## Technical Architecture

```
┌─────────────────────────────────────────┐
│         AIChatView Component            │
│  ┌───────────────────────────────────┐  │
│  │  useSpeechToText Hook            │  │
│  │  - Browser Web Speech API        │  │
│  │  - Real-time transcription       │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  useTextToSpeech Hook            │  │
│  │  - Browser Speech Synthesis API  │  │
│  │  - Voice playback controls       │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  VoiceSettings Context           │  │
│  │  - Persistent settings           │  │
│  │  - Shared across components      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Future Enhancements

### Potential Improvements:
1. **Server-side voice processing**
   - Use Google Cloud Speech-to-Text or AWS Transcribe
   - Better accuracy and language support
   - Offline capability

2. **Voice commands**
   - "Stop", "Repeat", "Slower", "Faster"
   - Navigation commands

3. **Multi-language support**
   - Language detection
   - Automatic language switching

4. **Voice activity detection**
   - Auto-start/stop listening
   - Noise cancellation

5. **Audio recording**
   - Record and save voice interactions
   - Playback history

## Troubleshooting

### Microphone not working:
- Check browser permissions (Settings > Privacy > Microphone)
- Ensure HTTPS connection (required for microphone access)
- Try a different browser (Chrome/Edge recommended)

### Voice not speaking:
- Check browser console for errors
- Verify voice settings are configured
- Try selecting a different voice
- Check system volume

### Settings not saving:
- Check browser localStorage is enabled
- Clear browser cache and try again

## API Endpoints

### Existing:
- `POST /api/ai/chat` - Chat endpoint (used by voice assistant)

### New (Placeholder):
- `POST /api/ai/voice/transcribe` - Server-side transcription (not yet implemented)

## Dependencies

No additional npm packages required! The implementation uses:
- Native browser APIs (Web Speech API, Speech Synthesis API)
- React hooks and context API
- localStorage for persistence

## Summary

The voice assistant feature is now fully functional and integrated into CodeMindAI. Users can:
- ✅ Speak their questions instead of typing
- ✅ Listen to AI responses automatically or on-demand
- ✅ Customize voice settings to their preferences
- ✅ Enjoy a hands-free coding assistant experience

All features work entirely client-side using browser APIs, ensuring privacy and no additional server costs.
