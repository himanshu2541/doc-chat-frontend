import { useState, useCallback, useEffect } from "react";
import {
  uploadFile,
  syncVectors,
  deleteVector,
  getDocuments,
  type DocumentMeta,
} from "../api/adminService";
import { useAdminWebSocket, type JobUpdateMessage } from "./useAdminWebSocket";

export interface AdminFile {
  doc_id: string;
  filename: string;
  status: "uploaded" | "syncing" | "synced" | "error";
  message?: string;
  timestamp?: string;
}

export const useAdminDocuments = () => {
  const [files, setFiles] = useState<AdminFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // 1. Listen for WebSocket updates
  useAdminWebSocket(
    useCallback((data: JobUpdateMessage) => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.doc_id === data.doc_id) {
            const isSuccess = data.status === "Completed";
            const isError = data.status === "Failed";
            const isProcessing = data.status === "Processing";

            let newStatus: AdminFile["status"] = f.status;
            
            // Logic to clear "stuck" processing state
            if (isSuccess) newStatus = "synced";
            else if (isError) newStatus = "error";
            else if (isProcessing) newStatus = "syncing";

            return {
              ...f,
              status: newStatus,
              message: data.message || data.status,
              // Update timestamp to now if the job just completed
              timestamp: isSuccess ? (f.timestamp || new Date().toISOString()) : f.timestamp,
            };
          }
          return f;
        })
      );
    }, [])
  );

  // 2. Fetch List
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const docs: DocumentMeta[] = await getDocuments();

      const mapped: AdminFile[] = docs.map((d) => {
        // Map backend status to frontend status to prevent "stuck" states on refresh
        let status: AdminFile["status"] = "uploaded";
        if (d.status === "Completed") status = "synced";
        else if (d.status === "Failed") status = "error";
        else if (d.status === "Processing") status = "syncing";

        return {
          doc_id: d.doc_id,
          filename: d.filename,
          status: status,
          message: d.status === "Completed" ? "Synced" : d.status,
          timestamp: d.timestamp, // Capture the timestamp from API
        };
      });

      setFiles(mapped);
    } catch (error: unknown) {
      console.error("Fetch Documents Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Actions
  const handleSync = async (file: AdminFile) => {
    // Optimistic Update: Set to syncing immediately
    setFiles((prev) =>
      prev.map((f) =>
        f.doc_id === file.doc_id
          ? { ...f, status: "syncing", message: "Starting sync..." }
          : f
      )
    );

    try {
      await syncVectors(file.doc_id, file.filename);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Start Failed";
      setFiles((prev) =>
        prev.map((f) =>
          f.doc_id === file.doc_id
            ? { ...f, status: "error", message: errorMessage }
            : f
        )
      );
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const res = await uploadFile(file);
      setFiles((prev) => [
        {
          doc_id: res.doc_id,
          filename: file.name,
          status: "uploaded",
          message: "Ready to sync",
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Delete?")) return;
    try {
      await deleteVector(docId);
      setFiles((prev) => prev.filter((f) => f.doc_id !== docId));
    } catch (error: unknown) {
      console.error("Delete Error", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    files,
    loading,
    isUploading,
    fetchDocuments,
    handleSync,
    handleUpload,
    handleDelete,
  };
};