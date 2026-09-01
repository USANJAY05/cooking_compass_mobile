# MUVETH Kitchen

MUVETH Kitchen is an Expo / React Native application using TypeScript, React Navigation, TanStack Query, Axios, and SQLite-backed persistent query caching.

## Architecture

```text
React Native UI
      │
      ▼
TanStack Query
  │          │
  │          └── Query cache persistence ──► SQLite (WAL)
  │
  └── Axios API client ──► Backend API
             │
             └── 401 ──► single token refresh ──► retry
                              │
                              └── failure ──► clear session + custom toast
```

### Cache lifecycle

1. App starts.
2. Stored authentication tokens are inspected.
3. The current user cache scope is selected (`user:<subject>` or `anonymous`).
4. SQLite query snapshots are hydrated into the TanStack Query cache **before authenticated screens render**.
5. Screens render cached data immediately when available.
6. TanStack Query revalidates stale queries in the background.
7. Successful query results are persisted back to SQLite.
8. Logout/session invalidation clears the in-memory cache and persistent authenticated cache.

SQLite is an optimization and offline snapshot store, not a second source of truth. The backend remains authoritative. Expo's SQLite database is persisted across app restarts, and WAL mode is enabled for better general SQLite performance.

## Important performance rules

### Recipes tabs are lazy

The Recipes screen has Explore and My Recipes tabs. Unfocused tabs must not mount their data-fetching screen during initial navigation.

`RecipesScreen` therefore uses:

```tsx
<Tab.Navigator lazy lazyPreloadDistance={0}>
```

The expected request pattern is:

```text
Open Recipes
  └── GET /api/v1/recipes/?scope=public

Tap My Recipes
  └── GET /api/v1/recipes/?scope=mine
```

React Navigation documents lazy rendering as a way to defer unfocused scenes and improve initial load performance.

### Routines must not use N+1 detail requests

Never use the old pattern:

```text
GET /routines/
GET /routines/1
GET /routines/2
GET /routines/3
...
```

The Routine list endpoint must return enough lightweight scheduling information for the calendar, specifically `recurrence`.

Expected list item:

```json
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
```

The frontend then makes one list request. A detail request is made only after the user opens a specific routine.

If the backend currently does not return `recurrence` from `GET /api/v1/routines/`, update the backend contract before relying on calendar filtering. This repository contains the mobile client only; backend source was not included in the supplied project archive.

## Query caching policy

| Resource | Stale time | Purpose |
| --- | ---: | --- |
| Recipe list | 5 min | Stable browsing data |
| Recipe search | 30 sec | Short-lived search results |
| Recipe detail | 10 min | Avoid repeated detail requests |
| Routine list | 5 min | Calendar/list data |
| Routine search | 30 sec | Short-lived search results |
| Routine detail | 10 min | Avoid repeated detail requests |

Cached data is still displayed when a background refresh fails. Screens should not replace valid cached data with an error screen merely because the latest request failed.

## Authentication and 401 handling

The Axios client uses one shared refresh promise. If multiple requests receive `401` at the same time:

```text
Request A ─┐
Request B ─┼──► one refresh request
Request C ─┘          │
                      ├── success ──► retry A/B/C
                      └── failure ──► clear session + one toast
```

Do not create independent refresh requests for every failed API call.

The refresh failure message uses the app's custom ToastProvider instead of an Expo/native toast.

## SQLite persistence

The old implementation persisted transport responses using keys like:

```text
["http-cache", "/api/v1/recipes/?..."]
```

while the UI consumed keys like:

```text
["recipes", {"scope":"public"}]
```

That meant hydration could populate a cache entry the UI never read. The current implementation persists the actual TanStack Query key and data.

Persistent rows are scoped by authenticated user:

```text
user:<JWT subject>
```

This prevents one user's authenticated snapshots from being hydrated into another user's session.

## Project structure

```text
src/
├── api/                 API functions, query keys, query hooks
├── auth/                Keycloak auth and token lifecycle
├── components/          Reusable UI components
├── navigation/          Navigation configuration
├── screens/             App screens
├── settings/            User settings/providers
├── storage/             SQLite and TanStack Query persistence
├── theme/               Theme system
├── ui/                  Global UI infrastructure such as ToastProvider
└── utils/               Pure business/date/nutrition utilities
```

## Development

Install dependencies:

```bash
npm ci
```

Run the app:

```bash
npm start
```

Android:

```bash
npm run android
```

iOS:

```bash
npm run ios
```

Run tests:

```bash
npm test
```

Lint:

```bash
npm run lint
```

Type-check using the Expo project configuration:

```bash
npx tsc --noEmit
```

The supplied archive did not contain an installed `node_modules` directory, so dependency installation is required before running these commands.

## Environment

Copy `.env.example` to the appropriate local environment file and configure:

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_KEYCLOAK_URL`
- `EXPO_PUBLIC_KEYCLOAK_CLIENT_ID`
- other project-specific public Expo variables used by the application

Never place client secrets or refresh tokens in source control.

## Backend contract notes

The mobile client expects:

- `GET /api/v1/recipes/`
- `GET /api/v1/recipes/search`
- `GET /api/v1/recipes/{id}`
- `GET /api/v1/routines/`
- `GET /api/v1/routines/search`
- `GET /api/v1/routines/{id}`

For efficient routine calendar rendering, `GET /api/v1/routines/` must include `recurrence` in each summary item. It should not include the full recipe list unless there is a specific product requirement for that payload.

Recommended response separation:

```text
Routine list:
  id, name, description, status, recurrence

Routine detail:
  id, name, description, status, recurrence, recipes/items
```

This keeps the list endpoint small while avoiding N+1 requests.

## Future changes

Before changing cache behavior, authentication, or API query hooks, read `AGENTS.md`. It contains the invariants that future agents must preserve.

## Routine list compatibility

The routine screen must remain compatible with backend deployments where `/api/v1/routines/` summaries do not yet contain `recurrence`. In that case, the UI must not hide all routines; it displays the returned summaries while routine detail remains the authoritative schedule source. Once the list endpoint consistently returns recurrence, date filtering is applied locally without N+1 detail requests.


### Error handling and fast reloads

The app uses `react-native-toast-message` for user-facing transport/session errors. Expected Axios/network failures are not intentionally logged through Expo LogBox, avoiding the duplicate bottom error notification that can open a full error screen in development.

Network requests use bounded timeouts and TanStack Query does not automatically retry failed requests. Cached data is retained while a background refresh is attempted. Authentication tokens are read from AsyncStorage once and then served from memory until they change.

SQLite hydration loads only the recent bounded query-cache working set during bootstrap; stale-row cleanup runs asynchronously so startup is not delayed by maintenance work.

## Routine deletion and cart freshness

Routine deletion is treated as a cross-resource mutation. The frontend removes the routine optimistically from all cached routine lists, rolls the change back if the delete fails, removes the deleted routine detail cache, and invalidates both routine and cart query families after a successful delete.

This means:

```text
Delete routine
    ↓
Routine disappears immediately
    ↓
DELETE /api/v1/routines/{id}
    ├── failure → restore routine
    └── success
          ├── invalidate routines
          └── invalidate cart
                ↓
          active Cart refetches immediately
          inactive Cart becomes stale for next open
```

The cart remains server-authoritative. The client intentionally does not try to reconstruct ingredient quantities after a routine deletion.

## Git change discipline

Use small, behavior-focused commits. Recommended prefixes:

- `feat:` new user-facing behavior
- `fix:` bug fixes
- `perf:` measurable performance improvements
- `refactor:` internal architecture changes without behavior changes
- `test:` tests only
- `docs:` documentation only
- `chore:` tooling/dependency maintenance

For cross-resource mutations, keep cache invalidation and rollback behavior in the API hook rather than scattering invalidation calls through screens/components.

### Routine mutation cache consistency

Routine create/update/delete operations invalidate both routine queries and the cart because cart contents are derived from routines. The frontend updates obvious local state immediately and lets the backend remain authoritative for the final cart calculation.

## Categories and shared search

- Categories use the centralized `queryKeys.categories` query and are persisted with the normal query cache.
- Category data is intentionally long-lived (`30m` stale time) because categories change infrequently.
- The category selector has an explicit **Reload** action for forcing a server refresh without waiting for cache expiry.
- Use `invalidateCategories(queryClient)` after any future category create/update/delete mutation. Do not create ad-hoc `['categories']` keys.
- `SearchInput` is the shared search field for screens and `SearchListModal`; reuse it instead of creating another search `TextInput` implementation.
