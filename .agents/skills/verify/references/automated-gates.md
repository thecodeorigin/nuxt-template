# Automated Gates

> The cheap final safety net. By this point WALK / IMPERSONATE / PROBE
> proved the feature works; this step proves nothing else broke.

## The gauntlet

```bash
pnpm cli verify
```

Runs **lint → typecheck → test** with fail-fast. Same as CI. If you'd
rather see all failures in one pass:

```bash
pnpm cli verify --fail-fast=false
```

For e2e on top of the gauntlet:

```bash
pnpm cli verify && pnpm test:e2e
```

E2E isn't part of `pnpm cli verify` because it's the slowest signal
(30s–5min). Run it scoped first (see below), then full-suite only if
the scoped run passed.

## Scoping (do this first; full-suite second)

A full run can take 5+ minutes. For a focused change, run only the
suites that cover the touched layer:

```bash
# Vitest — one layer, unit + nuxt env
pnpm vitest run layers/project/test

# Vitest — single file
pnpm vitest run layers/project/test/unit/project-schema.test.ts

# Playwright — one layer's specs against the existing dev server
E2E_EXTERNAL_SERVER=1 pnpm exec playwright test layers/project/tests --reporter=list

# Playwright — single file
E2E_EXTERNAL_SERVER=1 pnpm exec playwright test layers/project/tests/project.e2e.ts --reporter=list
```

`E2E_EXTERNAL_SERVER=1` reuses the already-running `pnpm dev` instead
of booting a fresh server per run — ~30s faster per invocation.

After scoped passes, run the full suites once to catch cross-layer
regressions:

```bash
pnpm test            # all vitest projects (unit + nuxt) across root + layers
pnpm test:e2e        # all Playwright specs across root + layers
```

## Per-tool details

### Lint

```bash
pnpm lint            # check only
pnpm lint:fix        # auto-fix (~95% of issues)
```

After `lint:fix`, re-run `pnpm lint` to see what's left. In verify,
**don't `lint:fix` silently** — record the auto-fixed files. If lint
modified a hand-written file from this branch, the implementer should
know and review.

Manual fixes you'll see often:

- `max-statements-per-line` — break a multi-statement line
- `no-unused-vars` — remove the unused import (don't `_` it; just delete)
- `vue/no-mutating-props` — use `defineModel` or emit
- Hook order — reorder composable calls in `<script setup>`

### Typecheck

```bash
pnpm typecheck
```

Runs `nuxt typecheck` (vue-tsc). In the output:

- Read only lines containing `error TS`
- Ignore `warn` lines unless they're in files this branch touched
- `error TS2353` (extra property) often means the schema and the
  consumer disagree — read both before suggesting a fix

If typecheck fails at the verify stage, the implementer left work
undone. **Report it; don't fix it.** Verify's job is to find, not to
finish.

### Vitest

```bash
pnpm test                              # all projects
pnpm vitest run --project unit         # node-env only
pnpm vitest run --project nuxt         # nuxt/happy-dom only
```

Project layout (from `vitest.config.ts`):

| Project | Where | Env |
|---|---|---|
| `unit` (root) | `test/unit/**/*.test.ts` | node |
| `unit` (layers) | `layers/*/test/unit/**/*.test.ts` | node |
| `nuxt` (layers) | `layers/*/test/nuxt/**/*.test.ts` | nuxt + happy-dom |

Reading failures:

1. Assertion diff — what expected vs actual?
2. File:line — go read the assertion
3. Re-run the single file in watch: `pnpm vitest layers/.../specific.test.ts`

### Playwright

```bash
pnpm test:e2e                          # headless, all specs
pnpm test:e2e:ui                       # UI mode (debugging)
```

On failure, **always read `test-results/<spec>/error-context.md` first**.
It contains:

- The assertion
- DOM snapshot at the moment of failure
- Often a screenshot

Common failure causes:

- Selector mismatch — UI changed; locator outdated
- Dev server not running — `curl -sf http://localhost:3002` to confirm
- Auth state drift — the spec assumed a session; verify the fixture

## Coverage gap analysis

After scoped runs pass, look at what's covered vs what was walked.

For each acceptance criterion verified in WALK:

- Is there an e2e test in `layers/<changed>/tests/` exercising it?
- If no — that's a **GAP**: behaviour works but isn't regression-proof.
  Name it in the report; don't write the test (cook owns that).

For each new route probed in PROBE:

- Is there a Vitest test covering the authn / authz / validation
  branches?
- If no — same: GAP, named in the report.

Example GAP entries:

```
GAP: layers/project/tests/project-cross-tenant.e2e.ts missing
     — verified manually that Alice gets 403 for Bob's project,
       but no automated regression for this isolation check.

GAP: layers/project/test/unit/project-route.test.ts missing
     — verified manually that POST /api/projects rejects empty name
       with 400, but no Vitest case asserts the Zod schema rejects.
```

GAPs are follow-ups, not blockers. They go in the report but they
don't fail verification — a working feature without coverage is still
a working feature.

## When a gate fails

This is a finding, not a problem to silence:

- Lint fail → report the rule + file:line. Don't `--no-verify`.
- Typecheck fail → report the error code + file:line. Don't `any`-cast.
- Test fail → report the assertion + file:line. Don't skip / xfail.

If the implementer asked you to verify because they want to merge,
finding a failing gate is the most valuable thing verify can return —
it stops a bad merge. Hand the failure back specifically:

> ❌ FAIL — `pnpm typecheck` fails at
> `layers/project/server/api/projects/[id].patch.ts:42` — `body.name`
> is `string | undefined` but the schema expects `string`. The Zod
> schema and the route disagree; fix one to match the other.

Specific enough that the next cook session can act on it without
re-investigating.
