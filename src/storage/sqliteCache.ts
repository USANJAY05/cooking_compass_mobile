import * as SQLite from 'expo-sqlite';

const DB_NAME = 'muveth_kitchen_cache.db';
const dbPromise = SQLite.openDatabaseAsync(DB_NAME);

export interface PersistedQueryEntry {
  scope: string;
  queryHash: string;
  queryKey: readonly unknown[];
  data: unknown;
  updatedAt: number;
}

let initialized = false;
let initPromise: Promise<void> | null = null;

const ensureDatabase = async () => {
  if (initialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      const db = await dbPromise;
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS query_cache (
          scope TEXT NOT NULL,
          query_hash TEXT NOT NULL,
          query_key_json TEXT NOT NULL,
          data_json TEXT NOT NULL,
          updated_at INTEGER NOT NULL,
          PRIMARY KEY (scope, query_hash)
        );

        CREATE INDEX IF NOT EXISTS idx_query_cache_scope_updated
          ON query_cache(scope, updated_at DESC);
      `);
      initialized = true;
    })().catch((error) => {
      initPromise = null;
      throw error;
    });
  }
  await initPromise;
};

export const serializeQueryKey = (queryKey: readonly unknown[]) => JSON.stringify(queryKey);

export const getCacheScope = (userId?: string | null) =>
  userId ? `user:${userId}` : 'anonymous';

export const persistQuery = async (
  scope: string,
  queryKey: readonly unknown[],
  data: unknown,
  updatedAt: number,
) => {
  try {
    await ensureDatabase();
    const db = await dbPromise;
    const queryKeyJson = serializeQueryKey(queryKey);
    const queryHash = queryKeyJson;

    await db.runAsync(
      `INSERT OR REPLACE INTO query_cache
       (scope, query_hash, query_key_json, data_json, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      scope,
      queryHash,
      queryKeyJson,
      JSON.stringify(data),
      updatedAt,
    );

    // Keep the persistent cache bounded. Query data is an optimization, not a
    // second source of truth.
    await db.runAsync(
      `DELETE FROM query_cache
       WHERE scope = ?
       AND query_hash NOT IN (
         SELECT query_hash FROM query_cache
         WHERE scope = ?
         ORDER BY updated_at DESC
         LIMIT 200
       )`,
      scope,
      scope,
    );
  } catch {
    // Persistence must never break rendering or a successful network request.
  }
};

export const hydrateQueryClient = async (
  queryClient: {
    setQueryData: (
      queryKey: readonly unknown[],
      data: unknown,
      options?: { updatedAt?: number },
    ) => void;
  },
  scope: string,
  maxAgeMs = 1000 * 60 * 60 * 24 * 7,
) => {
  try {
    await ensureDatabase();
    const db = await dbPromise;
    const cutoff = Date.now() - maxAgeMs;

    // Do not run cleanup before rendering. Startup should only read the
    // bounded, recent working set; stale-row cleanup is best effort and can
    // happen after hydration.
    const rows = await db.getAllAsync<{
      query_key_json: string;
      data_json: string;
      updated_at: number;
    }>(
      `SELECT query_key_json, data_json, updated_at
       FROM query_cache
       WHERE scope = ? AND updated_at >= ?
       ORDER BY updated_at DESC
       LIMIT 100`,
      scope,
      cutoff,
    );

    for (const row of rows) {
      try {
        const queryKey = JSON.parse(row.query_key_json) as readonly unknown[];
        const data = JSON.parse(row.data_json);
        queryClient.setQueryData(queryKey, data, { updatedAt: row.updated_at });
      } catch {
        // Ignore a corrupt entry rather than failing the whole bootstrap.
      }
    }

    // Cleanup is deliberately not awaited by callers after hydration.
    void db.runAsync(
      'DELETE FROM query_cache WHERE scope = ? AND updated_at < ?',
      scope,
      cutoff,
    ).catch(() => undefined);
  } catch {
    // SQLite is an optimization. The app remains functional without it.
  }
};

export const clearQueryCache = async (scope?: string) => {
  try {
    await ensureDatabase();
    const db = await dbPromise;
    if (scope) {
      await db.runAsync('DELETE FROM query_cache WHERE scope = ?', scope);
    } else {
      await db.runAsync('DELETE FROM query_cache');
    }
  } catch {
    // Best effort.
  }
};
