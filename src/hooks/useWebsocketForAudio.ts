/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useChatStore } from '../store/useChatStore';

const WS_URL = 'ws://localhost:8000/ws/chat';

export const useWebsocketForAudio = () => {
  const { 
    setIsListening, 
    isListening, 
    setLoading, 
    setResponse, 
    setError,
    setQuery
  } = useChatStore();

  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    // Check if MediaRecorder is supported in this environment
    setIsSupported(
      typeof window !== 'undefined' && 
      !!window.navigator?.mediaDevices?.getUserMedia &&
      !!window.MediaRecorder
    );
  }, []);

  const startRecording = useCallback(async () => {
    try {
      // Reset State
      setError(null);
      setQuery(''); // Clear previous text query
      
      // Open WebSocket
      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      // Handle Socket Events
      socket.onopen = async () => {
        console.log('WebSocket Connected');
        setIsListening(true);
        
        try {
          // Get Audio Stream
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          
          // Initialize Recorder (WebM/Opus is standard and efficient)
          const mediaRecorder = new MediaRecorder(stream, { 
            mimeType: 'audio/webm;codecs=opus' 
          });
          mediaRecorderRef.current = mediaRecorder;

          // Send Chunks as they become available
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
              socket.send(event.data);
            }
          };

          // Handle Recorder Errors
          mediaRecorder.onerror = (event: any) => {
            console.error('MediaRecorder Error:', event.error);
            setError('Microphone recording error.');
            stopRecording();
          };

          // Start recording with 250ms timeslices for streaming
          mediaRecorder.start(250);

        } catch (err) {
          console.error('Microphone Access Error:', err);
          setError('Could not access microphone.');
          socket.close();
          setIsListening(false);
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.error) {
            setError(data.error);
          } else {
            setResponse(data.answer, data.context);
          }
        } catch (e) {
          console.error('JSON Parse Error:', e);
          setError('Invalid response from server.');
        } finally {
          socket.close();
        }
      };

      socket.onerror = (event) => {
        console.error('WebSocket Error:', event);
        // Only set error if we aren't already closing normally
        if (isListening) { 
            setError('Connection to audio server failed.');
            setIsListening(false);
        }
      };

      socket.onclose = () => {
        console.log('WebSocket Disconnected');
        // Ensure listening state is off
        setIsListening(false);
      };

    } catch (err) {
      console.error('Setup Error:', err);
      setError('Failed to initialize voice chat.');
    }
  }, [setError, setIsListening, setQuery, setResponse]);

  const stopRecording = useCallback(() => {
    // Stop Recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      // Stop all tracks to release the red "recording" indicator in browser
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    // Signal Server to Process
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send("END");
      // We are now waiting for the response
      setLoading(true);
    }

    setIsListening(false);
  }, [setIsListening, setLoading]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isListening, startRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return { toggleListening, isSupported };
};