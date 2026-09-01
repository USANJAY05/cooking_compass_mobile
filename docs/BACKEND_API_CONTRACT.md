# Backend API Contract — Mobile Performance Requirements

This document records the backend requirements needed by MUVETH Kitchen's mobile client.

## Routine list must be calendar-ready

`GET /api/v1/routines/` should return `recurrence` on each routine summary.

Required lightweight fields:

- `id`
- `name`
- `description`
- `status` (optional but recommended)
- `recurrence`

Do not return the complete routine recipe/item collection from the list endpoint just to support calendar rendering.

Example:

```json
{
  "items": [
    {
      "id": 12,
      "name": "Training meals",
      "description": "Weekday meals",
      "recurrence": {
        "frequency": "WEEKLY",
        "interval": 1,
        "days_of_week": [1, 2, 3, 4, 5],
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

## Detail endpoint

`GET /api/v1/routines/{id}` may return the complete routine:

- metadata
- recurrence
- recipe/item list
- other detail-only fields

The mobile app calls this endpoint only when the user opens a routine or when an explicit refresh/detail operation requires it.

## Why this contract matters

Without recurrence in the list response, the client must fetch every routine detail to determine whether a routine appears on a selected calendar date. That creates an N+1 request pattern:

```text
1 list request + N detail requests
```

With recurrence included:

```text
1 list request
```

and a detail request occurs only when the user actually needs detail data.

## Authentication

The API should return `401 Unauthorized` for invalid/expired access tokens. The mobile client then performs one refresh-token request and retries waiting requests.

A failed refresh should remain distinguishable from a network failure. The client must not serve authenticated cached data as a substitute for a `401` response.
