import { create } from 'zustand';
import { sendChatQuery } from '../api/chatService';
import type { DocumentContext } from '../api/chatService';


export interface ChatStore {
  query: string;
  answer: string;
  context: DocumentContext[];
  isLoading: boolean;
  error: string | null;
  isListening: boolean;
  
  setQuery: (query: string) => void;
  setIsListening: (isListening: boolean) => void;
  sendMessage: (textQuery?: string) => Promise<void>;
  resetChat: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // State
  query: '',
  answer: '',
  context: [],
  isLoading: false,
  error: null,
  isListening: false,

  // Actions
  setQuery: (query) => set({ query }),
  setIsListening: (isListening) => set({ isListening }),

  sendMessage: async (textQuery?: string) => {
    const currentQuery = textQuery || get().query;
    if (!currentQuery.trim()) return;

    set({ isLoading: true, error: null, answer: '', context: [] });

    try {
      const data = await sendChatQuery(currentQuery);
      set({
        answer: data.answer,
        context: data.context || [],
        isLoading: false,
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      set({
        error: err.message || 'Something went wrong',
        isLoading: false,
      });
    }
  },

  resetChat: () => set({ query: '', answer: '', context: [], error: null }),
}));