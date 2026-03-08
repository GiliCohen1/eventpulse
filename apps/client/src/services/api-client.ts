import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/lib/constants';
import { resolveDemoResponse } from './demo-api.js';

const DEMO_FALLBACK_ENABLED =
  import.meta.env.DEV && (import.meta.env.VITE_DEMO_MODE ?? 'true') !== 'false';

let hasLoggedDemoFallback = false;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

function getAccessToken(): string | null {
  const stored = localStorage.getItem('eventpulse_tokens');
  if (!stored) return null;

  const tokens = JSON.parse(stored) as { accessToken: string };
  return tokens.accessToken;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const shouldUseDemoFallback =
      !status || status === 404 || status === 502 || status === 503 || status === 504;

    if (DEMO_FALLBACK_ENABLED && shouldUseDemoFallback && originalRequest) {
      const demoResponse = resolveDemoResponse(originalRequest);
      if (demoResponse) {
        if (!hasLoggedDemoFallback) {
          // One-time hint so developers know data is mocked intentionally.
          // eslint-disable-next-line no-console
          console.info('[EventPulse] Backend unavailable. Serving local demo API responses.');
          hasLoggedDemoFallback = true;
        }
        return Promise.resolve(demoResponse);
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const stored = localStorage.getItem('eventpulse_tokens');
      if (!stored) return Promise.reject(error);

      const tokens = JSON.parse(stored) as { refreshToken: string };

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: tokens.refreshToken,
        });

        const newTokens = data.data.tokens;
        localStorage.setItem('eventpulse_tokens', JSON.stringify(newTokens));

        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return apiClient(originalRequest);
      } catch {
        localStorage.removeItem('eventpulse_tokens');
        localStorage.removeItem('eventpulse_user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
