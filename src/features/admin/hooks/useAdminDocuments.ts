import { useState, useCallback, useEffect } from "react";
import {
  uploadFile,
  syncVectors,
  deleteVector,
  getDocuments,
  type UploadResponse,
} from "../api/adminService";
import { useAdminWebSocket } from "./useAdminWebSocket";

export interface AdminFile {
  doc_id: string;
  filename: string;
  status: "uploaded" | "syncing" | "synced" | "error";
  message?: string;
  path?: string;
}

export const useAdminDocuments = () => {
  const [files, setFiles] = useState<AdminFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const docs = await getDocuments();
        // Map backend format to UI format
        const mappedFiles: AdminFile[] = docs.map((d) => ({
          doc_id: d.doc_id,
          filename: d.filename,
          status: d.status as any, // Cast to your union type
          message: `Ingested on ${new Date(d.timestamp).toLocaleDateString()}`,
        }));
        setFiles(mappedFiles);
      } catch (err) {
        console.error("Failed to load documents", err);
      }
    };
    loadDocs();
  }, []);

  useAdminWebSocket(
    useCallback((data) => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.doc_id === data.doc_id) {
            return {
              ...f,
              status: data.status === "completed" ? "synced" : "error",
              message: data.message,
            };
          }
          return f;
        })
      );
    }, [])
  );

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const res = await uploadFile(file);
      const newFile: AdminFile = {
        doc_id: res.doc_id,
        filename: file.name,
        path: res.path,
        status: "uploaded",
      };
      setFiles((prev) => [newFile, ...prev]);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSync = async (file: AdminFile) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.doc_id === file.doc_id ? { ...f, status: "syncing" } : f
      )
    );

    try {
      await syncVectors(file.doc_id, file.filename || "");
      // Note: We don't set 'synced' here immediately.
      // We wait for the WebSocket to tell us it's actually done.
    } catch (err: any) {
      setFiles((prev) =>
        prev.map((f) =>
          f.doc_id === file.doc_id
            ? { ...f, status: "error", message: err.message }
            : f
        )
      );
    }
  };

  // 4. Delete Action
  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteVector(docId);
      setFiles((prev) => prev.filter((f) => f.doc_id !== docId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return {
    files,
    isUploading,
    error,
    handleUpload,
    handleSync,
    handleDelete,
  };
};
