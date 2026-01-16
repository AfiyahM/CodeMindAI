'use client';

import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface VoiceAssistantProps {
  onTranscript: (text: string) => void;
  onResponse: (text: string) => void;
  isEnabled?: boolean;
}

export default function VoiceAssistant({ onTranscript, onResponse, isEnabled = true }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition && SpeechSynthesis) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, [onTranscript]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        console.log('Speech finished');
      };
      
      utterance.onerror = (event: any) => {
        console.error('Speech synthesis error:', event);
      };
      
      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // Auto-speak responses
    if (onResponse) {
      const originalResponse = onResponse;
      onResponse = (text: string) => {
        originalResponse(text);
        speak(text);
      };
    }
  }, [onResponse]);

  const toggleListening = () => {
    if (!isSupported || !isEnabled) return;
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-300 text-sm">
        Voice assistant is not supported in your browser. Please use Chrome, Edge, or Safari.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-[#cccccc] mb-2">Voice Assistant</h3>
        <p className="text-sm text-[#858585]">
          Click the microphone to give voice commands
        </p>
      </div>
      
      <button
        onClick={toggleListening}
        disabled={!isEnabled}
        className={`p-4 rounded-full transition-all duration-200 ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600'
        } ${!isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
      >
        {isListening ? (
          <MicOff size={24} className="text-white" />
        ) : (
          <Mic size={24} className="text-white" />
        )}
      </button>
      
      {isListening && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          Listening...
        </div>
      )}
      
      <div className="text-xs text-[#858585] text-center max-w-xs">
        <p className="mb-1">Supported commands:</p>
        <ul className="text-left space-y-1">
          <li>• "Open file [filename]"</li>
          <li>• "Create file [filename]"</li>
          <li>• "Analyze code"</li>
          <li>• "Explain function"</li>
          <li>• "Generate mind map"</li>
        </ul>
      </div>
    </div>
  );
}
