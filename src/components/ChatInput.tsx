import React from 'react';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useWebsocketForAudio } from '../hooks/useWebsocketForAudio';

const ChatInput: React.FC = () => {
  const { query, setQuery, sendMessage, isLoading, isListening } = useChatStore();
  const { toggleListening, isSupported } = useWebsocketForAudio();
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full bg-white border-t border-gray-100 p-4 pb-6">
      <div className="max-w-4xl mx-auto flex gap-3 items-center bg-gray-50 p-2.5 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your policy..."
          disabled={isLoading || isListening}
          className="flex-1 p-2 outline-none text-gray-700 placeholder-gray-400 bg-transparent text-lg"
        />

        {/* Separator */}
        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        {/* Mic Button */}
        {isSupported && (
          <button
            onClick={toggleListening}
            disabled={isLoading}
            className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center
              ${isListening 
                ? 'bg-red-50 text-red-600 ring-2 ring-red-100 animate-pulse' 
                : 'text-gray-500 hover:bg-gray-200'
              }`}
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
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md active:scale-95'
            }`}
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
      
      {/* Helper text */}
      <div className="text-center mt-2 text-xs text-gray-400">
        {isListening ? "Listening... Click mic to stop." : "AI Assistant may produce inaccurate information."}
      </div>
    </div>
  );
};

export default ChatInput;