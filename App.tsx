import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, LogBox, StyleSheet, View } from 'react-native';
import { ThemeProvider } from './src/theme';
import { AuthProvider } from './src/auth/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';
import { hydrateQueryClient, getCacheScope, clearQueryCache } from './src/storage/sqliteCache';
import { attachQueryPersistence } from './src/storage/queryPersistence';
import { tokenService } from './src/auth/tokenService';
import { InteractiveCookingProvider } from './src/settings/InteractiveCookingSettings';
import { ToastProvider } from './src/ui/ToastProvider';
import { toast } from './src/ui/toast';

// React Native's development LogBox turns expected HTTP/network failures into a
// tappable error notification. API failures are handled by React Query + the
// app toast layer, so don't surface the same expected transport error twice.
LogBox.ignoreLogs([
  'AxiosError',
  'Network Error',
  'Request failed with status code',
  'Possible Unhandled Promise Rejection: AxiosError',
]);

const getErrorMessage = (error: unknown) => {
  const candidate = error as { response?: { data?: { detail?: unknown } }; message?: unknown };
  if (typeof candidate?.response?.data?.detail === 'string') return candidate.response.data.detail;
  if (typeof candidate?.message === 'string' && candidate.message !== 'Network Error') return candidate.message;
  return 'Unable to complete the request. Please try again.';
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if ((error as { __sessionToastShown?: boolean }).__sessionToastShown) return;
      toast.show({ type: 'error', title: 'Request failed', message: getErrorMessage(error) });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.show({ type: 'error', title: 'Action failed', message: getErrorMessage(error) });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 1000 * 60 * 60 * 24 * 7,
      retry: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

function CacheBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    let detachPersistence: (() => void) | null = null;
    let unsubscribe: (() => void) | null = null;
    let previousScope: string | null = null;

    const bootstrap = async () => {
      const tokens = await tokenService.getTokens();
      const userId = tokenService.getUserId(tokens?.accessToken);
      const scope = getCacheScope(userId);

      await hydrateQueryClient(queryClient, scope);
      detachPersistence = attachQueryPersistence(queryClient, scope);
      previousScope = scope;

      if (mounted) setReady(true);

      unsubscribe = tokenService.subscribe(async (accessToken) => {
        const nextUserId = tokenService.getUserId(accessToken);
        const nextScope = getCacheScope(nextUserId);
        if (nextScope === previousScope) return;

        detachPersistence?.();
        detachPersistence = null;
        queryClient.clear();

        if (nextUserId) {
          await hydrateQueryClient(queryClient, nextScope);
          detachPersistence = attachQueryPersistence(queryClient, nextScope);
        } else {
          await clearQueryCache();
        }

        previousScope = nextScope;
      });
    };

    void bootstrap();

    return () => {
      mounted = false;
      unsubscribe?.();
      detachPersistence?.();
    };
  }, []);

  if (!ready) {
    return (
      <View style={styles.bootstrap}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return children;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <CacheBootstrap>
              <AuthProvider>
                <InteractiveCookingProvider>
                  <RootNavigator />
                </InteractiveCookingProvider>
              </AuthProvider>
            </CacheBootstrap>
          </QueryClientProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  bootstrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
