/**
 * Deprecated transport-cache compatibility layer.
 *
 * Query data is now persisted from TanStack Query itself so SQLite entries use
 * the same query keys that the UI consumes. Keeping an HTTP cache here caused
 * a key mismatch and made hydration ineffective.
 */
export const isCacheableGet = (config?: { method?: string; url?: string }) =>
  String(config?.method || 'get').toLowerCase() === 'get' && !!config?.url;
