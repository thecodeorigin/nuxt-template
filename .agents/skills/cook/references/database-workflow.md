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

### Common patterns

```ts
import { eq, and, desc } from 'drizzle-orm'

// List (user-scoped, always add WHERE to prevent data leaks)
const todos = await db.select().from(todoTable)
  .where(eq(todoTable.userId, session.userId))
  .orderBy(desc(todoTable.createdAt))
  .limit(50)

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

// Single item
const todo = await db.select().from(todoTable)
  .where(and(eq(todoTable.id, id), eq(todoTable.userId, session.userId)))
  .get()  // returns undefined if not found
```

**Always add a user-scoped WHERE clause** for user-owned data. Missing `.where(eq(todoTable.userId, session.userId))` = data exposure bug.

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
