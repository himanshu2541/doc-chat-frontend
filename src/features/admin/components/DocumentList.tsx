import React from 'react';
import { FileText } from 'lucide-react';
import { DocumentRow } from './DocumentRow';
import type { AdminFile } from '../hooks/useAdminDocuments';

interface DocumentListProps {
  files: AdminFile[];
  onSync: (file: AdminFile) => void;
  onDelete: (docId: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ files, onSync, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">Recent Uploads</h3>
        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
          {files.length} documents
        </span>
      </div>

      {files.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {files.map((file) => (
            <DocumentRow 
              key={file.doc_id} 
              file={file} 
              onSync={() => onSync(file)} 
              onDelete={() => onDelete(file.doc_id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};