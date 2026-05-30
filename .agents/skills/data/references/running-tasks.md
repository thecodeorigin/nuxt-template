# Running Tasks

> How to actually invoke a task in dev, in tests, and in prod. Tasks
> aren't reachable as user-facing HTTP routes by design.

## In local dev

The dev server registers every `defineTask()` discovered under
`<root>/server/tasks/**` and `layers/*/server/tasks/**`. Once `pnpm
dev` is running, you have three ways to run a task.

### 1. CLI — `nuxt task run` (preferred)

```bash
# List every registered task name + description
nuxt task list

# Run by name, no payload
nuxt task run create:admin

# Run with a JSON payload
nuxt task run create:admin --payload '{"email":"founder@acme.com","name":"Founder"}'

# Re-run a refactor task in dry-run mode
nuxt task run refactor:backfill-organization-slug --payload '{"dry_run":true}'
```

The runner prints the task's return value as JSON. Exit code is
non-zero if the task throws.

### 2. Dev HTTP endpoint — `/_nitro/tasks/<name>`

Nitro exposes a dev-only endpoint (it 404s in production):

```bash
curl -sX POST http://localhost:3002/_nitro/tasks/create:admin \
  -H 'content-type: application/json' \
  -d '{"payload":{"email":"founder@acme.com"}}' | jq
```

Useful when verifying tasks from the browser via `evaluate_script` in
Chrome DevTools MCP — the cookie context is the dev browser's
session. (See `.agents/skills/verify/references/visual-checks.md`.)

### 3. From other server code — `runTask(name)`

`runTask` is auto-imported from Nitro. Chain tasks together (like
`seed:all` does), or call from a server route as part of a larger
operation:

```ts
// Inside a server route or another task
const result = await runTask('create:admin', { payload: { email } })
```

Return value is whatever the task's `run()` returned. Throws if the
task throws.

## In tests

For unit tests on the service: import and call the service directly.
No need to go through `runTask`:

```ts
// layers/auth/test/unit/admin.test.ts (example)
import { createSystemAdmin } from '#layers/auth/server/services/admin'

it('creates the admin on first run, no-ops on second', async () => {
  const first = await createSystemAdmin({ email: 'admin@test' })
  expect(first.created).toBe(true)

  const second = await createSystemAdmin({ email: 'admin@test' })
  expect(second.created).toBe(false)
})
```

For e2e tests that depend on a task having run (e.g. a Playwright
spec that needs the admin to exist): hit `/_nitro/tasks/<name>` from
the test's setup hook, or call the service from a Nitro-env Vitest
test in `test/nuxt/`.

## In CI

CI doesn't run tasks. `pnpm test` runs unit + nuxt suites; `pnpm
test:e2e` runs Playwright against the dev server. If a test needs a
task to have run, the test itself should call the service.

## In preview / production (Cloudflare Workers)

There's no generic HTTP task runner in prod — `/_nitro/tasks/...` is
dev-only. Production-required tasks run one of these ways:

### Scheduled (cron)

For periodic tasks (`support:remindStale` in this codebase). Use
`defineScheduledTask` from `server/utils/cron.ts`:

```ts
// layers/<feature>/server/tasks/<feature>/<name>.ts
export default defineScheduledTask('0 * * * *', {
  meta: { name: '<feature>:<name>', description: '…' },
  run: async () => ({ result: 'ok' }),
})
```

The build emits the cron schedule into `wrangler.jsonc`
`triggers.crons` automatically — never hand-edit. See
`server/utils/CLAUDE.md` for the full mechanism.

### One-shot setup tasks (`create:*` / first-deploy `refactor:*`)

For `create:admin` and friends — they need to run **once** after the
first deploy of a new environment. Options:

1. **From a deploy-time route** — temporary server route that calls
   `runTask('create:admin')`, deployed → invoked once → removed in a
   follow-up PR. Clunky but explicit.
2. **From `wrangler` SSH-equivalent** — `wrangler` doesn't have a
   "run this code" command. The honest workaround is option 1.
3. **From the `/go-live` flow** — the post-deploy step prompts the
   user to invoke the create-admin task via a one-shot endpoint, then
   deletes the endpoint. This is what the `/go-live` skill bakes in
   for production-required `create:*` tasks.

If you're adding a new `create:*` task, document in the task's
`meta.description` how it should be invoked in prod.

### Programmatic from another route or webhook

A task can be triggered from any other server code:

```ts
// e.g. a webhook handler that needs to run a refactor on a tenant's data
await runTask('refactor:tenant-data', { payload: { tenant_id } })
```

This is the cleanest way to wire `update:` tasks into a feature flow
(e.g. "when an org upgrades plan, run `update:user-abilities` for
its members").

## What you can't do

- **No bearer-protected generic HTTP task endpoint.** The previous
  pattern of `/_internal/tasks/<name>?secret=...` is not part of this
  template. Each task that needs to be invoked externally gets a
  purpose-built route (or runs from cron).
- **No `wrangler tail` invocation.** `wrangler tail` is for logs;
  there is no `wrangler run-task`.
- **No invocation from the browser without a server route.** Tasks
  are server-only — exposing one to user input would mean exposing a
  privileged write operation. Always front them with a route that
  validates input and checks authz.

## Quick reference

| Need | Use |
|---|---|
| Run `create:admin` locally | `nuxt task run create:admin` |
| Run `create:admin` with custom email | `nuxt task run create:admin --payload '{"email":"..."}'` |
| Run from another task / service | `await runTask('create:admin', { payload })` |
| Run from the browser during verify | `fetch('/_nitro/tasks/create:admin', { method: 'POST', body: JSON.stringify({ payload }), credentials: 'include' })` |
| Run periodically | Convert to `defineScheduledTask('<cron>', ...)` |
| Run once in prod | Purpose-built one-shot route called via `/go-live` |
