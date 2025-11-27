import React from 'react';
import ChatInput from './components/ChatInput';
import ChatResponse from './components/ChatResponse';
import { Bot } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans text-gray-900 overflow-hidden">
      
      <header className="bg-white border-b border-gray-100 py-4 px-6 shadow-sm flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Policy Assistant</h1>
            <p className="text-xs text-gray-500">RAG & Voice Powered</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scroll-smooth">
        <ChatResponse />
      </main>

      <footer className="shrink-0">
        <ChatInput />
      </footer>
    </div>
  );
};

export default App;