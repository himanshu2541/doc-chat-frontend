import React from 'react';
import { Bot, Info, AlertCircle, FileText } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';

const ChatResponse: React.FC = () => {
  const { answer, context, error, isLoading } = useChatStore();

  // Loading Skeleton
  if (isLoading && !answer) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-6 px-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-6 px-4">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // Empty State (Initial)
  if (!answer && !isLoading) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-2 px-4 pb-20">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-4">
        
        {/* Answer Section */}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              Response
            </h3>
          </div>
          <div className="prose prose-blue prose-lg text-gray-600 leading-relaxed max-w-none">
            {answer}
          </div>
        </div>

        {/* Context / Sources Section */}
        {context.length > 0 && (
          <div className="bg-gray-50/80 border-t border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4 text-gray-500">
              <Info className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Referenced Documents
              </h4>
            </div>
            
            <div className="grid gap-3">
              {context.map((doc, idx) => (
                <div 
                  key={idx} 
                  className="group bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-3 h-3 text-blue-500" />
                    <span className="font-semibold text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {doc.metadata?.source || 'Document'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed group-hover:text-gray-900">
                    {doc.page_content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatResponse;