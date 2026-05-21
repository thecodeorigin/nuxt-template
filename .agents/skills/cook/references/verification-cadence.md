# Verification Cadence

> Run checks in ascending cost order. Fail fast; don't wait for e2e to catch a type error.

## Cost order

| Check | Command | Time | Truncates DB? | When to run |
|---|---|---|---|---|
| Typecheck | `pnpm typecheck` | ~10s | No | After every focused edit |
| Lint | `pnpm lint` | ~10s | No | After a batch of edits |
| Unit tests | `pnpm test` (or `pnpm vitest run --project unit`) | ~5–30s | No | After schemas / utils change |
| Nuxt tests | `pnpm test` (or `pnpm vitest run --project nuxt`) | ~10–60s | No | After component / composable change |
| E2E (Playwright) | `pnpm test:e2e` | ~30–300s | No (uses dev server) | Before marking a phase done |

## Commands

### Typecheck
```bash
pnpm typecheck
```
Runs `nuxt typecheck` (vue-tsc). Read only lines containing `error TS`. Ignore `warn` lines unless they're in your changed files.

### Lint
```bash
pnpm lint        # check only (shows all errors)
pnpm lint:fix    # auto-fix what can be fixed (~95% of issues)
```
After `lint:fix`, re-run `pnpm lint` to see what couldn't be auto-fixed.

Common manual fixes:
- `max-statements-per-line` — break a multi-statement line
- `no-unused-vars` — remove unused imports
- `no-mutating-props` — use `defineModel` or emit instead
- Hook order violations — reorder composable calls

### Unit + Nuxt tests (Vitest)
```bash
pnpm test                              # run all Vitest projects
pnpm vitest run --project unit         # only node-env unit tests
pnpm vitest run --project nuxt         # only Nuxt/happy-dom tests
pnpm test:watch                        # interactive watch mode
```

Run a single file:
```bash
pnpm vitest run layers/todo/test/unit/todo-schema.test.ts
```

### E2E (Playwright)
```bash
pnpm test:e2e                          # headless, all specs
pnpm test:e2e:ui                       # Playwright UI mode (debugging)
E2E_EXTERNAL_SERVER=1 pnpm exec playwright test --reporter=list   # use running dev server (faster)
E2E_EXTERNAL_SERVER=1 pnpm exec playwright test layers/todo/tests/todo.e2e.ts --reporter=list  # single file
```

On failure: always read `test-results/<spec>/error-context.md` first — it has the assertion, DOM snapshot at failure, and often a screenshot.

## When to run each check

**After a focused single-file edit:**
```bash
pnpm typecheck
```
If it passes, run the specific test covering that file:
```bash
pnpm vitest run layers/todo/test/unit/todo-schema.test.ts
```

**After a batch of related edits (schema + route + API wrapper):**
```bash
pnpm lint:fix && pnpm lint && pnpm typecheck && pnpm test
```

**Before marking a phase complete:**
```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e
```

**The verify gauntlet (before declaring done):**
```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e
```
All four must exit 0. Fix the root cause; never silence a checker.

## What "green" actually means

| Green | Doesn't mean |
|---|---|
| `pnpm typecheck` exits 0 | Feature works at runtime |
| `pnpm test` exits 0 | UI is correct |
| `pnpm test:e2e` exits 0 | Edge cases are covered |

For any user-facing feature: take a screenshot or snapshot in the browser after passing all checks. Don't claim done from exit codes alone.

## Reading test failures

### Vitest failures
1. Read the assertion diff — what expected vs actual?
2. Check the file:line reference — go to the test, read the assertion
3. Check if env vars are set: `NUXT_POSTGRES_URL` is not needed (this project uses D1), but check for any missing env vars
4. Run in watch mode to iterate fast: `pnpm test:watch`

### Playwright failures
1. **Always read `test-results/<spec-name>/error-context.md` first** — has assertion, DOM snapshot, often a screenshot
2. Look for selector mismatches (element rendered differently than expected)
3. Check if the dev server was running: `curl -sf http://localhost:3000 > /dev/null && echo up || echo down`
4. Run with UI mode for visual debugging: `pnpm test:e2e:ui`
