import axios, { AxiosError } from 'axios';
import { tokenService } from '../auth/tokenService';
import { toast } from '../ui/toast';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.cookingcompass.local';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const accessToken = await tokenService.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  } catch {
    // Authentication lookup must never block or fail the API request.
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;
let sessionToastShown = false;

const showSessionExpiredToast = () => {
  if (sessionToastShown) return;
  sessionToastShown = true;

  toast.show({
    type: 'error',
    title: 'Session expired',
    message: 'Please sign in again to continue.',
    durationMs: 4000,
  });

  setTimeout(() => {
    sessionToastShown = false;
  }, 4500);
};

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = tokenService
      .refreshTokens()
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      }

      // refreshTokens() clears credentials when refresh is impossible/invalid.
      // Never turn a 401 into an offline-cache response.
      (error as AxiosError & { __sessionToastShown?: boolean }).__sessionToastShown = true;
      showSessionExpiredToast();
    }

    return Promise.reject(error);
  },
);

export default apiClient;
