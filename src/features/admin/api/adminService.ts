export interface UploadResponse {
  status: string;
  doc_id: string;
  path: string;
}

export interface SyncResponse {
  status: string; // "Queued", "Processing"
  job_id: string;
}

export interface DocumentMeta {
  doc_id: string;
  filename: string;
  status: string;
  timestamp: string;
}

const BASE_URL = "http://localhost:8000/api/v1";
const ADMIN_URL = `${BASE_URL}/admin`;

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return await response.json();
};

export const syncVectors = async (docId: string, filename: string): Promise<SyncResponse> => {
  const response = await fetch(`${ADMIN_URL}/sync`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({ 
      doc_id: docId, 
      filename: filename 
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Sync failed: ${response.statusText}`);
  }

  return await response.json();
};

export const deleteVector = async (docId: string): Promise<boolean> => {
  const response = await fetch(`${ADMIN_URL}/vectors/?doc_id=${docId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Delete failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.success;
};

export const getDocuments = async (): Promise<DocumentMeta[]> => {
  const response = await fetch(`${ADMIN_URL}/documents`);
  if (!response.ok) throw new Error("Failed to fetch documents");
  return await response.json();
};