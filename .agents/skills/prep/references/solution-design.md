# Solution Design

> Framework for picking an approach. Forces honest tradeoffs and alternative enumeration before committing to a plan.

## Core principles

- **YAGNI**: don't design for hypothetical future requirements. Build what the spec requires, no more.
- **KISS**: the simplest design that satisfies the requirements is the right design.
- **DRY**: avoid duplicating schema, validation, or business logic. Zod schemas live once in `shared/schemas/` and are imported by both server and client.

## "Two more, then pick" rule

Never commit to the first idea. Force at least 3 alternatives:

1. **First instinct** — what you'd write immediately
2. **Simpler version** — what could be cut? what's actually needed now?
3. **Opposite approach** — if instinct says "add a table", the opposite might be "use KV". If instinct says "add a service", opposite might be "inline it in the route".

Document all three. Record why you rejected two of them. This prevents revisiting the same decision in code review.

## Tradeoff dimensions

Evaluate each alternative against:

| Dimension | Question |
|---|---|
| Simplicity | How many moving parts? Can a reader understand it in 5 minutes? |
| Maintainability | How hard to change in 6 months? |
| Performance | Hot-path queries indexed? N+1 risk? |
| Security | Auth, authz, validation, secrets, isolation |
| Observability | Can you tell what happened when something breaks? |
| Reversibility | Can you undo this decision without a painful migration? |
| Cost-to-test | How hard to write a Vitest unit test? |

## Honest tradeoffs

Always write what you sacrificed. Examples:

- "Single-tenant for now. Multi-tenant requires a migration adding `tenantId` to every table."
- "No pagination on list — acceptable for < 100 items. Add cursor pagination when load testing shows N > 500."
- "Using `provide`/`inject` instead of a Pinia store — simplest for page-scoped state. If this data is needed on 3+ pages, promote to a store."

## Security checklist

For every design, verify:

- **Authn**: which routes require a session? Do they use `defineAuthenticatedHandler`?
- **Authz**: which routes require specific abilities? Do they use `defineAuthorizedHandler`? Are user-scoped queries filtered by `session.userId`?
- **Validation**: all user input goes through Zod. `readValidatedBody`, `getValidatedQuery`, `getValidatedRouterParams` at every server boundary.
- **Secrets**: nothing in `runtimeConfig.public.*` that shouldn't be in the browser. KV keys use server-controlled IDs, not user input.
- **User isolation**: `db.query.table.findMany({ where: eq(table.userId, session.userId) })` — missing `where` = data exposure bug.
- **Rate limiting**: sensitive endpoints (login, phone, OTP) need rate limiting via `nuxt-security` or KV-backed counter.

## Performance checklist

For any database-touching design:

- **Query API**: default to the relational API (`db.query.<table>.findFirst` / `findMany`) for reads. Drop to `db.select().from(...)` only for aggregates, set operations, or joins not expressible via `with:`. The plan should state which form each read uses and why if it picks `db.select`. See `.agents/skills/cook/references/database-workflow.md` ("Reads: prefer `db.query.<table>`...") for the full rule.
- **N+1 risk**: loops that issue one query per item. Define `relations()` in `schema.ts` and pull related rows via `db.query.x.findMany({ with: { ... } })` in a single round-trip; or batch with `db.batch([...])`.
- **Unbounded lists**: any `findMany` / `db.select` on user-facing routes without a `limit`. Add `limit` + optional cursor.
- **Missing index**: high-cardinality columns used in `.where()` should be indexed. Check `server/db/schema.ts` for `index()` definitions.
- **Cloudflare D1 context**: D1 is a globally distributed read-replica SQLite. Writes go to primary (single region), reads are local. Avoid write-heavy patterns in hot paths. D1 supports HTTP batch calls — use Drizzle's batch API for multi-row inserts.

## Edge cases and failure modes

For each design decision, document:

| Failure mode | Handling |
|---|---|
| Network timeout mid-request | Nuxt's error handling + `createError` |
| Halfway through a multi-step operation | Are partial states visible to users? Use a status field or transaction. |
| Concurrent identical writes | D1 SQLite serializes writes. No client-side race conditions if the server is the gatekeeper. |
| User input at boundaries | Zod + `readValidatedBody` rejects at the route. |

## API contract format

For each new route, document:

```
METHOD /api/<resource>[/:id]
Auth: unauthenticated | authenticated | ability: '<ability-string>'
Request body: <Zod schema name> (or none)
Query params: <Zod schema name> (or none)
Response 200: <shape>
Response 201: <shape> (create)
Response 400: { statusMessage: 'REASON' }
Response 401: (session missing)
Response 403: (ability missing)
Response 404: (resource not found)
```

## Schema / migration design (D1/SQLite)

For new tables, document:

```ts
// server/db/schema.ts additions
export const featureTable = sqliteTable('feature', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => userTable.id),
  title: text('title').notNull(),
  status: text('status', { enum: ['pending', 'active', 'done'] as const }).notNull().default('pending'),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})
```

SQLite type rules:
- IDs: `text` (UUID via `crypto.randomUUID()`)
- Dates: `integer({ mode: 'timestamp' })` (stored as Unix epoch)
- Booleans: `integer({ mode: 'boolean' })`
- JSON: `text({ mode: 'json' }).$type<SomeType>()`
- Enums: `text({ enum: [...] as const })` — no native SQLite enums
- FKs: `.references(() => otherTable.id)` — consider whether to enforce at DB level

**Destructive changes** (column rename, table drop): follow expand-contract:
1. Expand: add new column
2. Migrate data
3. Contract: remove old column (separate PR, after deploy confirmed)

**Generate and review migration**:
```bash
pnpm db:generate   # generates SQL in server/db/migrations/sqlite/
# Review the generated SQL file
pnpm db:migrate    # apply to local .data/ SQLite
nuxt db sql "SELECT * FROM <table> LIMIT 5"  # verify
```

## Test strategy

For each design decision, identify:

| Test type | What it covers | When needed |
|---|---|---|
| Unit (Vitest node) | Zod schema validation, pure utility functions | Always for new schemas |
| Nuxt (Vitest happy-dom) | Component rendering, composable behavior | UI components |
| E2E (Playwright) | Full user flow: create → read → update → delete | Every new feature |

If a phase has no test, document why. "Not needed" is a valid answer if the code is pure glue with no branches.

## Acceptance criteria format

At the bottom of every plan, a checkable list:

```markdown
## Acceptance criteria

- [ ] `GET /api/<resource>` returns 200 for authenticated users
- [ ] `POST /api/<resource>` with invalid body returns 400
- [ ] `PATCH /api/<resource>/:id` owned by another user returns 403
- [ ] `DELETE /api/<resource>/:id` removes the item; subsequent GET returns 404
- [ ] UI shows empty state when no items exist
- [ ] UI shows validation error on submit with empty required fields
- [ ] pnpm lint + typecheck + test + test:e2e all green
```

## Anti-patterns

| Anti-pattern | Why |
|---|---|
| One option, no justification | You don't know if it's right |
| Three options, all the same | You're not trying hard enough to find alternatives |
| Punted tradeoff with no documentation | Cook will make the wrong call |
| Premature abstraction | Two callers don't justify a helper; three might |
| Architecture astronomy | Designing for 10 layers of extensibility when one layer is needed now |
