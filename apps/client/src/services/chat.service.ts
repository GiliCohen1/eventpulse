import { apiClient } from './api-client.js';
import type { IChatMessage, IChatRoom, IQAQuestion } from '@/types';

interface ChatMessagesResponse {
  messages: IChatMessage[];
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export const chatService = {
  async getRooms(eventId: string): Promise<IChatRoom[]> {
    const { data } = await apiClient.get(`/events/${eventId}/chat/rooms`);
    const raw = data.data;
    return Array.isArray(raw) ? raw : (raw?.rooms ?? []);
  },

  async getMessages(eventId: string, cursor?: string): Promise<ChatMessagesResponse> {
    const params = cursor ? `?before=${cursor}&limit=50` : '?limit=50';
    const { data } = await apiClient.get(`/events/${eventId}/chat/messages${params}`);
    const raw = data.data;
    // Real API may return { data: Message[], ... } or { messages: [...], pagination: {...} }
    if (raw.messages) return raw;
    return {
      messages: raw.data ?? (Array.isArray(raw) ? raw : []),
      pagination: { hasMore: false, nextCursor: null },
    };
  },

  async sendMessage(eventId: string, content: string, replyTo?: string): Promise<IChatMessage> {
    const { data } = await apiClient.post(`/events/${eventId}/chat/messages`, {
      content,
      replyTo,
    });
    return data.data?.message ?? data.data;
  },

  async getQuestions(eventId: string): Promise<IQAQuestion[]> {
    const { data } = await apiClient.get(`/events/${eventId}/qa`);
    const raw = data.data;
    return Array.isArray(raw) ? raw : (raw?.questions ?? []);
  },

  async askQuestion(eventId: string, question: string): Promise<IQAQuestion> {
    const { data } = await apiClient.post(`/events/${eventId}/qa`, { question });
    return data.data?.question ?? data.data;
  },

  async upvoteQuestion(eventId: string, questionId: string): Promise<void> {
    await apiClient.post(`/events/${eventId}/qa/${questionId}/upvote`);
  },

  async answerQuestion(eventId: string, questionId: string, content: string): Promise<IQAQuestion> {
    const { data } = await apiClient.post(`/events/${eventId}/qa/${questionId}/answer`, {
      content,
    });
    return data.data?.question ?? data.data;
  },
};
