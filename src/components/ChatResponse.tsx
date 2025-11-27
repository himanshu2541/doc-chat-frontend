import React, { useEffect, useRef } from 'react';
import { Bot, User, FileText, AlertCircle } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';

const ChatResponse: React.FC = () => {
  const { messages, error, isLoading } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-20">
        <Bot className="w-16 h-16 mb-4 opacity-20" />
        <p>Ask a question to start the conversation</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Message List */}
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
        >
          {/* Avatar */}
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
            ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}
          `}>
            {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
          </div>

          {/* Message Content */}
          <div className={`
            max-w-[80%] rounded-2xl p-4 shadow-sm
            ${msg.role === 'user' 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-white border border-gray-100 rounded-tl-none text-gray-800'}
          `}>
            <p className="whitespace-pre-wrap leading-relaxed">
              {msg.content}
            </p>

            {/* Context/Sources (Only for Assistant) */}
            {msg.role === 'assistant' && msg.context && msg.context.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-500 uppercase">
                  <FileText className="w-3 h-3" />
                  <span>Sources</span>
                </div>
                <div className="grid gap-2">
                  {msg.context.map((doc, idx) => (
                    <div key={idx} className="bg-gray-50 p-2 rounded border border-gray-200 text-xs text-gray-600">
                      <span className="font-medium text-blue-600 block mb-0.5">
                        {doc.metadata?.source || 'Document'}
                      </span>
                      <span className="line-clamp-1">{doc.page_content}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0">
            <Bot size={18} />
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm w-full max-w-md">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex justify-center my-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Invisible element to scroll to */}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatResponse;