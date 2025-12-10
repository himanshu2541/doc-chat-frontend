import { useEffect } from "react";

interface JobUpdateMessage {
  type: "job_update";
  doc_id: string;
  status: "completed" | "failed";
  message: string;
}

export const useAdminWebSocket = (
  onJobUpdate: (data: JobUpdateMessage) => void
) => {
  useEffect(() => {
    const ws = new WebSocket(
      "ws://localhost:8000/api/v1/admin/ws/notifications"
    );

    ws.onopen = () => console.log("Admin WebSocket Connected");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "job_update") {
          onJobUpdate(data);
        }
      } catch (err) {
        console.error("WebSocket Message Parse Error", err);
      }
    };

    return () => {
      ws.close();
    };
  }, [onJobUpdate]);
};
