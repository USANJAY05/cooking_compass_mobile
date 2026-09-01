import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const TOKEN_STORAGE_KEY = '@cooking_compass_tokens';
const KEYCLOAK_URL = process.env.EXPO_PUBLIC_KEYCLOAK_URL || 'https://your-keycloak-url.com/realms/your-realm';
const CLIENT_ID = process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || 'cooking-compass-mobile';

export interface Tokens {
  accessToken: string;
  refreshToken: string | null;
  idToken?: string | null;
}

type TokenListener = (accessToken: string | null) => void;
const listeners = new Set<TokenListener>();
let cachedTokens: Tokens | null | undefined;
let loadPromise: Promise<Tokens | null> | null = null;

export const tokenService = {
  subscribe(listener: TokenListener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getUserId(accessToken?: string | null): string | null {
    if (!accessToken) return null;
    try {
      const decoded = jwtDecode<{ sub?: string }>(accessToken);
      return decoded.sub ?? null;
    } catch {
      return null;
    }
  },

  notify(accessToken: string | null) {
    listeners.forEach((listener) => listener(accessToken));
  },

  async getTokens(): Promise<Tokens | null> {
    if (cachedTokens !== undefined) return cachedTokens;
    if (loadPromise) return loadPromise;

    loadPromise = AsyncStorage.getItem(TOKEN_STORAGE_KEY)
      .then((stored) => {
        cachedTokens = stored ? JSON.parse(stored) as Tokens : null;
        return cachedTokens;
      })
      .catch(() => {
        cachedTokens = null;
        return null;
      })
      .finally(() => {
        loadPromise = null;
      });

    return loadPromise;
  },

  async getAccessToken(): Promise<string | null> {
    const tokens = await this.getTokens();
    return tokens?.accessToken ?? null;
  },

  async saveTokens(tokens: Tokens): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
      cachedTokens = tokens;
      this.notify(tokens.accessToken);
    } catch {
    }
  },

  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      cachedTokens = null;
      this.notify(null);
    } catch {
    }
  },

  async refreshTokens(): Promise<string | null> {
    const tokens = await this.getTokens();
    if (!tokens?.refreshToken) {
      
      await this.clearTokens();
      return null;
    }

    try {
      const response = await axios.post(
        `${KEYCLOAK_URL}/protocol/openid-connect/token`,
        `client_id=${encodeURIComponent(CLIENT_ID)}&grant_type=refresh_token&refresh_token=${encodeURIComponent(tokens.refreshToken)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 8_000,
        }
      );

      const { access_token, refresh_token, id_token } = response.data;
      if (access_token) {
        const newTokens: Tokens = {
          accessToken: access_token,
          refreshToken: refresh_token || tokens.refreshToken,
          idToken: id_token || tokens.idToken,
        };
        await this.saveTokens(newTokens);
        return access_token;
      }
    } catch (error) {
      await this.clearTokens();
    }
    return null;
  }
};
