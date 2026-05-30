# Drizzle Patterns

> The Drizzle calls that go inside the service. Project convention is
> the relational query API for reads, the SQL-like builder for writes
> with explicit conflict handling.

This file is the implementation companion to the **"Reads: prefer
`db.query.<table>` over `db.select().from(...)`"** section in
`.agents/skills/cook/references/database-workflow.md` — load both if
in doubt.

## Imports

```ts
import { db } from '@nuxthub/db'
import {
  userTable,
  organizationTable,
  organizationMemberTable,
  // ...
} from '@nuxthub/db/schema'
import { and, eq, inArray } from 'drizzle-orm'
```

`db` is auto-imported server-side by NuxtHub; the explicit import is
there for grep-ability inside service files.

## Reads — `db.query.<table>`

```ts
// Single row
const user = await db.query.userTable.findFirst({
  where: eq(userTable.primary_email, email),
})
// user: User | undefined

// Single row, projection
const userIdOnly = await db.query.userTable.findFirst({
  where: eq(userTable.primary_email, email),
  columns: { id: true },
})

// List
const users = await db.query.userTable.findMany({
  where: inArray(userTable.id, ids),
  orderBy: desc(userTable.created_at),
  limit: 50,
})

// List + relation (requires `relations()` in schema.ts)
const usersWithOrg = await db.query.userTable.findMany({
  with: { memberships: { columns: { organization_id: true, abilities: true } } },
  limit: 50,
})
```

**Never** reach for `db.select().from(...)` for reads unless you need:
aggregates (`count()`, `sum()`), set operations (`UNION`),
or a join that the `with:` form genuinely can't express.

## Writes — explicit and idempotent

### Insert single row

```ts
const [inserted] = await db.insert(userTable).values({
  primary_email: email,
  username,
  name,
  verified: true,
}).returning()
// inserted: User
```

D1 SQLite returns inserted rows via `.returning()`. Always destructure
the array — the column values from `$defaultFn` (id, created_at,
updated_at) are filled in.

### Insert or update (the upsert)

```ts
await db.insert(organizationMemberTable)
  .values({ user_id, organization_id, abilities })
  .onConflictDoUpdate({
    target: [organizationMemberTable.user_id, organizationMemberTable.organization_id],
    set: { abilities },
  })
```

`target` is the unique constraint. Pass an array for composite
constraints (which is how `organizationMemberTable` declares its
`(user_id, organization_id)` uniqueness). `set` is the partial update
applied when the conflict fires.

### Insert-many idempotent

```ts
await db.insert(permissionTable)
  .values(catalog.map(p => ({ key: p.key, ... })))
  .onConflictDoNothing()
```

Use `onConflictDoNothing()` for catalog data where re-runs should be
no-ops. Use `onConflictDoUpdate()` when the source of truth is the
task itself (re-runs should re-apply the latest definition).

### Update existing

```ts
const [updated] = await db.update(userTable)
  .set({ name, updated_at: new Date() })
  .where(eq(userTable.id, userId))
  .returning()
```

Always include `where` — naked `db.update(table).set(...)` rewrites
every row in the table. Drizzle does not protect you here.

### Read-then-write (the idempotency staple)

```ts
let user = await db.query.userTable.findFirst({
  where: eq(userTable.primary_email, email),
})
let created = false
if (!user) {
  const [inserted] = await db.insert(userTable).values({...}).returning()
  user = inserted!
  created = true
}
// continue with `user` regardless of branch
```

This is the pattern in `layers/auth/server/services/admin.ts` —
`createSystemAdmin()` uses it twice (user, system org). It's verbose
but unambiguous: the existing-row branch reuses the row; the
missing-row branch creates it; both branches converge.

### Batch writes (D1 HTTP batch)

D1 supports HTTP batching. Use it when a task makes >1 write that can
ship in a single round-trip:

```ts
const result = await db.batch([
  db.insert(userTable).values({...}),
  db.insert(activityTable).values({...}),
])
// result: tuple of each statement's result
```

Don't batch unrelated writes from different services — batching ties
them into a single SQL transaction at the D1 layer; a failure in one
rolls back all.

## Schema-aware shortcuts

### Column projections (smaller D1 payloads)

```ts
await db.query.userTable.findMany({
  columns: { id: true, primary_email: true, name: true },
})
```

For tables with JSON / text-heavy columns (`custom_data`,
`notification_prefs`), projecting away unused columns measurably
shrinks the response.

### Where helpers

```ts
import { and, or, eq, ne, lt, gt, inArray, isNull } from 'drizzle-orm'

// Combined predicates — the standard tenant-isolation pattern
where: and(eq(table.id, id), eq(table.user_id, session.id))

// OR clauses
where: or(eq(table.status, 'active'), eq(table.status, 'pending'))

// IN clauses
where: inArray(table.id, ids)

// NULL checks
where: isNull(table.archived_at)
```

## D1 / SQLite quirks vs Postgres

The service-layer code looks like Drizzle-Postgres but a few things
differ on D1:

| | D1 / SQLite | Postgres |
|---|---|---|
| Booleans | `integer({ mode: 'boolean' })`, stored as 0/1 | native `boolean` |
| Timestamps | `integer({ mode: 'timestamp' })`, JS `Date` in/out | native `timestamp` |
| JSON | `text({ mode: 'json' })`, no JSONB ops | native `json` / `jsonb` |
| Enums | `text({ enum: [...] })` | native `enum` |
| `returning()` | Supported on insert/update/delete | Same |
| Conflict target | Must reference table columns directly | Same |

Schema in this project is at `layers/<layer>/server/db/schema.ts`. The
`@nuxthub/db/schema` re-export is generated from those.

## Things that look like writes but aren't

Use `nuxt db sql "SELECT ..."` (CLI) for ad-hoc inspection. **Never**
use `nuxt db sql "INSERT|UPDATE|DELETE ..."` — it bypasses the task
discipline this skill exists to enforce. If you need to fix data,
write a `refactor/` task.

## Reference: the admin service end-to-end

```ts
// layers/auth/server/services/admin.ts (excerpt)
let user = await db.query.userTable.findFirst({ where: eq(userTable.primary_email, email) })
let userCreated = false
if (!user) {
  const [inserted] = await db.insert(userTable).values({
    primary_email: email, username, name, verified: true,
  }).returning()
  user = inserted!
  userCreated = true
  await createPersonalOrganization(user)
}

let systemOrg = await db.query.organizationTable.findFirst({
  where: eq(organizationTable.slug, SYSTEM_ORG.slug),
})
if (!systemOrg) {
  const [insertedOrg] = await db.insert(organizationTable).values({
    slug: SYSTEM_ORG.slug, name: SYSTEM_ORG.name, is_system: true,
  }).returning()
  systemOrg = insertedOrg!
}

await db.insert(organizationMemberTable).values({
  user_id: user.id,
  organization_id: systemOrg.id,
  abilities: [...SYSTEM_GRANTS.admin],
}).onConflictDoUpdate({
  target: [organizationMemberTable.user_id, organizationMemberTable.organization_id],
  set: { abilities: [...SYSTEM_GRANTS.admin] },
})
```

Three writes, three different patterns, all idempotent. Use this as
the template.
