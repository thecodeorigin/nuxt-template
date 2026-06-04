---
name: data
description: Disciplined database write workflow. Every create / update / refactor of data goes through a Nitro task at <layer>/server/tasks/{seed,create,update,refactor}/<noun>.ts — never via raw SQL scripts, ad-hoc `nuxt db sql "INSERT ..."`, or one-off `tsx` scripts. Tasks are thin wrappers around services; services use Drizzle's relational API (`db.query.<table>`, `db.insert`, `onConflictDoUpdate`, `db.batch`). Idempotent by default. Use when seeding fixtures, creating production-required rows (system admin, default product catalog), updating live data (re-grant abilities, migrate user fields), or running one-off cleanups.
---

# Data — Disciplined DB Writes

Data is the **only** sanctioned way to write rows into D1. The
codebase's authority over its data is what keeps the schema, the
abilities catalog, the test fixtures, and the production state in
sync. Ad-hoc scripts that bypass this are the fastest way to ship a
prod incident.

## The hard rule

**Every DB write goes through a Nitro task** at
`<layer>/server/tasks/<verb>/<noun>.ts`. The task is a thin wrapper
around a service function in `<layer>/server/services/`. The service
does the actual Drizzle work using the project's relational query
conventions.

No exceptions for:

- "It's just a small fix" — small fixes that aren't tracked compound
  into untraceable drift
- "It's just dev" — dev seed is the test fixture; production reuses
  the same shape (see the seed → create split below)
- "I'll just run `nuxt db sql 'UPDATE ...'`" — `nuxt db sql` is read-only
  for verify; **never** use it for writes
- One-off `tsx scripts/fix-something.ts` — make it a `refactor/` task,
  commit it, run it, leave it as the audit trail

The only legitimate write paths are: (1) server routes (validated user
input), (2) Nitro tasks under `server/tasks/**` (everything else).

## Directory convention

```
<layer>/server/tasks/
  seed/<noun>.ts          dev + demo fixtures (data that's safe to re-create from scratch)
  create/<noun>.ts        production-required first-time creation (system admin, default catalog)
  update/<noun>.ts        modify existing rows (regrant abilities, recompute denormalised fields)
  refactor/<noun>.ts      one-off migrations (data cleanup, schema-companion data moves)
```

The directory after `tasks/` is the **verb** (the kind of write). The
filename is the **noun** (the concrete thing). The task `meta.name`
mirrors the path: `seed/users.ts` → `seed:users`,
`create/admin.ts` → `create:admin`,
`update/user-abilities.ts` → `update:user-abilities`.

One task = one concept. If a task does two unrelated things, split it.
The current `layers/auth/server/tasks/` is the canonical example:

| Task | Verb | Purpose |
|---|---|---|
| `seed:permissions` | seed | Push the ability catalog into `permissions` |
| `seed:users` | seed | Three dev/demo users (`admin/alice/bob @seed.local`) |
| `seed:system-organization` | seed | Reserved `system` org + admin grants |
| `seed:demo-organization` | seed | Shared `demo` tenant org |
| `seed:all` | seed | Aggregator — `runTask` chains the four above |
| `seed:demo-notifications` (notification layer) | seed | Per-user/org fixture inbox. Payload `{user_id, organization_id}` — invoked from `demo-login` |
| `seed:demo-tickets` (support layer) | seed | Per-user/org support fixtures. Same payload shape |
| `create:admin` | create | Production admin (`admin@<NUXT_PUBLIC_BASE_DOMAIN host>`) + system-org grant |
| `create:user` | create | Idempotent single user |
| `create:users` | create | Bulk-create from a list |
| `create:role` | create | Named role in an org (with permissions) |
| `update:admin` | update | Re-apply current `SYSTEM_GRANTS.admin` after editing the constant |
| `update:user` | update | Patch a user by email + refresh sessions |
| `update:role` | update | Patch role's permissions + refresh sessions of every member holding it |
| `update:grant-ability` | update | Add an ability to a cohort (role / member emails / system admins) — the right tool for paid-feature rollouts |

See `references/permission-aware-data.md` for end-to-end recipes
("rolling out a paid feature", "adding a new admin power",
"provisioning a customer").

| Verb | When | Idempotent? |
|---|---|---|
| `seed` | Re-creatable dev / demo fixtures (`@seed.local` users, demo org) | Yes — re-runs replace |
| `create` | Production-required rows that should exist exactly once (system admin, default product catalog, root project) | Yes — re-runs no-op or update-in-place |
| `update` | Apply a change to existing rows (re-grant abilities after permission catalog changes, recompute denormalised fields) | Yes — same input = same outcome |
| `refactor` | One-off data migrations after a schema change or to correct prod drift | Yes — must be safe to re-run after partial failure |

If you're tempted to skip the verb and put a task at `tasks/<noun>.ts`,
that's a sign you don't know the intent. Pick one.

## Task vs service split — and when to NOT split

For data operations with **multiple callers** (server routes, other
services, other tasks), keep the split:

```
server/tasks/create/admin.ts        ← thin runner: defineTask + payload handoff
server/services/admin.ts            ← business logic: createSystemAdmin(input)
```

The task:

- Wraps `defineTask({ meta, run })`
- Reads `payload` if the task takes input
- Calls the service
- Returns a small summary object for the runner log

The service:

- Contains all the Drizzle calls
- Uses `db.query.<table>` for reads (project convention — see
  `references/drizzle-patterns.md`)
- Is idempotent: existing row → no-op or update-in-place; missing → insert
- Is **importable** so server routes can call it without going through
  `runTask()`. Example: `createUser` is called both by
  `tasks/create/user.ts` (the named task) and `api/auth/dev-provision.post.ts`
  (a dev endpoint that needs the same idempotent provisioning).

**For seed orchestration — DON'T split.** Seed tasks have exactly one
caller (the task itself, invoked by `nuxt task run`). Putting the
logic in a separate `services/seed-*.ts` file just creates ceremony:
two files to chase, two import sites, no reuse. The seed task **is**
the orchestration. Inline it into the task body.

The canonical example: `layers/auth/server/tasks/seed/` — each task
file contains its own Drizzle calls. There is no
`services/seed.ts` / `services/seed-organizations.ts` / `services/permissions.ts`.

The general primitives the seed tasks build on (`createUser`,
`ensureOrganization`, `ensureMembership`) live in services because
they have many callers. The task-specific orchestration (which emails
get the admin tier, which fixtures land in the demo inbox) lives in
the task.

## Default values live in constants/, not services/

Any value that's a **fixture / default / catalog** — emails of seed
users, tier→ability mappings, demo notification fixtures, default
reward amounts — goes in `<layer>/server/constants/<category>.ts`,
not mixed into a service file.

```
layers/auth/server/constants/defaults.ts       SYSTEM_ORG, DEMO_ORG, SYSTEM_GRANTS, SEED_USERS
layers/notification/server/constants/defaults.ts  DEMO_NOTIFICATIONS
layers/support/server/constants/defaults.ts    DEMO_TICKETS
layers/referral/server/constants/defaults.ts   REFERRAL_REWARD
```

The test for "is this a constant?" is **would changing this value
require changing the surrounding code's behavior?** If no → it's a
default, belongs in `constants/`. If yes (regex used in a parser,
TTL referenced by cache logic) → it's a service-internal constant,
stays in the service.

**Don't** put defaults in service files. Reasons:

- Services should describe *behavior*; constants are *data*. Mixing
  them makes both harder to scan.
- Changing a default shouldn't touch a file full of Drizzle calls.
- Tests that only need the constants shouldn't have to import the
  whole service module.

Don't put constants in `<layer>/shared/` either, unless the value is
genuinely consumed by both server and client. `SYSTEM_GRANTS` is
server-only (the client gets effective abilities through the session,
not the grant catalog).

## Running a task

In dev:

```bash
# All registered tasks
nuxt task list

# Run by name (with optional JSON payload)
nuxt task run create:admin
nuxt task run create:admin --payload '{"email":"founder@acme.com","name":"Founder"}'

# Or from the dev HTTP endpoint
curl -sX POST http://localhost:3002/_nitro/tasks/create:admin \
  -H 'content-type: application/json' \
  -d '{"payload":{"email":"founder@acme.com"}}'
```

From other code (services, other tasks, server routes):

```ts
const result = await runTask('create:admin', { payload: { email } })
```

In production (Cloudflare Workers), tasks run via:

- Scheduled (`defineScheduledTask` — see `server/utils/cron.ts`)
- Programmatic from a server route or webhook handler
- (Not exposed as an HTTP endpoint — there's no bearer-guarded
  generic task runner)

For the production-required `create:*` tasks, the deploy flow runs
them through a one-shot route or a manual `wrangler` invocation —
see `references/running-tasks.md`.

## Anti-patterns

| Anti-pattern | Why it fails |
|---|---|
| `nuxt db sql "INSERT INTO users ..."` | No code path, no idempotency, no test, invisible to the team |
| `tsx scripts/seed-admin.ts` (uncommitted) | Bypasses the task convention; can't be re-run reproducibly |
| `tsx scripts/seed-admin.ts` (committed) | Should have been `tasks/create/admin.ts` — same code, different home, different discoverability |
| One task that does N things | Split. The `seed:users` task used to do users + system org + demo org + permissions; now each is its own task |
| Task imports `db` and does Drizzle directly (no service) | Logic isn't reusable from server routes; tests can't exercise it without booting Nitro |
| Service uses `db.select().from(...)` for reads | Use `db.query.<table>` per the project convention (see root CLAUDE.md Drizzle section) |
| Non-idempotent task that crashes on second run | A re-run after a partial failure should heal the state, not duplicate or fail |
| `update:` task that mutates without reading current state first | Read → diff → write. Blind writes hide bugs |

## Permission awareness (mandatory on every feature)

Every feature change that touches a route, a layout slot, a sidebar
item, or a server endpoint **must** be paired with a permission review:

1. Does the new behaviour need a new ability key? Add it to
   `layers/auth/shared/permissions.ts` (`SYSTEM_ABILITY_KEYS`,
   `TENANT_ABILITY_KEYS`, or `SELF_ABILITY_KEYS`).
2. Does any default grant set need updating?
   `DEFAULT_PERSONAL_ORG_ABILITIES`, `DEFAULT_MEMBER_ABILITIES`,
   `DEFAULT_ROLE_ABILITIES`, `SYSTEM_GRANTS` — each may need the new key.
3. Are existing live users in production missing the new ability?
   Write an `update:` task that backfills it (e.g.
   `update/user-abilities.ts`).
4. Does the change introduce a new admin power? Audit the
   `create:admin` task — should the production admin get this new
   ability by default?

See `references/permission-aware-data.md` for the full checklist and
the canonical "I added a new feature, now what abilities does it
need" walkthrough.

## When to invoke

- Adding a row that must exist for the product to work (production
  admin, default product catalog, root tenant)
- Backfilling a column after a schema change
- Changing existing data after a business rule change (re-grant
  abilities, recompute totals)
- Cleaning up bad data discovered in prod
- Authoring or splitting seed fixtures
- About to type `nuxt db sql "INSERT|UPDATE|DELETE ..."` — stop, write
  a task instead

## When NOT to invoke

- Reading data (use `db.query.<table>` in a service or `nuxt db sql
  "SELECT ..."` for ad-hoc inspection)
- Schema changes (use Drizzle migrations: `pnpm db:generate` + commit)
- User-driven writes (server routes — Zod-validated, gated by
  `defineAuthenticatedHandler` / `defineAuthorizedHandler`)

## Reference files

| Reference | When to load |
|---|---|
| `references/task-conventions.md` | Setting up a new task — directory, naming, defineTask shape |
| `references/drizzle-patterns.md` | Writing the service — `db.query`, `db.insert`, `onConflictDoUpdate`, `db.batch` |
| `references/permission-aware-data.md` | Every feature change — what ability/grant updates are needed |
| `references/refactor-data.md` | One-off migrations — dry-run, backfill, rollback strategy |
| `references/running-tasks.md` | `nuxt task run`, the dev `/_nitro/tasks` endpoint, prod-runner patterns |
