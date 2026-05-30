# Report Format

> Every verification ends with a structured report. The format is
> opinionated: evidence is required, "looks good" is not a verdict.

## Why a fixed format

The report is the artifact a reviewer, PR author, or future-you reads
to decide whether to merge. It needs to be:

- **Scannable** — verdict at the top, details below
- **Specific** — file:line references, exact reproduction steps
- **Auditable** — every PASS cites evidence; every FAIL cites the
  failing observation
- **Actionable** — every FAIL says what to fix; every GAP says what to
  add

## Top-level verdict

The report opens with one of these three labels:

| Verdict | Meaning |
|---|---|
| **VERIFIED** | All acceptance criteria PASS, permission matrix clean, all gates green |
| **FAILED** | One or more acceptance criteria FAIL, or any gate red, or any permission cell FAIL |
| **PARTIAL** | Some criteria couldn't be verified (BLOCKER), but everything that was verified passed |

A change is mergeable only when **VERIFIED**.

## Report skeleton

````markdown
# Verification report — <branch or PR title>

**Verdict**: VERIFIED | FAILED | PARTIAL
**Plan**: `.claude/plans/<slug>/plan.md` (or "no plan; per user request")
**Diff**: <N> files across <layer-1>, <layer-2>
**Verified by**: <agent / session label>

## Summary

<2–4 sentences: what was checked, the outcome, anything notable>

## Acceptance criteria

| # | Criterion | Persona | Verdict | Evidence |
|---|-----------|---------|---------|----------|
| 1 | <criterion text> | alice@seed.local | PASS | snapshot post-create |
| 2 | <criterion text> | admin@seed.local | FAIL | see "Findings" #1 |
| 3 | <criterion text> | anonymous | BLOCKED | dev server crashed during run |

## Permission matrix

| Route / surface | admin | alice (own) | alice (cross-tenant) | bob | anonymous |
|---|---|---|---|---|---|
| `/projects` | ✓ | ✓ | 403 ✓ | ✓ | redirect ✓ |
| `POST /api/projects` | 201 ✓ | 201 ✓ | n/a | 201 ✓ | 401 ✓ |
| `GET /api/projects/:id` | ✓ | ✓ | **200 ✗** | ✓ | 401 ✓ |

## Endpoint probes

| Method + path | Caller | Expected | Observed | Verdict |
|---|---|---|---|---|
| POST `/api/projects` | alice, empty body | 400 | 400 ✓ | PASS |
| POST `/api/projects` | alice, `{name:"Acme"}` | 201 | 201 ✓ | PASS |
| GET `/api/projects/<bob-id>` | alice | 403/404 | **200 ✗** | FAIL |

## Automated gates

| Gate | Result | Notes |
|---|---|---|
| `pnpm lint` | ✓ | clean |
| `pnpm typecheck` | ✓ | clean |
| `pnpm test` (scoped: `layers/project/test`) | ✓ | 18 passing |
| `pnpm test:e2e` (scoped: `layers/project/tests`) | ✓ | 4 passing |
| `pnpm test` (full) | ✓ | 142 passing |
| `pnpm test:e2e` (full) | ✓ | 27 passing |

## Findings (FAIL / BLOCKER)

### 1. FAIL — Cross-tenant read on `/api/projects/:id`

**Where**: `layers/project/server/api/projects/[id].get.ts:14`

**Repro**:
1. `POST /api/auth/dev-login {email: "bob@seed.local"}`
2. `POST /api/projects {name: "bob-private"}` → note returned id
3. `POST /api/auth/dev-login {email: "alice@seed.local"}`
4. `GET /api/projects/<bob-private-id>`

**Expected**: 403 or 404 (Alice has no access to Bob's project)
**Observed**: 200 with Bob's project body (data leak)

**Why**: the handler filters by `id` only — missing
`and(eq(projectTable.id, id), eq(projectTable.userId, session.id))`
in the where clause.

**Suggested fix**: add the `userId` predicate. See
`layers/auth/server/api/roles/[id].patch.ts:18` for the pattern.

## Coverage gaps (GAP — non-blocking)

### GAP 1 — Missing e2e for cross-tenant isolation

`layers/project/tests/project-cross-tenant.e2e.ts` doesn't exist.
The manual probe above caught the leak; a Playwright spec would catch
the regression next time. Suggest adding after FAIL #1 is fixed.

### GAP 2 — Missing Vitest for the Zod rejection branch

`layers/project/test/unit/project-schema.test.ts` exists but doesn't
assert `name === ''` is rejected. Add a case.

## Notes

<anything else: env quirks, headless limitations, deferred checks>
````

## Evidence requirements

Each PASS row needs one of:

- **Snapshot reference** — "snapshot post-create at <step N>"
- **Endpoint response** — status code + truncated body excerpt
- **Test output** — "18 passing in layers/project/test"

Each FAIL row needs:

- **Where** — file:line of the failing code (best guess)
- **Repro** — numbered steps a third party can replay
- **Expected vs Observed** — both, side by side
- **Suggested fix** — one sentence pointing at the smallest change

Each BLOCKER row needs:

- **What's blocking** — concrete (e.g. "dev server returns 500 on
  every request; logs show missing NUXT_AUTH_SECRET")
- **Unblocker** — what would let verification proceed

Each GAP needs:

- **Missing test file path** (where it would live)
- **What it would assert** — one sentence
- **Why it's a gap, not a fail** — the behaviour works; coverage doesn't

## What NOT to include

- "Looks good" / "seems to work" without evidence
- Screenshots of unchanged pages (snapshots are cheaper)
- Full test logs (cite the count + spec name; full output is in CI)
- Speculation about other parts of the codebase ("might also affect X")
  — verify what was changed; file a follow-up if you suspect more

## Length guide

- A small change (single route): report fits in ~50 lines
- A medium change (one layer feature): ~150 lines
- A large change (multi-layer): ~300 lines, split findings into
  per-layer sections

If the report is longer than the diff was, something's off — either
the verification went out of scope, or every change deserves its own
verify run.

## Where to save it

Verification reports are working artifacts, not durable docs. Default:
output to the chat / PR comment thread, not committed files.

If the user asks for a persistent report:

```
.claude/verifications/<branch>-<YYYY-MM-DD>.md
```

(`.claude/` is gitignored except for `commands/` and `agents/` —
verifications don't pollute the repo.)
