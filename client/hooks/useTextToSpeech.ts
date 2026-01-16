'use client';

import { useState, useRef, useEffect } from 'react';

interface VoiceSettings {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

export default function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthRef = useRef<typeof window.speechSynthesis | null>(null);

  // Initialize voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        // Auto-select a good default voice (prefer English, natural-sounding)
        if (!selectedVoice && voices.length > 0) {
          const preferredVoice = voices.find(
            v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Premium'))
          ) || voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en')) || voices[0];
          
          setSelectedVoice(preferredVoice);
        }
      };

      // Load voices immediately
      loadVoices();

      // Some browsers load voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, [selectedVoice]);

  const speak = (text: string, settings: VoiceSettings = {}) => {
    if (!synthRef.current) {
      console.warn('Speech synthesis not available');
      return;
    }

    // Stop any ongoing speech
    stop();

    // Clean text for better speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '[code block]') // Replace code blocks
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/#{1,6}\s+/g, '') // Remove markdown headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links
      .replace(/\n{3,}/g, '\n\n') // Reduce excessive newlines
      .replace(/\b(API|HTTP|GET|POST|PUT|DELETE)\b/g, 'A P I') // Spell out acronyms
      .replace(/\b(AI|IDE|UI|UX)\b/g, (match) => match.split('').join(' ')) // Spell out acronyms
      .replace(/(\d+)(st|nd|rd|th)/g, '$1') // Remove ordinal suffixes
      .replace(/\b([A-Z][a-z]+)\b(?=[A-Z])/g, '$1') // Fix camelCase word breaks
      .trim();

    if (!cleanText) {
      console.warn('No text to speak after cleaning');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Apply settings with better defaults
    utterance.rate = Math.max(0.5, Math.min(2.0, settings.rate ?? 1.0));
    utterance.pitch = Math.max(0.5, Math.min(2.0, settings.pitch ?? 1.0));
    utterance.volume = Math.max(0.1, Math.min(1.0, settings.volume ?? 1.0));
    utterance.voice = settings.voice ?? selectedVoice;
    
    // Add pauses for better speech flow
    utterance.text = cleanText.replace(/([.!?])\s*/g, '$1...'); // Add pauses at punctuation

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    // Speak
    synthRef.current.speak(utterance);
  };

  const pause = () => {
    if (synthRef.current && isSpeaking && !isPaused) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (synthRef.current && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    }
  };

  return {
    isSpeaking,
    isPaused,
    availableVoices,
    selectedVoice,
    setSelectedVoice,
    speak,
    pause,
    resume,
    stop,
  };
}
