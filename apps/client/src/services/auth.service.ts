import { apiClient } from './api-client.js';
import type { IUser } from '@/types';
import type { LoginCredentials, RegisterCredentials, AuthTokens } from '@/types/auth.types.js';

interface AuthResponse {
  user: IUser;
  tokens: AuthTokens;
}

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post('/auth/register', credentials);
    return data.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getMe(): Promise<IUser> {
    const { data } = await apiClient.get('/auth/me');
    return data.data.user;
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    return data.data.tokens;
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, password });
  },

  async googleAuth(code: string): Promise<AuthResponse> {
    const { data } = await apiClient.post('/auth/google', { code });
    return data.data;
  },
};
