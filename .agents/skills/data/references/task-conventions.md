# Task Conventions

> Directory layout, naming, and the defineTask boilerplate. Mirror the
> existing tasks in `layers/auth/server/tasks/seed/` and `create/`.

## Directory layout

Every layer that owns data owns its own tasks. The shape is uniform:

```
<layer>/server/
  services/<noun>.ts           Reusable business logic (Drizzle calls)
  tasks/
    seed/<noun>.ts             Dev / demo fixtures
    create/<noun>.ts           Production-required first-time rows
    update/<noun>.ts           Mutate existing rows
    refactor/<noun>.ts         One-off migrations
```

Cross-layer / project-wide tasks live at the project root under
`server/tasks/<verb>/<noun>.ts`. Use the layer-specific path whenever
the task is logically owned by a single layer (which is almost always).

## Naming

| Layer of intent | Choice |
|---|---|
| File path | `<layer>/server/tasks/<verb>/<noun>.ts` |
| `meta.name` | `<verb>:<noun>` (kebab-case noun if multi-word) |
| `meta.description` | One sentence, present tense, names the table(s) touched |
| Service function | `<verb><Noun>` (verb-noun, no abbreviations) |
| Payload type | `Payload` (interface) — exported only if reused |

Examples from this codebase:

| File | `meta.name` | Service function |
|---|---|---|
| `layers/auth/server/tasks/seed/users.ts` | `seed:users` | `seedUsers()` |
| `layers/auth/server/tasks/seed/system-organization.ts` | `seed:system-organization` | `seedSystemOrganization()` |
| `layers/auth/server/tasks/seed/all.ts` | `seed:all` | (aggregator — `runTask()` only) |
| `layers/auth/server/tasks/create/admin.ts` | `create:admin` | `createSystemAdmin(input)` |

Don't invent a fourth verb. If your task doesn't fit `seed` / `create`
/ `update` / `refactor`, you probably want a server route or a
service function (not a task at all).

## The defineTask shape

Thin wrapper. The service does the work; the task hands payload over
and shapes a useful return for the runner log.

```ts
// layers/<layer>/server/tasks/create/<noun>.ts
import { createThing } from '#layers/<layer>/server/services/<noun>'

interface Payload {
  // only the fields the user can supply at the CLI / dev endpoint
  email?: string
}

export default defineTask({
  meta: {
    name: 'create:<noun>',
    description: 'Create (or reuse) the <noun>. Idempotent.',
  },
  run: async ({ payload }: { payload?: Payload } = {}) => {
    const result = await createThing({ email: payload?.email })
    return {
      result: 'ok',
      created: result.created,
      // include identifiers the runner / logs will want
    }
  },
})
```

`defineTask` and `runTask` are auto-imported from Nitro (see
`layers/auth/.nuxt/types/nitro-imports.d.ts`) — no explicit `import`
needed.

## Aggregator tasks (chaining with `runTask`)

When a logical operation maps to multiple individual tasks (e.g.
`seed:all` = permissions → users → system org → demo org), the
aggregator chains them with `runTask`. This keeps every step
independently invocable while still offering a one-shot entry point.

```ts
// layers/auth/server/tasks/seed/all.ts
export default defineTask({
  meta: { name: 'seed:all', description: 'Run every seed task in order.' },
  run: async () => {
    const permissions = await runTask('seed:permissions')
    const users = await runTask('seed:users')
    const systemOrganization = await runTask('seed:system-organization')
    const demoOrganization = await runTask('seed:demo-organization')
    return { result: 'ok', permissions, users, systemOrganization, demoOrganization }
  },
})
```

The aggregator has no logic of its own — that's the rule. If it needs
business logic, that logic belongs in a service the constituent tasks
call.

## Idempotency — non-negotiable

Every task must be safe to re-run. The patterns:

| Write | Idempotent form |
|---|---|
| Insert a unique row | `db.query.<table>.findFirst(...)` first; insert only if missing |
| Insert or replace | `db.insert(...).onConflictDoUpdate({ target, set })` |
| Insert a batch | `db.insert(...).values([...]).onConflictDoNothing()` |
| Update | Read current state, diff, write only if different (cheap on D1) |
| Delete | `db.delete(...).where(...)` — naturally idempotent (no-op after first run) |

A task that crashes on the second run because it tried to insert a
duplicate is a bug. Re-run-safety is the property that lets you re-run
after a partial failure without thinking.

## Payload validation

If the task takes user-supplied input, validate it with Zod **inside
the service** (not the task — the service is the boundary that needs
to defend itself, since routes also call it).

```ts
// service
const Input = z.object({ email: z.email().optional(), name: z.string().min(1).optional() })

export async function createSystemAdmin(rawInput: unknown = {}) {
  const input = Input.parse(rawInput)
  // ...
}
```

The task can pass `payload` through untyped; the service rejects bad
shapes with a Zod error. This keeps validation in one place.

(For the existing `create:admin` we kept the validation lightweight
because the only inputs are optional strings; production-critical
tasks with complex payloads should use Zod.)

## Where the service lives

| Service | Where |
|---|---|
| Touches one layer's tables only | `<layer>/server/services/<noun>.ts` |
| Cross-cuts multiple layers' tables | The layer that owns the "primary" table; or the project root `server/services/` if truly cross-cutting |
| **Single-caller orchestration (seed tasks)** | **No service — inline into the task itself** |

`server/utils/` is **not** the place for business logic — see root
`server/utils/CLAUDE.md`. Utils hold cross-cutting infrastructure
(cache wrappers, base64, cron helpers).

## Where defaults / fixtures live

Default values, fixture lists, tier→ability mappings, demo data —
**`<layer>/server/constants/<category>.ts`**. Never mixed into a
service file.

```
layers/auth/server/constants/defaults.ts
  SYSTEM_ORG, DEMO_ORG, SYSTEM_GRANTS, SEED_USERS, SeedUserDef

layers/notification/server/constants/defaults.ts
  DEMO_NOTIFICATIONS, DemoNotificationDef

layers/support/server/constants/defaults.ts
  DEMO_TICKETS, DemoTicketDef

layers/referral/server/constants/defaults.ts
  REFERRAL_REWARD
```

The test: would changing this value require changing surrounding
code? If no → it's a default. If yes (regex used in a parser, TTL in
cache logic) → service-internal constant, stays in the service.

## Tests

| What | Where | Why |
|---|---|---|
| Service logic (pure assertions about Drizzle calls) | `<layer>/test/unit/<noun>-service.test.ts` | Fast, runs without Nitro |
| Task wiring | (usually not needed — the wrapper is 5 lines and the service has the coverage) | A test that asserts "the task calls the service" is low value |
| End-to-end behaviour (the task actually upserts the row) | `<layer>/test/nuxt/<noun>-task.test.ts` if reading needs Nitro, or `<layer>/tests/<noun>.e2e.ts` for full HTTP flow | When the service's contract is "the row ends up in this state", test that |

Look at `layers/auth/test/unit/seed.test.ts` for the pattern — it
asserts on the **shape of the seed data** (`SEED_USERS`,
`SYSTEM_GRANTS`) not the Drizzle wiring.

## Summary checklist

When adding a new task:

- [ ] File at `<layer>/server/tasks/<verb>/<noun>.ts`
- [ ] `meta.name === '<verb>:<noun>'` matching the path
- [ ] `meta.description` names what changes and which table(s)
- [ ] Service in `<layer>/server/services/<noun>.ts` (or extended)
- [ ] Service is idempotent (read-then-write, or `onConflictDoUpdate`)
- [ ] Service uses `db.query.<table>` for reads
- [ ] Permission impact reviewed (`references/permission-aware-data.md`)
- [ ] Unit test on the service if there's non-trivial logic
