import React from 'react';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useSpeechToText } from '../hooks/useSpeechToText';

const ChatInput: React.FC = () => {
  const { query, setQuery, sendMessage, isLoading, isListening } = useChatStore();
  const { toggleListening, isSupported } = useSpeechToText();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm">
      <div className="flex gap-3 items-center bg-white p-2.5 rounded-2xl shadow-lg border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-300">
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your policy..."
          disabled={isLoading}
          className="flex-1 p-2 outline-none text-gray-700 placeholder-gray-400 bg-transparent text-lg"
        />

        {/* Separator */}
        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        {/* Mic Button */}
        {isSupported && (
          <button
            onClick={toggleListening}
            className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center group
              ${isListening 
                ? 'bg-red-50 text-red-600 ring-2 ring-red-100 animate-pulse' 
                : 'text-gray-400 hover:bg-gray-100 hover:text-blue-600'
              }`}
            title={isListening ? "Stop Listening" : "Start Voice Search"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}

        {/* Send Button */}
        <button
          onClick={() => sendMessage()}
          disabled={isLoading || !query.trim()}
          className={`p-3 rounded-xl font-medium transition-all duration-200 flex items-center
            ${isLoading || !query.trim()
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95'
            }`}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {/* Helper text */}
      <div className="text-center mt-2 text-xs text-gray-400">
        {isListening ? "Listening..." : "Try asking: 'What is the deductible for gold plan?'"}
      </div>
    </div>
  );
};

export default ChatInput;