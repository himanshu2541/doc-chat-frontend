/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/useChatStore';

// Type definition for Web Speech API
interface IWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}
declare const window: IWindow;

export const useSpeechToText = () => {
  const { setQuery, sendMessage, setIsListening, isListening } = useChatStore();
  const recognitionRef = useRef<any>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    // Check support on mount
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Stop after one sentence
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log("Microphone started");
        setIsListening(true);
      };

      recognition.onend = () => {
        console.log("Microphone stopped");
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("Speech result:", transcript);
        
        if (transcript) {
            setQuery(transcript);
            sendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        // Log the specific error code to the console
        console.error("Speech API Error Type:", event.error);

        // Handle specific error cases for better debugging
        switch (event.error) {
            case 'not-allowed':
                alert("Microphone permission denied. Please allow access in browser settings.");
                break;
            case 'no-speech':
                console.warn("No speech was detected. Please try again.");
                break;
            case 'network':
                console.error("Network error: Check your internet connection (required for Chrome speech API).");
                break;
            case 'aborted':
                console.warn("Listening was aborted.");
                break;
            case 'service-not-allowed':
                console.error("Speech service not allowed. Ensure your browser allows this service.");
                break;
            default:
                console.error("Unknown Speech API error:", event);
        }
        
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    // Cleanup function to prevent memory leaks or zombie listeners
    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }
    };
  }, [setQuery, sendMessage, setIsListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
        alert("Speech recognition is not supported in this browser.");
        return;
    }

    try {
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    } catch (err) {
        console.error("Error toggling speech:", err);
        // Sometimes calling start() while already starting throws an error, reset state if needed
        setIsListening(false);
    }
  };

  return { toggleListening, isSupported };
};