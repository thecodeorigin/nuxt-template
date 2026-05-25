# server/utils

> Cross-cutting infrastructure for the Nitro backend. **No business logic** —
> domain-specific code goes in a layer's `server/services/`.

## What lives here

| File | Purpose |
|------|---------|
| `base64.ts` | UTF-8 → base64 encoder |
| `cache.ts` | `getCachedOrFetch(key, fetcher, ttl)` — NuxtHub KV cache wrapper (`@nuxthub/kv`) |
| `cron.ts` | `defineScheduledTask(cron, def)` — co-locate a cron schedule with a Nitro task (build-time macro, see below) |
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

## Scheduled tasks (cron)

Scheduling lives with the task, not in platform config. Write a task under
`server/tasks/**` (root or any layer) using `defineScheduledTask` from `cron.ts`:

```ts
// layers/<feature>/server/tasks/<feature>/<name>.ts
export default defineScheduledTask('0 * * * *', {
  meta: { name: '<feature>:<name>', description: '…' },
  run: async () => ({ result: await doWork() }),
})
```

The build-time module `modules/scheduled-tasks/` scans these files, reads the
cron literal, derives the task name from the file path (`<feature>/<name>.ts` →
`<feature>:<name>` — keep `meta.name` equal to this), and fills
`nitro.scheduledTasks`. Nitro then emits the active preset's native cron at
build — **Cloudflare `wrangler` `triggers.crons` and Vercel `vercel.json` crons
are generated automatically**; never hand-edit them. dev/node/bun/deno run it
in-process (croner). `nitro.experimental.tasks` must stay enabled (it is, in
`nuxt.config.ts`).

Constraints: the cron argument must be a **static string literal**. To run a
task on demand (manual/test), use Nitro's task runner — `runTask('<name>')`
server-side, or the dev-only `/_nitro/tasks/<name>` endpoint. There is no
bearer-guarded HTTP cron route; `defineScheduledTask` is the single primitive.

## Heuristic

Would a different feature plausibly reuse this **verbatim**? If yes → it
belongs here. If no → it's a service in the matching layer.
