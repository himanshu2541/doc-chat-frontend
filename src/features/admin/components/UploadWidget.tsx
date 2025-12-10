import React from 'react';
import { Upload, Loader2, AlertCircle } from 'lucide-react';

interface UploadWidgetProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  error: string | null;
}

export const UploadWidget: React.FC<UploadWidgetProps> = ({ onUpload, isUploading, error }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onUpload(e.target.files[0]);
      e.target.value = ""; // Reset
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Upload Documents</h2>
      <p className="text-gray-500 mb-6 text-sm">Upload PDF or Text files to the knowledge base.</p>
      
      <div className="flex items-center gap-4">
        <label className={`
          flex items-center gap-2 px-6 py-3 rounded-xl cursor-pointer transition-all
          ${isUploading 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md active:scale-95'}
        `}>
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          <span className="font-medium">{isUploading ? 'Uploading...' : 'Choose File'}</span>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleChange} 
            disabled={isUploading}
          />
        </label>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-1.5 rounded-lg animate-in fade-in">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};