import React from 'react';
import { FileText, CheckCircle, RefreshCw, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import type { AdminFile } from '../hooks/useAdminDocuments';

interface DocumentRowProps {
  file: AdminFile;
  onSync: () => void;
  onDelete: () => void;
}

const formatDate = (isoString?: string) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const DocumentRow: React.FC<DocumentRowProps> = ({ file, onSync, onDelete }) => {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
      {/* File Info */}
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 
          ${file.status === 'synced' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
          <FileText size={20} />
        </div>
        <div>
          <p className="font-medium text-gray-800">{file.filename}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 font-mono">ID: {file.doc_id.slice(0, 8)}...</span>

            {/* Logic: Show Date if synced, otherwise show message */}
            {file.status === 'synced' ? (
              <span className="text-green-600 flex items-center gap-1 font-medium">
                • Ingested on {formatDate(file.timestamp)}
              </span>
            ) : (
              file.message && (
                <span className={`flex items-center gap-1 ${file.status === 'error' ? 'text-red-500' : 'text-gray-500'}`}>
                  • {file.message}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">

        {/* Synced: Show Tag Only */}
        {file.status === 'synced' && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle size={12} /> Synced
          </span>
        )}

        {/* Processing: Show Tag Only */}
        {file.status === 'syncing' && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <Loader2 size={12} className="animate-spin" /> Processing
          </span>
        )}

        {/* Error: Show Tag */}
        {file.status === 'error' && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <AlertTriangle size={12} /> Error
          </span>
        )}

        {/* Sync Button: Show ONLY if NOT syncing AND NOT synced */}
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