import type { QueryClient, Query } from '@tanstack/react-query';
import { persistQuery } from './sqliteCache';

const PERSISTABLE_ROOT_KEYS = new Set([
  'recipes',
  'recipe',
  'routines',
  'routine',
  'categories',
  'ingredients',
  'cart',
]);

const isPersistableQuery = (query: Query) => {
  const root = query.queryKey[0];
  return typeof root === 'string' && PERSISTABLE_ROOT_KEYS.has(root);
};

export const attachQueryPersistence = (
  queryClient: QueryClient,
  scope: string,
) => {
  let writeTimer: ReturnType<typeof setTimeout> | null = null;
  const pending = new Map<string, { key: readonly unknown[]; data: unknown; updatedAt: number }>();

  const flush = async () => {
    writeTimer = null;
    const entries = [...pending.values()];
    pending.clear();
    await Promise.all(
      entries.map((entry) =>
        persistQuery(scope, entry.key, entry.data, entry.updatedAt),
      ),
    );
  };

  const scheduleFlush = () => {
    if (writeTimer) return;
    writeTimer = setTimeout(() => {
      void flush();
    }, 500);
  };

  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    const query = event.query;
    if (!isPersistableQuery(query) || query.state.status !== 'success' || query.state.data === undefined) {
      return;
    }

    const key = JSON.stringify(query.queryKey);
    pending.set(key, {
      key: query.queryKey,
      data: query.state.data,
      updatedAt: query.state.dataUpdatedAt || Date.now(),
    });
    scheduleFlush();
  });

  return () => {
    unsubscribe();
    if (writeTimer) clearTimeout(writeTimer);
    void flush();
  };
};
