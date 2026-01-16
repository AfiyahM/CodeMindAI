'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface SpeechToTextOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onError?: (error: string) => void;
  onFinalResult?: (transcript: string) => void;
}

export default function useSpeechToText(options: SpeechToTextOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for Speech Recognition API support
      const SpeechRecognition = 
        window.SpeechRecognition || 
        window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();
        
        const recognition = recognitionRef.current;
        recognition.continuous = false;  // Better for commands - single utterance
        recognition.interimResults = false;  // Only get final results
        recognition.lang = options.lang || 'en-US';
        recognition.maxAlternatives = 1;  // Get best match

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };
        
        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setTranscript(prev => (prev + finalTranscript).trim());
            setInterimTranscript('');
            // Trigger callback when final transcript is received (sentence complete)
            if (options.onFinalResult) {
              options.onFinalResult((transcript + finalTranscript).trim());
            }
          } else {
            setInterimTranscript(interimTranscript);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript('');
        };
        
        recognition.onerror = (event: any) => {
          const errorMessage = event.error || 'Unknown error';
          console.error("Speech recognition error", errorMessage);
          setError(errorMessage);
          setIsListening(false);
          
          if (options.onError) {
            options.onError(errorMessage);
          }
        };
      } else {
        setIsSupported(false);
        setError('Speech recognition is not supported in this browser');
      }
    }
  }, [options.lang, options.continuous, options.interimResults, options.onError]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported');
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        setTranscript('');
        setInterimTranscript('');
        setError(null);
        recognitionRef.current.start();
      } catch (err: any) {
        console.error('Error starting speech recognition:', err);
        setError(err.message || 'Failed to start listening');
      }
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err: any) {
        console.error('Error stopping speech recognition:', err);
      }
    }
  }, [isListening]);

  const reset = useCallback(() => {
    stopListening();
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, [stopListening]);

  return { 
    isListening, 
    transcript: transcript + (interimTranscript ? ' ' + interimTranscript : ''), 
    finalTranscript: transcript,
    interimTranscript,
    error,
    isSupported,
    startListening, 
    stopListening,
    reset,
    setTranscript 
  };
}