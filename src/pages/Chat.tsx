import React from 'react';
import ChatInput from '../components/ChatInput';
import ChatResponse from '../components/ChatResponse';

const ChatPage: React.FC = () => {
  return (
    <>
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <ChatResponse />
      </main>
      <footer className="shrink-0">
        <ChatInput />
      </footer>
    </>
  );
};

export default ChatPage;