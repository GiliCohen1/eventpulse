import { apiClient } from './api-client.js';
import type { IUser } from '@/types';

export const userService = {
  async getProfile(): Promise<IUser> {
    const { data } = await apiClient.get('/users/me');
    return data.data?.user ?? data.data;
  },

  async updateProfile(payload: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    location?: string;
  }): Promise<IUser> {
    const { data } = await apiClient.put('/users/me', payload);
    return data.data?.user ?? data.data;
  },

  async uploadAvatar(file: File): Promise<IUser> {
    const formData = new FormData();
    formData.append('avatar', file);

    const { data } = await apiClient.put('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data?.user ?? data.data;
  },

  async getInterests(): Promise<string[]> {
    const { data } = await apiClient.get('/users/me/interests');
    return data.data?.interests ?? (Array.isArray(data.data) ? data.data : []);
  },

  async updateInterests(categoryIds: string[]): Promise<void> {
    await apiClient.put('/users/me/interests', { categoryIds });
  },

  async getPublicProfile(id: string): Promise<IUser> {
    const { data } = await apiClient.get(`/users/${id}`);
    return data.data?.user ?? data.data;
  },
};
