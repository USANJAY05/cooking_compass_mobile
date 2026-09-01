import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { jwtDecode } from 'jwt-decode';
import { tokenService } from './tokenService';
import axios from 'axios';

// Ensure the browser authentication session can close
// after redirecting back to the application.
WebBrowser.maybeCompleteAuthSession();

// -----------------------------------------------------------------------------
// Keycloak configuration
// -----------------------------------------------------------------------------

const KEYCLOAK_URL =
  process.env.EXPO_PUBLIC_KEYCLOAK_URL ||
  'https://your-keycloak-url.com/realms/your-realm';

const CLIENT_ID =
  process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID ||
  'cooking-compass-mobile';

// IMPORTANT:
// This is the redirect URI used by the native Android/iOS application.
//
// app.json:
// "scheme": "cookingcompass"
//
// Keycloak:
// Valid redirect URIs:
// cookingcompass://redirect
//
// Valid post logout redirect URIs:
// cookingcompass://redirect
//
const REDIRECT_URI = AuthSession.makeRedirectUri({
  native: 'cookingcompass://redirect',
});

console.log('========================================');
console.log('Keycloak configuration');
console.log('Keycloak URL:', KEYCLOAK_URL);
console.log('Client ID:', CLIENT_ID);
console.log('Redirect URI:', REDIRECT_URI);
console.log('========================================');

// -----------------------------------------------------------------------------
// Keycloak OpenID Connect discovery
// -----------------------------------------------------------------------------

const discovery = {
  authorizationEndpoint:
    `${KEYCLOAK_URL}/protocol/openid-connect/auth`,

  tokenEndpoint:
    `${KEYCLOAK_URL}/protocol/openid-connect/token`,

  revocationEndpoint:
    `${KEYCLOAK_URL}/protocol/openid-connect/revoke`,
};

// -----------------------------------------------------------------------------
// User
// -----------------------------------------------------------------------------

interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
}

// -----------------------------------------------------------------------------
// Auth context
// -----------------------------------------------------------------------------

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  keycloakLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// -----------------------------------------------------------------------------
// Auth Provider
// -----------------------------------------------------------------------------

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // Authentication request
  // ---------------------------------------------------------------------------

  const [request, response, promptAsync] =
    AuthSession.useAuthRequest(
      {
        clientId: CLIENT_ID,

        // IMPORTANT:
        // Always use the same native redirect URI.
        redirectUri: REDIRECT_URI,

        scopes: ['openid', 'profile', 'email'],

        // Authorization Code + PKCE
        responseType: AuthSession.ResponseType.Code,

        usePKCE: true,
      },
      discovery
    );

  // ---------------------------------------------------------------------------
  // Load stored tokens
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const unsubscribe = tokenService.subscribe((token) => {
      if (token) {
        console.log('Access token updated/loaded');

        try {
          const decoded: any = jwtDecode(token);

          setUser({
            id: decoded.sub,
            username: decoded.preferred_username,
            email: decoded.email,
            name: decoded.name,
          });

          setAccessToken(token);
        } catch (error) {
          console.error(
            'Failed to decode token on update:',
            error
          );

          tokenService.clearTokens();
        }
      } else {
        setUser(null);
        setAccessToken(null);
      }
    });

    // Load initial tokens
    tokenService
      .getTokens()
      .then((tokens) => {
        if (tokens) {
          console.log('Initial access token loaded');

          try {
            const decoded: any = jwtDecode(
              tokens.accessToken
            );

            setUser({
              id: decoded.sub,
              username: decoded.preferred_username,
              email: decoded.email,
              name: decoded.name,
            });

            setAccessToken(tokens.accessToken);
          } catch (error) {
            console.error(
              'Error decoding initial token:',
              error
            );

            tokenService.clearTokens();
          }
        }

        setIsLoading(false);
      })
      .catch((error) => {
        console.error(
          'Failed to load stored tokens:',
          error
        );

        setIsLoading(false);
      });

    return unsubscribe;
  }, []);

  // ---------------------------------------------------------------------------
  // Exchange authorization code for tokens
  // ---------------------------------------------------------------------------

  const exchangeCodeAsync = useCallback(
    async (code: string) => {
      try {
        setIsLoading(true);

        if (!request?.codeVerifier) {
          console.error(
            'PKCE code verifier is missing'
          );
          return;
        }

        console.log(
          'Exchanging authorization code for tokens...'
        );

        const tokenResult =
          await AuthSession.exchangeCodeAsync(
            {
              clientId: CLIENT_ID,

              code,

              redirectUri: REDIRECT_URI,

              extraParams: {
                code_verifier:
                  request.codeVerifier,
              },
            },
            discovery
          );

        const newAccessToken =
          tokenResult.accessToken;

        const newRefreshToken =
          tokenResult.refreshToken;

        const newIdToken =
          tokenResult.idToken;

        if (!newAccessToken) {
          throw new Error(
            'Keycloak did not return an access token'
          );
        }

        await tokenService.saveTokens({
          accessToken: newAccessToken,
          refreshToken:
            newRefreshToken ?? null,
          idToken:
            newIdToken ?? null,
        });

        console.log(
          'Authentication successful'
        );
      } catch (error) {
        console.error(
          'Code exchange failed:',
          error
        );
      } finally {
        setIsLoading(false);
      }
    },
    [request?.codeVerifier]
  );

  // ---------------------------------------------------------------------------
  // Handle authentication response
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;

      if (code) {
        exchangeCodeAsync(code);
      } else {
        console.error(
          'Authentication succeeded but no authorization code was returned'
        );
      }
    }

    if (response?.type === 'error') {
      console.error(
        'Keycloak authentication error:',
        response.error
      );
    }

    if (response?.type === 'dismiss') {
      console.log(
        'Authentication browser was dismissed'
      );
    }

    if (response?.type === 'cancel') {
      console.log(
        'Authentication was cancelled'
      );
    }
  }, [response, exchangeCodeAsync]);

  // ---------------------------------------------------------------------------
  // Login
  // ---------------------------------------------------------------------------

  const login = async () => {
    try {
      if (!request) {
        console.error(
          'Authentication request is not ready'
        );
        return;
      }

      console.log(
        'Starting Keycloak login'
      );

      console.log(
        'Redirect URI:',
        REDIRECT_URI
      );

      await promptAsync();
    } catch (error) {
      console.error(
        'Login failed:',
        error
      );
    }
  };

  // ---------------------------------------------------------------------------
  // Local logout / token revocation
  // ---------------------------------------------------------------------------

  const logout = async () => {
    try {
      if (accessToken) {
        await axios
          .post(
            `${KEYCLOAK_URL}/protocol/openid-connect/revoke`,
            `client_id=${encodeURIComponent(
              CLIENT_ID
            )}&token=${encodeURIComponent(
              accessToken
            )}`,
            {
              headers: {
                'Content-Type':
                  'application/x-www-form-urlencoded',
              },
            }
          )
          .catch((error) => {
            console.warn(
              'Token revoke request failed:',
              error
            );
          });
      }
    } catch (error) {
      console.error(
        'Logout failed:',
        error
      );
    } finally {
      await tokenService.clearTokens();
    }
  };

  // ---------------------------------------------------------------------------
  // Keycloak browser logout
  // ---------------------------------------------------------------------------

  const keycloakLogout = async () => {
    try {
      setIsLoading(true);

      const tokens =
        await tokenService.getTokens();

      let logoutUrl =
        `${KEYCLOAK_URL}/protocol/openid-connect/logout`;

      if (tokens?.idToken) {
        logoutUrl +=
          `?id_token_hint=${encodeURIComponent(
            tokens.idToken
          )}` +
          `&post_logout_redirect_uri=${encodeURIComponent(
            REDIRECT_URI
          )}` +
          `&client_id=${encodeURIComponent(
            CLIENT_ID
          )}`;
      } else {
        logoutUrl +=
          `?client_id=${encodeURIComponent(
            CLIENT_ID
          )}` +
          `&post_logout_redirect_uri=${encodeURIComponent(
            REDIRECT_URI
          )}`;
      }

      console.log(
        'Keycloak logout redirect URI:',
        REDIRECT_URI
      );

      await WebBrowser.openAuthSessionAsync(
        logoutUrl,
        REDIRECT_URI
      );
    } catch (error) {
      console.error(
        'Keycloak browser logout failed:',
        error
      );
    } finally {
      await tokenService.clearTokens();
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Context
  // ---------------------------------------------------------------------------

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        logout,
        keycloakLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// -----------------------------------------------------------------------------
// useAuth hook
// -----------------------------------------------------------------------------

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};

