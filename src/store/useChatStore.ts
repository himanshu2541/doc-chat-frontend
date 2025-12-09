import { create } from "zustand";
import { sendChatQuery } from "../api/chatService";
import type { DocumentContext } from "../api/chatService";

export interface Message {
  id: string;
  role: "user" | "assistant";
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
  resetChat: () => void;
  sendMessage: (textQuery?: string) => Promise<void>;

  // Actions to manage messages
  // Allow passing a custom ID (crucial for tracking streams)
  addMessage: (message: Message) => void;
  // Replace text (For Live Transcription which self-corrects)
  updateMessageContent: (id: string, content: string) => void;
  // Append text (For LLM Streaming)
  appendMessageContent: (
    id: string,
    token: string,
    context?: DocumentContext[]
  ) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // State
  query: "",
  messages: [],
  isLoading: false,
  error: null,
  isListening: false,

  // Actions
  setQuery: (query) => set({ query }),
  setIsListening: (isListening) => set({ isListening }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  resetChat: () => set({ query: "", messages: [], error: null }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  sendMessage: async (textQuery?: string) => {
    const currentQuery = textQuery || get().query;
    if (!currentQuery.trim()) return;

    const userMsgId = crypto.randomUUID();
    const { addMessage } = get();

    addMessage({ id: userMsgId, role: "user", content: currentQuery });

    set({ isLoading: true, error: null, query: "" });

    try {
      const data = await sendChatQuery(currentQuery);

      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer,
        context: data.contexts || [],
      });
      set({ isLoading: false });
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      set({ error: err.message, isLoading: false });
    }
  },

  updateMessageContent: (id, content) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content } : msg
      ),
    })),

  appendMessageContent: (id, token, context) =>
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg.id !== id) return msg;
        return {
          ...msg,
          content: msg.content + token,
          // Update context only if provided (usually at the end)
          context: context || msg.context,
        };
      }),
    })),
}));
