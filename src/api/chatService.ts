export interface DocumentContext {
  page_content: string;
  metadata: {
    source: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

export interface ChatResponseData {
  answer: string;
  context: DocumentContext[];
}

const API_URL = 'http://localhost:8000'; // use environment variable in real apps

export const sendChatQuery = async (query: string): Promise<ChatResponseData> => {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server Error: ${response.statusText}`);
    }

    return await response.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(error.message || 'Failed to connect to the server');
  }
};