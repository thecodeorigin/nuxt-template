# Plan Organization

> How to structure plan files based on impact. Consistency enables cook to navigate without re-reading everything.

## Impact analysis (decide depth first)

| Impact | Threshold | Plan depth |
|---|---|---|
| Low | < 5 files, no schema changes, no public API changes | `plan.md` only |
| Medium | 5–15 files, 1 table added/changed | `plan.md` + phase files |
| High | 15+ files, multi-table changes, new layer, new architecture | `plan.md` + phases + `research/` |

When in doubt, go one level deeper. The cost of over-organizing is low; the cost of under-organizing is re-planning.

## Naming

```
<summary>-<id>
```

- `<summary>`: 2–4 words, kebab-case, describes the feature. Examples: `todo-crud`, `profile-settings`, `auth-impersonation-flow`, `blob-upload-route`
- `<id>`: 5–8 char random alphanumeric. Examples: `a3f9k`, `7bx2mw`

Full example: `.claude/plans/todo-crud-a3f9k/`

## Directory layout

### Low impact (plan.md only)
```
.claude/plans/feature-name-id/
  plan.md
```

### Medium impact
```
.claude/plans/feature-name-id/
  plan.md           # index: goal, approach, phase table, file map, criteria
  phase-01-schema.md
  phase-02-server-routes.md
  phase-03-client-api.md
  phase-04-components.md
  phase-05-tests.md
```

### High impact
```
.claude/plans/feature-name-id/
  plan.md
  research/
    debate-synthesis.md     # debate record (required)
    schema-analysis.md      # DB investigation notes
    existing-patterns.md    # what the codebase already does
  phase-01-cross-cutting.md
  phase-02-server.md
  phase-03-client.md
  phase-04-tests.md
```

## `plan.md` contents (required sections)

```markdown
# Plan: <feature name>

> ❓ Open question 1 (must answer before cooking)
> ❓ Open question 2

## Goal & Context
<2–3 sentences: what this achieves and why>

## Approach
<2–3 sentences: chosen approach and why it was preferred over alternatives>
Alternatives rejected: <name> (reason), <name> (reason)

## Phases

| # | Phase | Depends on | Status |
|---|-------|-----------|--------|
| 1 | Schema | — | pending |
| 2 | Server routes | 1 | pending |
| 3 | Client API | 2 | pending |
| 4 | Components + page | 3 | pending |
| 5 | Tests | 4 | pending |

## Cross-phase file map

| File | Created in | Modified in |
|---|---|---|
| `server/db/schema.ts` | Phase 1 | — |
| `layers/<name>/shared/schemas/<entity>.ts` | Phase 1 | — |
| `layers/<name>/server/api/<resource>/index.get.ts` | Phase 2 | — |
| ... | | |

## Test strategy

| Test type | File | What it covers |
|---|---|---|
| Unit (Vitest node) | `layers/<name>/test/unit/<name>-schema.test.ts` | Zod validation |
| Nuxt (Vitest) | `layers/<name>/test/nuxt/<name>-page.test.ts` | Component/composable |
| E2E (Playwright) | `layers/<name>/tests/<name>.e2e.ts` | Full user flow |

## Acceptance criteria

- [ ] GET /api/<resource> returns 200 for authenticated user
- [ ] POST /api/<resource> with invalid body returns 400
- [ ] ...
- [ ] pnpm lint + typecheck + test + test:e2e all green
```

## Phase file contents (required sections)

```markdown
# Phase <n>: <name>

**Depends on**: Phase <n-1>
**Blocks**: Phase <n+1>

## Goal
<one sentence>

## Files

| File | Action | Notes |
|---|---|---|
| `path/to/file.ts` | Create | New Zod schema |
| `path/to/other.ts` | Edit | Add new route handler |

## Steps

### Step 1: <verb + object>
Tool: Write
File: `path/to/file.ts`
```ts
// full file content here
```

### Step 2: <verb + object>
Tool: Edit
File: `path/to/other.ts`
Old:
```ts
// existing code to replace
```
New:
```ts
// replacement code
```

### Step 3: Verify
```bash
pnpm vitest run --project unit layers/name/test/unit/name-schema.test.ts
```
Expected: all tests pass (exit 0)

## Rollback (if applicable)
<how to undo this phase if it goes wrong>
```

## Status tracking

Update the phase table in `plan.md` as cook works through phases:

| Status | Meaning |
|---|---|
| `pending` | Not started |
| `in-progress` | Cook is working on it |
| `complete` | Phase done, verified |
| `blocked` | Stuck, needs attention |

## Anti-patterns

| Anti-pattern | Why bad |
|---|---|
| No `<id>` in directory name | Name collisions across plans |
| Mixed scope (two features in one plan) | Cook can't parallelize; changes are coupled |
| Questions buried in phase files | Cook skips them; bad assumptions get baked in |
| No acceptance criteria | "Done" is undefined |
| No cross-phase file map | Cook doesn't know which files are shared across phases |
| Plan that grew past its original scope | Stop and re-invoke prep with the expanded scope |
