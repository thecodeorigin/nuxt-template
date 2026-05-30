---
name: cook
description: Disciplined REPL workflow for implementation work — state → plan → edit → verify → fix → repeat. Framework-agnostic loop that keeps you from drifting into speculation. Load when implementing a plan from prep, debugging a failing test, or making any multi-file change.
---

# Cook — Disciplined REPL Workflow

Cook is the execution skill. It enforces a tight state → plan → edit → verify → observe → decide loop that prevents speculation chains and wasted turns.

## When to invoke

- Multi-file feature (schemas + routes + API + components + tests)
- End-to-end entity hookup (new Nuxt layer from scratch)
- Debugging a flaky test or prod-broken-in-dev
- Schema adaptation (table rename, column addition)
- Any iteration where "edit and hope" has been failing

**Skip when**: trivial 2-line change with obvious impact.

## The loop

```
STATE → PLAN → EDIT → VERIFY → OBSERVE → DECIDE
```

### 1. STATE — read reality before changing

- What branch am I on? (`git status`)
- What's running? (dev server, any background processes)
- What does the current code actually say? (Read the files you're about to edit)
- What do the current tests say? (run the specific test suite first)
- What does the DB look like? (`nuxt db sql "SELECT * FROM ..."`)

Don't assume. Read.

### 2. PLAN — smallest next step

Write down (in your internal monologue or task description):
- Which single file am I editing?
- What exactly am I changing?
- What signal will tell me it worked?

One focused change per cycle. Not "implement the whole route" — "add the Zod schema".

**If this step writes to the DB**, the file you're editing is a task at
`<layer>/server/tasks/{seed,create,update,refactor}/<noun>.ts` and/or
its service in `<layer>/server/services/`. Don't reach for `nuxt db
sql` or an ad-hoc `tsx` script — load the `data` skill instead.

### 3. EDIT — one focused change

- Prefer `Edit` over `Write` for existing files (sends only the diff)
- Only write `Write` for new files or complete rewrites
- One logical change per tool call

### 4. VERIFY — cheapest relevant signal first

Run in ascending cost order:

```
typecheck (~10s) → lint (~10s) → unit tests (~5–30s) → e2e (~30–300s)
```

After a focused edit: `pnpm typecheck` first. If it passes, run the specific test.
After a batch of edits: add `pnpm lint`.
Before calling a phase done: run `pnpm test && pnpm test:e2e`.

### 5. OBSERVE — confirm in reality

- `pnpm typecheck` exit 0 doesn't mean the feature works — check the UI
- `take_snapshot` or `take_screenshot` in the browser (Chrome DevTools MCP)
- Check `list_console_messages({ types: ['error'] })` after any UI change
- Check actual DB state with `nuxt db sql "SELECT ..."` after any write operation

### 6. DECIDE — keep, small fix, retreat, or branch

| Signal | Action |
|---|---|
| Tests pass, UI looks right | ✓ Keep — move to next step |
| One clear error | Small fix — single-bug rule: fix it, verify |
| Multiple errors cascading | Retreat — revert the last change, re-plan |
| Deeper assumption wrong | Branch — mark current state, try alternative approach |

## Anti-patterns that bleed turns

| Anti-pattern | Why it hurts |
|---|---|
| Edit without observing | You don't know if it worked |
| Watch only typecheck | Compiles ≠ works at runtime |
| Run all tests at once | Wall of failures with no clear root cause |
| Chained speculation ("maybe this fixes it" × 3) | You're now 3 changes deep with no verified checkpoint |
| Fight the test instead of the bug | The test is right; find the bug it's exposing |
| Ignore a warning | Warnings become errors; address them or document why they're safe |
| Re-read a file you just edited | Trust what you wrote; re-reads waste context |
| Generate 30 files, then typecheck | Generate one, verify, then the next |

## When to invoke other skills mid-cook

| Situation | Skill |
|---|---|
| Need to write to the DB (create row, update row, refactor data) | `data` — never type `nuxt db sql "INSERT ..."`, write a task |
| Adding a route / sidebar item / admin action | Check the permission catalog + grants per `data` skill's `permission-aware-data.md` before declaring the step done |
| Chrome DevTools MCP not connecting | `chrome-devtools-mcp:troubleshooting` |
| LCP / performance issue | `chrome-devtools-mcp:debug-optimize-lcp` |
| Accessibility issue | `chrome-devtools-mcp:a11y-debugging` |
| Code getting messy / redundant | `simplify` |
| Need to add/change a permission or hook | `update-config` |
| Running into a major architectural blocker | Stop cook, re-invoke `prep` |

## Reference files

| Reference | When to load |
|---|---|
| `references/verification-cadence.md` | Which command at which stage |
| `references/tests.md` | Writing or debugging Vitest + Playwright tests |
| `references/database-workflow.md` | Any D1/SQLite work |
| `references/background-procs.md` | Managing dev server, port conflicts |
| `references/repl-loop.md` | Chrome DevTools MCP browser automation |
| `references/error-recovery.md` | Stuck in a fix loop |
| `references/code-generation.md` | Generating multiple similar files |
