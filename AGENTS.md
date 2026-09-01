# MUVETH Kitchen — Agent Engineering Guide

This file is the source of truth for future agents working on the mobile client.

## 1. Project baseline

- Expo SDK: **54.x** in the supplied project.
- React Native: **0.81.x**.
- React: **19.x**.
- TypeScript: strict mode.
- TanStack Query: v5.
- Axios: v1.x.
- SQLite: `expo-sqlite`.
- Authentication: Keycloak / OAuth Authorization Code + PKCE.

Do not blindly upgrade Expo or React Native while fixing an application bug. First inspect `package.json`, `package-lock.json`, `app.json`, native projects, and the exact Expo versioned documentation.

The repository's runtime version is the authority. Do not follow stale instructions that say to target a different Expo SDK without explicitly upgrading the project.

## 2. Core architectural invariants

### 2.1 TanStack Query is the application cache

Screens consume TanStack Query. SQLite persists TanStack Query snapshots.

```text
SQLite ↔ TanStack Query ↔ UI
                     ↕
                    API
```

Do not introduce a second independent cache in Axios for normal query data.

The old transport-cache approach was removed because it stored data under HTTP cache keys that did not match the actual TanStack Query keys, so startup hydration did not populate the queries used by screens.

### 2.2 Hydrate before authenticated screens render

`CacheBootstrap` must complete SQLite hydration before `AuthProvider` and `RootNavigator` render authenticated screens.

Do not move hydration back into a fire-and-forget effect that renders the application immediately.

### 2.3 Cache scope is user-specific

Authenticated query snapshots are persisted under:

```text
user:<JWT subject>
```

Never persist a user's authenticated data into a global cache namespace.

On session change:

1. Clear the current QueryClient cache.
2. Hydrate the new user's scope.
3. Attach persistence for the new scope.

On logout/session invalidation, clear the in-memory query cache and persistent authenticated cache.

### 2.4 Backend is authoritative

SQLite is an optimization/offline snapshot. Never treat it as authoritative server state.

After mutations, invalidate the relevant TanStack Query keys. Do not manually assume that a mutation response updated every related list/detail query unless the response and update are explicitly designed for that purpose.

## 3. Query policy

Use resource-specific stale times:

- Recipe list: 5 minutes.
- Recipe search: 30 seconds.
- Recipe detail: 10 minutes.
- Routine list: 5 minutes.
- Routine search: 30 seconds.
- Routine detail: 10 minutes.

Search queries must be disabled for empty input.

When cached data exists and a background request fails, the UI should continue showing the cached data. Only show a blocking error when there is no usable data.

## 4. Never create N+1 request patterns

### Recipes

Recipes has two top-level tabs:

- Explore (`scope=public`)
- My Recipes (`scope=mine`)

The material top tab navigator is lazy. Preserve:

```tsx
lazy
lazyPreloadDistance={0}
```

Do not cause both tab screens to mount and request data when only the first tab is visible.

### Routines

Do not fetch routine details for every routine just to render the routine calendar.

The old `useRoutinesWithDetails()` implementation caused:

```text
GET /routines/
+ N × GET /routines/{id}
```

It is now only a compatibility alias and must not make detail requests.

The routine list endpoint must return lightweight `recurrence` data. A routine detail request is only made when the user navigates to a specific routine.

## 5. Backend API contract

The mobile project supplied to the agent does not include backend source code. Do not pretend to modify backend implementation when only the client is present.

Required routine list contract:

```ts
interface RoutineSummaryComponent {
  id: number;
  name: string;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  recurrence?: RoutineRecurrenceComponent | null;
}
```

Recommended backend response shape:

```json
{
  "items": [
    {
      "id": 1,
      "name": "Morning routine",
      "description": "...",
      "recurrence": {
        "frequency": "WEEKLY",
        "interval": 1,
        "days_of_week": [1, 3, 5],
        "start_date": "2026-09-01",
        "end_date": null
      }
    }
  ],
  "page": 1,
  "limit": 100,
  "total": 1
}
```

Do not add the full recipe/item collection to the routine list solely to solve the calendar problem.

## 6. Authentication invariants

Axios has one shared refresh promise.

If multiple requests receive `401` simultaneously, there must be only one refresh request. All failed requests wait for that result.

Refresh success:

```text
refresh → save tokens → retry original request
```

Refresh failure:

```text
refresh fails
→ clear tokens
→ show one custom session-expired toast
→ reject the original request
```

Never use the SQLite/offline fallback for a `401`. An authentication failure is not an offline/network failure.

Never show one session-expired toast per failed request.

## 7. Toast architecture

Use `src/ui/toast.ts` as the non-React event interface and `ToastProvider` as the React renderer.

Non-React infrastructure such as Axios may call:

```ts
toast.show({
  type: 'error',
  title: 'Session expired',
  message: 'Please sign in again to continue.',
});
```

Do not import React navigation components into the Axios client just to display an error.

Keep infrastructure decoupled from presentation.

## 8. SQLite rules

- Use parameterized SQLite statements for user data.
- Keep WAL enabled.
- Cache writes are best effort and must never break a successful API request.
- Bound the cache size.
- Remove entries older than the configured maximum age.
- Store actual TanStack Query keys and data, not arbitrary HTTP transport keys.

Expo documents WAL as a general SQLite performance improvement and recommends parameterized statements for user input. Consult the versioned Expo documentation before changing database behavior.

## 9. Mutation invalidation

When creating/updating/deleting recipes or routines:

- invalidate the relevant list namespace;
- invalidate the affected detail query when applicable;
- avoid invalidating unrelated resources;
- do not cause a cascade of unnecessary refetches.

If a mutation response is complete and normalized enough to update a known detail query safely, `setQueryData` can be used instead of refetching that detail.

## 10. Rendering performance

Prefer:

- `FlatList` for long lists;
- stable `keyExtractor`s;
- memoized expensive derived data;
- lazy tab screens;
- background refetches instead of blocking loading states;
- small list endpoints;
- detail requests only when a detail screen is entered.

Avoid:

- API calls directly inside render;
- `useEffect` used only to mirror query data into state;
- fetching all details after a list response;
- rendering a full-screen loading state when cached data exists;
- unnecessary query invalidation of every resource.

## 11. Error handling

Distinguish:

```text
No data + request failed
  → blocking error state

Data exists + refresh failed
  → keep cached data visible

401
  → refresh/auth flow

Network failure
  → keep cached data if available

5xx
  → server error, keep cached data if available
```

Do not turn every error into a blocking screen.

## 12. Testing requirements

Before finalizing a change:

1. Run `npm ci` if dependencies are absent.
2. Run `npm test`.
3. Run `npm run lint`.
4. Run `npx tsc --noEmit`.
5. If native files changed, build the affected platform.

For cache/auth changes, add tests for:

- hydration before screen rendering;
- cache isolation between users;
- session-change cache clearing;
- single refresh request for concurrent 401s;
- refresh failure toast deduplication;
- cached data remaining visible after refresh failure;
- recipe tab lazy loading;
- routine list not triggering N detail requests.

## 13. Change discipline

When modifying the project:

- preserve existing UI/UX unless the task explicitly asks for visual changes;
- keep business logic in API/hooks/utilities rather than screens;
- avoid large rewrites when a focused change is safer;
- update tests when behavior changes;
- update `README.md` for architectural behavior;
- update this `AGENTS.md` when introducing a new invariant or integration;
- do not add dependencies unless the problem genuinely requires them.

## 14. Verification checklist for this architecture

### App startup

```text
Open app
→ read token
→ determine user scope
→ hydrate SQLite
→ attach Query persistence
→ render AuthProvider
```

### Recipe screen

```text
Open Recipes
→ one visible tab request
→ second tab waits until opened
```

### Routine screen

```text
Open Routines
→ one list request
→ calendar uses list recurrence
→ no detail requests
```

### Routine detail

```text
Tap routine
→ one detail request if not cached
```

### Token expiry

```text
401
→ one refresh request
→ success: retry
→ failure: clear session + one custom toast
```

### Offline startup

```text
App restart
→ SQLite hydration
→ cached data visible
→ network revalidation
→ cached data remains if refresh fails
```

## Routine list compatibility

The routine screen must remain compatible with backend deployments where `/api/v1/routines/` summaries do not yet contain `recurrence`. In that case, the UI must not hide all routines; it displays the returned summaries while routine detail remains the authoritative schedule source. Once the list endpoint consistently returns recurrence, date filtering is applied locally without N+1 detail requests.


## Error UX and performance rules

- API/network failures must not be surfaced through React Native/Expo LogBox. Expected transport errors are handled by TanStack Query and the app-level toast. Do not add `console.error` for expected HTTP failures.
- Use `react-native-toast-message` through `src/ui/toast.ts`; do not create competing toast implementations. The toast is rendered at the app root with a safe-area-aware top offset.
- A failed query must not retry automatically unless the endpoint has an explicit reason to do so. Current global policy is `retry: false` for queries and mutations.
- Keep API timeouts bounded. A dead/unreachable API must not make every screen appear frozen for 20+ seconds.
- Do not perform AsyncStorage token reads for every request. `tokenService` keeps the current token in memory and persists changes to storage.
- SQLite hydration must read a bounded recent working set and defer cleanup until after hydration. Persistent cache is an optimization, not a rendering blocker.
- Pull-to-refresh should explicitly refetch the active query only; never refetch unrelated tabs/details.

## Routine deletion and cart consistency

Deleting a routine is a cross-resource mutation because the generated shopping cart can depend on routine contents. The delete mutation must:

1. cancel active routine-list queries;
2. optimistically remove the deleted routine from every cached routine list/search result;
3. remove the deleted routine detail cache;
4. restore the previous routine-list snapshots if deletion fails;
5. invalidate `queryKeys.routines.all` after success;
6. invalidate `queryKeys.cart.all` after success so an active Cart screen refetches immediately and an inactive Cart query is marked stale for its next mount.

Do not wait for an app reload to make the cart correct. Do not manually patch cart ingredient quantities on the client unless the backend contract explicitly guarantees the required dependency graph; the cart endpoint remains authoritative.
