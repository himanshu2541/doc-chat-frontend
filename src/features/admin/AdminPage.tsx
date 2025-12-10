import React from 'react';
import { useAdminDocuments } from './hooks/useAdminDocuments';
import { UploadWidget } from './components/UploadWidget';
import { DocumentList } from './components/DocumentList';

const AdminPage: React.FC = () => {
  const {
    files,
    isUploading,
    error,
    handleUpload,
    handleSync,
    handleDelete
  } = useAdminDocuments();

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="text-gray-500">Manage the documents used by the RAG bot.</p>
      </div>

      <UploadWidget
        onUpload={handleUpload}
        isUploading={isUploading}
        error={error}
      />

      <DocumentList
        files={files}
        onSync={handleSync}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminPage;