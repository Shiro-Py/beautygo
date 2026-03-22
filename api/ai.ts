import { apiClient } from './client';
import { API_ENDPOINTS } from './constants';

export interface ChatMessage {
  id: string;         // локальный UUID для key
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  conversation_id?: number;
}

export interface ChatResponse {
  reply: string;
  conversation_id: number;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export const AiApi = {
  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    return apiClient.post<ChatResponse>(API_ENDPOINTS.ai.chat, data);
  },

  async getConversations(): Promise<Conversation[]> {
    const res = await apiClient.get<any>(API_ENDPOINTS.ai.conversations);
    return Array.isArray(res) ? res : (res?.results ?? []);
  },
};
