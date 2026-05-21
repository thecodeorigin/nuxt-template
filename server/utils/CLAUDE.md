# server/utils

> Cross-cutting infrastructure for the Nitro backend. **No business logic** —
> domain-specific code goes in a layer's `server/services/`.

## What lives here

| File | Purpose |
|------|---------|
| `base64.ts` | UTF-8 → base64 encoder |
| `cache.ts` | `getCachedOrFetch(key, fetcher, ttl)` — NuxtHub KV cache wrapper (`@nuxthub/kv`) |
| `cron.ts` | `defineAuthenticatedCronHandler` — bearer-token guard for cron routes |
| `task.ts` | `defineAuthenticatedTask` — bearer-token guard for Nitro tasks |
| `url.ts` | `getBaseUrl()` |
| `webhook.ts` | `defineWebhookHandler` — signature guard |

## Lives elsewhere

| Concept | Location |
|---------|----------|
| Auth (`AuthUser`, `defineAuthenticatedHandler`) | `layers/auth/server/services/auth.ts` |
| Authz (`defineAuthorizedHandler`, `parseAbility`, `defineSubject`) | `layers/auth/server/services/casl.ts` |
| Impersonation feature | `layers/auth/server/services/impersonate.ts` |
| Seed user definitions + runner functions | `layers/auth/server/services/seed.ts` |
| Database client (`db`) + schema, KV (`kv`), blob (`blob`) | NuxtHub virtual packages — `@nuxthub/db`, `@nuxthub/db/schema`, `@nuxthub/kv`, `@nuxthub/blob` (auto-imported server-side). The Drizzle schema lives in `server/db/schema.ts`. |

## Heuristic

Would a different feature plausibly reuse this **verbatim**? If yes → it
belongs here. If no → it's a service in the matching layer.
