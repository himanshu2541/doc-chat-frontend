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
}

export const useAdminDocuments = () => {
  const [files, setFiles] = useState<AdminFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 1. Listen for updates (Single connection, no retries)
  useAdminWebSocket(
    useCallback((data: JobUpdateMessage) => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.doc_id === data.doc_id) {
            return {
              ...f,
              status: data.status === "Completed" ? "synced" : "error",
              message: data.status === "Completed" ? "Synced" : "Failed",
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
      
      const mapped: AdminFile[] = docs.map((d) => ({
        doc_id: d.doc_id,
        filename: d.filename,
        status: d.status === "Completed" ? "synced" : "uploaded",
        message: d.status === "Completed" ? "Synced" : "Ingested",
      }));
      
      setFiles(mapped);
    } catch (error: unknown) {
      console.error("Fetch Documents Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Actions
  const handleSync = async (file: AdminFile) => {
    // Optimistic Update
    setFiles((prev) =>
      prev.map((f) =>
        f.doc_id === file.doc_id
          ? { ...f, status: "syncing", message: "Processing..." }
          : f
      )
    );

    try {
      await syncVectors(file.doc_id, file.filename);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Start Failed";
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
    try {
      const res = await uploadFile(file);
      setFiles((prev) => [
        {
          doc_id: res.doc_id,
          filename: file.name,
          status: "uploaded",
          message: "Ready",
        },
        ...prev,
      ]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      alert(errorMessage);
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

  return { files, loading, fetchDocuments, handleSync, handleUpload, handleDelete };
};