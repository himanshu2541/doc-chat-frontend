export interface UploadResponse {
  status: string;
  doc_id: string;
  path: string;
}

export interface SyncResponse {
  status: string; // "Queued", "Processing"
  job_id: string;
}
