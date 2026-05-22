# Codebase Understanding

> 30-minute version of "read the codebase." Follow this before designing anything for a project you haven't touched before, or before any schema/architecture change.

## Read order

1. `README.md` — high-level orientation
2. Root `CLAUDE.md` — conventions, stack, hard rules, deployment pipeline
3. `layers/todo/CLAUDE.md` — the canonical CRUD template (mirror its shape for any new feature)
4. `layers/auth/CLAUDE.md` — auth conventions (sessions, CASL, impersonation)
5. `server/db/schema.ts` — tables, columns, types, constraints
6. Closest existing feature end-to-end (schema → route → API wrapper → composable → page → tests)

Never skip steps 2–5. The CLAUDE.md files are authoritative; README can lag.

## Per-project pattern recognition

### This project's architecture

- **Multi-layer**: `layers/<name>/` — each is a mini Nuxt app with `app/`, `server/`, `shared/`, `test/`, `tests/`
- **Cross-cutting infrastructure** at project root: `server/db/schema.ts`, `server/utils/`, `app/lib/`, `shared/utils/`
- **File-based routing**: `layers/<name>/app/pages/<route>.vue` → URL `/<route>`
- **API file-per-action**: `server/api/<resource>/index.get.ts`, `index.post.ts`, `[id].patch.ts`, `[id].delete.ts`
- **Tests per layer**: `layers/<name>/test/unit/` (Vitest node), `layers/<name>/test/nuxt/` (Vitest happy-dom), `layers/<name>/tests/` (Playwright e2e)

### Database (mandatory read for any DB-touching work)

- Schema at `server/db/schema.ts` — SQLite via Cloudflare D1 (NuxtHub)
- Migrations in `server/db/migrations/sqlite/` — review the most recent one for schema history
- SQLite types: `text` for UUIDs, `integer({ mode: 'timestamp' })` for dates, `integer({ mode: 'boolean' })` for booleans, `text({ mode: 'json' })` for JSON, `text({ enum: [...] })` for enums
- DB client: `import { db } from '@nuxthub/db'`
- Schema types: `import { userTable, type User } from '@nuxthub/db/schema'` (re-exports from `server/db/schema.ts`)
- **Must read before any DB work**: table definitions, column nullability, FK relationships, existing indexes

### Auth + authorization

- Sessions: `kv.get('session:<sessionId>')` — KV-backed, HttpOnly cookie
- `defineAuthenticatedHandler(handler)` — throws 401 if no session
- `defineAuthorizedHandler(checks, handler)` — throws 403 if no check passes; checks can be ability strings or async functions
- CASL abilities on `session.abilities: string[]`
- Frontend: `useAbility()` composable, `<Can I="read" a="resource">` component
- Impersonation: admin's session backed up at `impersonator:session:<sid>`, live session becomes target user

## Schema reading (mandatory for DB-touching work)

For every table you'll touch:

1. Column names + types + nullability
2. Default values and `$defaultFn` expressions
3. FK constraints (what does this table reference? what references it?)
4. Indexes (what queries are optimized? what isn't indexed?)
5. Most recent migration SQL — what changed last?

Also check: does this table have soft-delete (`deletedAt`)? Is there a status column with specific allowed values?

## Reading conventions

Walk a complete existing feature and note:

- **File naming**: `index.get.ts` (list), `index.post.ts` (create), `[id].get.ts` (single), `[id].patch.ts` (update), `[id].delete.ts` (delete)
- **Error handling**: `createError({ statusCode, statusMessage })` in server routes
- **Imports**: NuxtHub packages (`@nuxthub/db`, `@nuxthub/kv`, `@nuxthub/blob`), auth services (`#layers/auth/server/services/auth`)
- **Zod schemas**: live in `shared/schemas/`, imported by both server (validation) and client (type inference)
- **Client API wrapper**: verb-noun functions in `app/api/use<Name>Api.ts`, uses `$http` (not raw `$fetch`)
- **Component imports**: explicit, never auto-registered — `import Form from '#layers/<name>/app/components/<Namespace>/Form.vue'`

## Cross-cutting concerns to map

| Concern | Where it lives | How it works |
|---|---|---|
| Auth | `layers/auth/server/services/auth.ts` | `defineAuthenticatedHandler` wraps routes |
| Authorization | `layers/auth/server/services/casl.ts` | `defineAuthorizedHandler` with ability checks |
| Sessions | KV: `session:<sessionId>` | HttpOnly cookie; CASL abilities in session |
| DB schema | `server/db/schema.ts` | Drizzle ORM + D1 SQLite |
| Migrations | `server/db/migrations/sqlite/` | Applied via `pnpm db:migrate` |
| KV cache | `server/utils/cache.ts` | `getCachedOrFetch` wrapper |
| Error handling | `createError()` in routes | Mapped to HTTP status codes |
| Validation | Zod schemas in `shared/schemas/` | `readValidatedBody` at boundary |
| UI components | Nuxt UI v4 | `<U*>` only, semantic colors only |
| State | `provide`/`inject` for page-scoped; Pinia for global (auth only) | |

## Cross-layer boundaries

| Layer | Owns | Imports from |
|---|---|---|
| `auth` | Sessions, OAuth, CASL, impersonation, seed users | Project root (DB schema, KV) |
| `todo` | Todo CRUD feature | `#layers/auth/server/services/auth` |
| Any new layer | Its specific feature | `#layers/auth/server/services/auth`, DB schema at root |

Cross-layer imports use `#layers/<name>/...` aliases. `~~/...` resolves to project root. Never import backwards (auth shouldn't import from todo).

## Read closest feature end-to-end

Pick the most structurally similar existing feature (`layers/todo/` is canonical). Read in order:

1. `shared/schemas/<entity>.ts` — Zod shapes + inferred types
2. `server/api/<resource>/index.get.ts` — list route
3. `server/api/<resource>/index.post.ts` — create route
4. `app/api/use<Name>Api.ts` — client wrapper
5. `app/composables/use<Name>.ts` — page-scoped state
6. `app/pages/<name>.vue` — page composition
7. `test/unit/<name>-schema.test.ts` — Zod boundary tests
8. `test/nuxt/<name>-page.test.ts` — component tests
9. `tests/<name>.e2e.ts` — Playwright e2e

Copy 80% of its shape. Diverge only where the new feature requires it.

## Capture your learning

After reading, write down:
- **Current state** (5 lines): what this project does today
- **3 surprises**: things that weren't obvious from the README
- **3 confirmations**: things that matched expectations

This prevents re-investigating the same things mid-plan.

## Anti-patterns

| Anti-pattern | Cost |
|---|---|
| Read every file (unfocused) | Wastes context; doesn't build mental model |
| Trust README over code | README can lag; code is truth |
| Skip schema.ts | Causes type errors and wrong migration assumptions |
| Skip CLAUDE.md | Violates conventions you didn't know existed |
| Re-investigate mid-plan | Signals prep wasn't thorough enough |
