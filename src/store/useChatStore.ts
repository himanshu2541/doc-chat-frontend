import { create } from 'zustand';
import { sendChatQuery } from '../api/chatService';
import type { DocumentContext } from '../api/chatService';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  context?: DocumentContext[];
}

export interface ChatStore {
  query: string;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isListening: boolean;
  
  setQuery: (query: string) => void;
  setIsListening: (isListening: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Actions to manage messages
  addMessage: (message: Omit<Message, 'id'>) => void;
  sendMessage: (textQuery?: string) => Promise<void>;
  resetChat: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // State
  query: '',
  messages: [],
  isLoading: false,
  error: null,
  isListening: false,

  // Actions
  setQuery: (query) => set({ query }),
  setIsListening: (isListening) => set({ isListening }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { ...message, id: crypto.randomUUID() }]
  })),

  sendMessage: async (textQuery?: string) => {
    const currentQuery = textQuery || get().query;
    if (!currentQuery.trim()) return;

    // 1. Add User Message
    const { addMessage } = get();
    addMessage({ role: 'user', content: currentQuery });

    // 2. Prepare for API Call
    set({ isLoading: true, error: null, query: '' }); // Clear input

    try {
      const data = await sendChatQuery(currentQuery);
      
      // 3. Add Assistant Message
      addMessage({ 
        role: 'assistant', 
        content: data.answer, 
        context: data.context || [] 
      });
      
      set({ isLoading: false });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      set({
        error: err.message || 'Something went wrong',
        isLoading: false,
      });
    }
  },

  resetChat: () => set({ query: '', messages: [], error: null }),
}));