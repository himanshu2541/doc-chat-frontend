import React from 'react';
import { FileText, CheckCircle, RefreshCw, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import type { AdminFile } from '../hooks/useAdminDocuments';

interface DocumentRowProps {
  file: AdminFile;
  onSync: () => void;
  onDelete: () => void;
}

export const DocumentRow: React.FC<DocumentRowProps> = ({ file, onSync, onDelete }) => {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
      {/* File Info */}
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
          <FileText size={20} />
        </div>
        <div>
          <p className="font-medium text-gray-800">{file.filename}</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-400 font-mono">ID: {file.doc_id.slice(0, 8)}...</p>
            {file.message && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                • {file.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {file.status === 'synced' && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle size={12} /> Synced
          </span>
        )}
        
        {file.status === 'syncing' && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <Loader2 size={12} className="animate-spin" /> Processing
          </span>
        )}

        {file.status === 'error' && (
           <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
           <AlertTriangle size={12} /> Error
         </span>
        )}

        {/* Sync Button (Show if not syncing) */}
        {file.status !== 'syncing' && file.status !== 'synced' && (
          <button
            onClick={onSync}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Sync to Vector DB"
          >
            <RefreshCw size={18} />
          </button>
        )}
        
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};