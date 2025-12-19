import React from 'react';
import { useAdminDocuments } from './hooks/useAdminDocuments';
import { UploadWidget } from './components/UploadWidget';
import { DocumentList } from './components/DocumentList';
import { RefreshCw } from 'lucide-react';

const AdminPage: React.FC = () => {
  const { 
    files, 
    loading, 
    fetchDocuments, 
    handleSync, 
    handleUpload, 
    isUploading,
    handleDelete 
  } = useAdminDocuments();

  return (
    <div className="mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        <button
          onClick={fetchDocuments}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <UploadWidget onUpload={handleUpload} isUploading={isUploading} error={null} />

      <DocumentList 
        files={files} 
        onSync={handleSync} 
        onDelete={handleDelete} 
      />
    </div>
  );
};

export default AdminPage;