# Database Workflow

> D1/SQLite via NuxtHub. No Postgres. No Docker. Local dev uses a file-based SQLite DB under `.data/`.

## First contact with an unknown DB

Before assuming anything, inspect the actual state:

```bash
# List tables
nuxt db sql "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"

# Check row counts
nuxt db sql "SELECT 'users' as tbl, COUNT(*) as n FROM users UNION ALL SELECT 'todos', COUNT(*) FROM todos"

# Sample real data
nuxt db sql "SELECT * FROM users LIMIT 5"

# Check a specific table's schema
nuxt db sql "PRAGMA table_info(todos)"

# Check migration state
nuxt db sql "SELECT * FROM __drizzle_migrations ORDER BY created_at DESC LIMIT 10"
```

Local DB lives at `.data/hub/d1/default.sqlite` (NuxtHub emulated D1). You can also open it with any SQLite viewer.

## Schema workflow

### 1. Edit schema

Edit `server/db/schema.ts`. Follow SQLite/D1 type conventions:

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const todoTable = sqliteTable('todos', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => userTable.id),
  title: text('title').notNull(),
  status: text('status', { enum: ['pending', 'active', 'done'] as const }).notNull().default('pending'),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type Todo = typeof todoTable.$inferSelect
export type NewTodo = typeof todoTable.$inferInsert
```

### 2. Generate migration

```bash
pnpm db:generate
```

This runs `nuxt db generate` and creates a new file in `server/db/migrations/sqlite/`. **Review the generated SQL** before applying — make sure it matches your intent (no accidental drops).

### 3. Apply migration locally

```bash
pnpm db:migrate
```

Runs `nuxt db migrate`. Applies all pending migrations to the local `.data/` SQLite file.

### 4. Verify

```bash
nuxt db sql "PRAGMA table_info(todos)"
nuxt db sql "SELECT * FROM todos LIMIT 5"
```

### 5. Commit

Commit both `server/db/schema.ts` and the generated migration file. Never hand-edit migration files after they're generated.

## Type conventions

| Data | Drizzle column | Notes |
|---|---|---|
| UUID primary key | `text('id').primaryKey().$defaultFn(() => crypto.randomUUID())` | Web Crypto API, not Node |
| Timestamp | `integer('created_at', { mode: 'timestamp' })` | Stored as Unix epoch; JS Date objects |
| Boolean | `integer('is_active', { mode: 'boolean' }).default(false)` | Stored as 0/1 |
| JSON | `text('metadata', { mode: 'json' }).$type<Record<string, unknown>>()` | No JSON column type in SQLite |
| Enum | `text('status', { enum: ['a', 'b'] as const })` | No native SQLite enums |
| Nullable FK | `text('parent_id').references(() => parentTable.id)` (no `.notNull()`) | |
| Required FK | `text('user_id').notNull().references(() => userTable.id)` | |

## Querying

### Import

```ts
import { db } from '@nuxthub/db'
import { todoTable, type Todo } from '@nuxthub/db/schema'
```

`@nuxthub/db/schema` is generated from `server/db/schema.ts` and re-exports everything it exports.

### Reads: prefer `db.query.<table>` over `db.select().from(<table>)`

**Project convention**: use the Drizzle **relational query API**
(`db.query.<tableName>.findFirst` / `findMany`) for all reads. Drop to
the SQL-like builder (`db.select().from(...)`) only when the relational
API genuinely can't express what you need (custom aggregates, set
operations, complex CTEs).

Why this is the default here:

- It returns plain typed objects, not row arrays you have to destructure.
- `findFirst` returns `T | undefined` directly — no `.get()`, no
  `[row] = await ...` dance, no manual array unwrap.
- `columns: { ... }` is the cheap way to project only the fields you
  need (smaller D1 payloads on the read path).
- `with: { ... }` pulls related rows in a single round-trip once you've
  defined the relations in `schema.ts` — far better than N+1 hand-joins.
- The codebase already leans on it heavily (`grep "db.query."` if in
  doubt). New code should match.

### Common patterns

```ts
import { eq, and, desc } from 'drizzle-orm'

// Single item — returns Todo | undefined
const todo = await db.query.todoTable.findFirst({
  where: and(eq(todoTable.id, id), eq(todoTable.userId, session.userId)),
})

// Single item, only the fields you need
const todo = await db.query.todoTable.findFirst({
  where: eq(todoTable.id, id),
  columns: { id: true, title: true, status: true },
})

// List (user-scoped — always include the userId predicate, missing it = data leak)
const todos = await db.query.todoTable.findMany({
  where: eq(todoTable.userId, session.userId),
  orderBy: desc(todoTable.createdAt),
  limit: 50,
})

// List + related rows in one round-trip (requires `relations()` in schema.ts)
const todos = await db.query.todoTable.findMany({
  where: eq(todoTable.userId, session.userId),
  with: { tags: true, author: { columns: { id: true, name: true } } },
  limit: 50,
})

// Create
const [todo] = await db.insert(todoTable).values({
  title: body.title,
  userId: session.userId,
}).returning()

// Update
const [updated] = await db.update(todoTable)
  .set({ title: body.title, updatedAt: new Date() })
  .where(and(eq(todoTable.id, id), eq(todoTable.userId, session.userId)))
  .returning()

// Delete
await db.delete(todoTable)
  .where(and(eq(todoTable.id, id), eq(todoTable.userId, session.userId)))
```

**Always add a user-scoped predicate** for user-owned data. Missing
`where: eq(todoTable.userId, session.userId)` = data exposure bug.

### When to use `db.select().from(...)` instead

It's still the right tool for these cases — but they're the exception,
not the default:

- Aggregates: `db.select({ n: count() }).from(todoTable).where(...)`.
- Set operations: `UNION`, `INTERSECT`, `EXCEPT`.
- Custom joins where defining a `relations()` entry would be overkill
  (one-off admin queries, reporting routes).
- Anything where you need raw `sql\`...\`` columns mixed with table
  columns.

If you reach for `db.select()` and a relational equivalent exists, use
the relational form. If a reviewer asks "why `db.select` here?", the
answer should be one of the bullets above.

### Batch operations

D1 supports HTTP batch calls. Use Drizzle's batch API for multi-row operations:

```ts
const results = await db.batch([
  db.insert(todoTable).values({ ... }),
  db.insert(tagTable).values({ ... }),
])
```

## Destructive schema changes

Follow expand-contract for production safety:

1. **Expand**: add the new column / table (nullable or with a default)
2. **Deploy**: apply the migration, data starts populating
3. **Contract**: remove the old column / table in a second PR, after the first deploy is confirmed

Never drop a column and add a replacement in the same migration — deploy the add first.

## Seeding data

For dev/preview, seed via a script that uses the `db` client:

```ts
// scripts/seed-dev.ts
import { db } from '@nuxthub/db'
import { userTable, todoTable } from '@nuxthub/db/schema'

console.log('Seeding users...')
await db.insert(userTable).values([
  { id: crypto.randomUUID(), email: 'alice@seed.local', ... },
]).onConflictDoNothing()

console.log('Seeding todos...')
await db.insert(todoTable).values([
  { id: crypto.randomUUID(), userId: aliceId, title: 'Sample todo' },
]).onConflictDoNothing()

console.log('Seed complete.')
```

Use `.onConflictDoNothing()` for idempotent seeds. Use `crypto.randomUUID()` not `uuid` package.

## Local vs production

| Environment | DB | How accessed |
|---|---|---|
| Local dev (`pnpm dev`) | `.data/hub/d1/default.sqlite` | Emulated by NuxtHub; `pnpm db:migrate` applies |
| Preview (Cloudflare) | Separate D1 database per branch | NuxtHub applies migrations during `pnpm build` |
| Production (Cloudflare) | Production D1 database | NuxtHub applies migrations during `pnpm build` |

No per-environment configuration needed — NuxtHub selects the right binding based on `CLOUDFLARE_ENV`. For local dev, there's nothing to provision.

## Cross-layer foreign keys

D1 enforces FK constraints if you declare `.references()`. For strong layer isolation, consider whether to enforce at the DB level or only at the application level:

- **DB-level FK**: Drizzle enforces on insert/update/delete; safer but creates coupling between layers
- **Application-level only**: skip `.references()`, enforce in the route handler; keeps layers independent

The auth layer (userTable) is referenced by almost every other layer — that FK is worth enforcing at the DB level. Cross-feature FKs (todo → project) are judgment calls.
