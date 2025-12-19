import { useEffect, useRef } from "react";

const WS_URL = "ws://localhost:8000/api/v1/admin/ws/notifications";

export interface JobUpdateMessage {
  doc_id: string;
  status: string; // "Completed" | "Failed"
  filename?: string;
  chunks?: number;
  message?: string;
}

export const useAdminWebSocket = (
  onJobUpdate: (data: JobUpdateMessage) => void
) => {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 1. Prevent duplicate connections
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // 2. Initialize Connection
    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("Admin WebSocket Connected");
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const rawData: unknown = JSON.parse(event.data);
        
        // Strict Type Guard
        if (
          typeof rawData === "object" &&
          rawData !== null &&
          "doc_id" in rawData &&
          "status" in rawData
        ) {
          const data = rawData as JobUpdateMessage;
          onJobUpdate(data);
        }
      } catch (err: unknown) {
        console.error("WebSocket Message Parse Error", err);
      }
    };

    ws.onclose = () => {
      console.log("Admin WebSocket Disconnected.");
    };

    ws.onerror = (err: Event) => {
      console.error("WebSocket Error:", err);
      ws.close();
    };

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [onJobUpdate]);
};