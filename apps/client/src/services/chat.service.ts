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
    return data.data.rooms;
  },

  async getMessages(eventId: string, cursor?: string): Promise<ChatMessagesResponse> {
    const params = cursor ? `?before=${cursor}&limit=50` : '?limit=50';
    const { data } = await apiClient.get(`/events/${eventId}/chat/messages${params}`);
    return data.data;
  },

  async sendMessage(eventId: string, content: string, replyTo?: string): Promise<IChatMessage> {
    const { data } = await apiClient.post(`/events/${eventId}/chat/messages`, {
      content,
      replyTo,
    });
    return data.data.message;
  },

  async getQuestions(eventId: string): Promise<IQAQuestion[]> {
    const { data } = await apiClient.get(`/events/${eventId}/qa`);
    return data.data.questions;
  },

  async askQuestion(eventId: string, question: string): Promise<IQAQuestion> {
    const { data } = await apiClient.post(`/events/${eventId}/qa`, { question });
    return data.data.question;
  },

  async upvoteQuestion(eventId: string, questionId: string): Promise<void> {
    await apiClient.post(`/events/${eventId}/qa/${questionId}/upvote`);
  },

  async answerQuestion(eventId: string, questionId: string, content: string): Promise<IQAQuestion> {
    const { data } = await apiClient.post(`/events/${eventId}/qa/${questionId}/answer`, {
      content,
    });
    return data.data.question;
  },
};
