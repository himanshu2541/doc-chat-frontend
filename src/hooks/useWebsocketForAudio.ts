/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from "react";
import { useChatStore } from "../store/useChatStore";

const WS_URL = "ws://localhost:8000/ws/chat";
const SILENCE_THRESHOLD = 10; // Amplitude threshold (0-255). Adjust if too sensitive.
const SILENCE_KX_TIMEOUT = 2000; // Time in ms to wait before stopping (e.g., 2 seconds)

export const useWebsocketForAudio = () => {
  const { setIsListening, isListening, setLoading, addMessage, setError } =
    useChatStore();

  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Refs for Silence Detection
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  // const silenceTimerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" &&
        !!window.navigator?.mediaDevices?.getUserMedia &&
        !!window.MediaRecorder
    );
  }, []);

  // Silence Detection
  const detectSilence = useCallback(
    (analyser: AnalyserNode, stopFn: () => void) => {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let lastTalkTime = Date.now();

      const checkVolume = () => {
        // Get volume data
        analyser.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Check if user is speaking
        if (average > SILENCE_THRESHOLD) {
          lastTalkTime = Date.now(); // Reset timer
        } else {
          // User is silent
          if (Date.now() - lastTalkTime > SILENCE_KX_TIMEOUT) {
            console.log("Auto-stopping due to silence...");
            stopFn(); // Trigger stop
            return; // Stop the loop
          }
        }

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    },
    []
  );

  const stopRecording = useCallback(() => {
    // Clear Silence Detection Resources
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop Recorder
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }

    // Close Socket & Wait for Answer
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send("END");
      setLoading(true);
    }

    setIsListening(false);
  }, [setIsListening, setLoading]);

  const startRecording = useCallback(async () => {
    try {
      if (socketRef.current) socketRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();

      setError(null);

      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.onopen = async () => {
        console.log("WebSocket Connected");
        setIsListening(true);

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          // Setup Audio Analysis (Silence Detection)
          const audioContext = new AudioContext();
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          audioContextRef.current = audioContext;
          analyserRef.current = analyser;

          // Start monitoring silence
          detectSilence(analyser, stopRecording);
          // -----------------------------------------------

          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: "audio/webm;codecs=opus",
          });
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
              socket.send(event.data);
            }
          };

          mediaRecorder.onerror = (event: any) => {
            console.error("MediaRecorder Error:", event.error);
            setError("Microphone recording error.");
            stopRecording();
          };

          mediaRecorder.start(250);
        } catch (err) {
          console.error("Microphone Access Error:", err);
          setError("Could not access microphone.");
          socket.close();
          setIsListening(false);
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.error) {
            setError(data.error);
            socket.close();
            setLoading(false);
            return;
          }

          // 1. Handle User Query (Intermediate update)
          const userQuery = data.query || data.transcript;
          if (userQuery) {
            addMessage({ role: "user", content: userQuery });
            // Note: We DO NOT close socket or stop loading here.
            // We keep waiting for the answer.
          }

          if (data.answer) {
            addMessage({
              role: "assistant",
              content: data.answer,
              context: data.context || [],
            });
            socket.close();
            setLoading(false);
          }
        } catch (e) {
          console.error("JSON Parse Error:", e);
          setError("Invalid response from server.");
          socket.close();
          setLoading(false);
        }
      };

      socket.onerror = (event) => {
        console.error("WebSocket Error:", event);
        if (isListening) {
          setError("Connection to audio server failed.");
          setIsListening(false);
        }
      };

      socket.onclose = () => {
        setIsListening(false);
        setLoading(false);
      };
    } catch (err) {
      console.error("Setup Error:", err);
      setError("Failed to initialize voice chat.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    setError,
    setIsListening,
    addMessage,
    setLoading,
    detectSilence,
    stopRecording,
  ]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isListening, startRecording, stopRecording]);

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return { toggleListening, isSupported };
};
