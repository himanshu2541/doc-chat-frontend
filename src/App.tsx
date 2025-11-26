import React from 'react';
import ChatInput from './components/ChatInput';
import ChatResponse from './components/ChatResponse';
import { Bot } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-100 pt-12 pb-8 px-4 text-center shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-blue-50 mb-6 ring-4 ring-blue-50/50">
          <span className="text-fold text-4xl filter drop-shadow-sm"><Bot size={32} color='blue'/></span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 pb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Policy Assistant
        </h1>
        <p className="text-lg text-gray-500 max-w-md mx-auto leading-relaxed">
          Intelligent policy assistant powered by RAG and Voice.
        </p>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col">
        <ChatInput />
        <ChatResponse />
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 text-sm">
        <p>Powered by FastAPI, LangChain & React</p>
      </footer>
    </div>
  );
};

export default App;