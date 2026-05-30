---
name: verify
description: Verify that a change from /prep + /cook actually delivers the business value the user asked for. Walks the live app like a real user (Chrome DevTools MCP), confirms the plan's acceptance criteria visually, runs the permission matrix via impersonation, probes API endpoints, then runs e2e / unit / lint / typecheck as the final safety net. Use after cook reports "done" and before declaring a phase complete, opening a PR, or merging.
---

# Verify — Outcome-First Validation

Verify is the third leg of the triad: **prep** plans, **cook** executes,
**verify** confirms the outcome is what was actually requested.

This skill is opinionated about **order**. Cook's inner loop runs checks
in ascending cost (typecheck → e2e) to fail fast while editing. Verify
inverts that: it starts with the highest-value signal (a real user
clicking a real page) and only drops to automated gates at the end. The
reason: a passing test suite never proves a feature delivers value, but
a real walkthrough does — and once the walkthrough passes, the cheap
checks just confirm there are no regressions.

## When to invoke

- A cook session reported "done" — before you accept the result
- Before opening a PR
- Before merging a PR with green CI (CI proves the suite passes; it
  doesn't prove the feature ships value)
- After pulling someone else's branch you haven't seen
- When the user says "is this actually working?" or "did /cook ship
  what /prep planned?"

**Skip when**: the change is a one-line typo, a comment fix, or a pure
internal refactor with no observable behaviour change.

## The flow

```
ORIENT → WALK → IMPERSONATE → PROBE → COVER → GATE → REPORT
```

Each step gates the next. If WALK fails, stop and report — don't keep
verifying lower-value layers on a feature that doesn't actually load.

### 1. ORIENT — load the plan and the diff

Read what was supposed to ship and what actually shipped. You can't
verify outcome against intent if you don't know intent.

- The plan: `.claude/plans/<slug>/plan.md` — pull the **acceptance
  criteria** and **phase table**. If no plan exists, ask the user
  what the change was meant to do — don't guess.
- The diff: `git status` + `git log <base>..HEAD --oneline` + `git diff
  --stat <base>..HEAD`. Note which layers changed; that's your
  walkthrough surface.
- Pre-existing infra gaps: scan `.env` for any production-required
  keys that are empty (deferred `/onboard` items). Don't blame them
  on this change; flag them separately if they actually block
  verification (e.g. missing `NUXT_SMTP_PASS` while verifying email
  flows).

Output of this step: a list of **acceptance criteria** to check, and a
list of **changed surfaces** (pages, routes, components, schema).

### 2. WALK — confirm business value in the live app

Open the live app and walk the feature as the **target persona** for
this change (not as an admin — admins see everything; the target user
is the one who should be able to do the new thing).

- Start the dev server if not running (`pnpm dev`, background — see
  `references/visual-checks.md`).
- Authenticate as the target persona (`/api/auth/agent` for the default
  agent user, or POST `/api/auth/dev-login` with a seed email for
  specific roles — see `references/permission-matrix.md`).
- For each acceptance criterion from ORIENT, **do the user action**
  and observe the outcome. Capture a snapshot per criterion. Capture
  a screenshot only when layout / visual rendering is the thing being
  verified (don't spam screenshots — see
  `references/visual-checks.md`).
- After every action, check the console for errors and the network tab
  for failed requests.

Each acceptance criterion gets one of: **PASS** (with evidence),
**FAIL** (with reproduction), or **BLOCKED** (with reason).

If any acceptance criterion fails, **stop here** and report. The lower
layers don't matter if the feature doesn't ship its stated value.

See `references/acceptance-walkthrough.md` for the full pattern.

### 3. IMPERSONATE — build the permission matrix

A feature can ship value to the target persona and still be broken
because the wrong people can see it (data leak) or the right people
can't (authz bug). Build a matrix.

For each route/component the change touches, verify visibility against
the seed user matrix:

| User | Role / abilities | Should see |
|---|---|---|
| `admin@seed.local` | system admin, all `*:manage` | everything |
| `alice@seed.local` | personal org admin | her own org's resources |
| `bob@seed.local` | personal org admin | his own org's resources |
| anonymous (no session) | none | login page only |

Two mechanisms:

- **Switch identities** via `POST /api/auth/dev-login { email }` — fast,
  no impersonation footprint, ideal for verifying baseline visibility
  per role.
- **Impersonate** via `POST /api/auth/impersonate/start { user_id }` —
  signed in as admin, simulate viewing as another user. Verifies the
  impersonation flow itself plus what an admin sees through someone
  else's eyes. Always `POST /api/auth/impersonate/stop` to clean up.

Each matrix cell gets PASS / FAIL / NOT APPLICABLE. Specifically check:

- A user without the required ability gets a forbidden / 403 / redirect
- A user **with** the ability sees the feature
- Cross-tenant isolation: Alice cannot read Bob's resources by ID
- Sidebar / nav items hide when the underlying ability is missing
  (the `useLayerRegistry` contribution should be ability-gated)

See `references/permission-matrix.md` for the full procedure.

### 4. PROBE — endpoint accessibility

The UI only exercises a subset of each route's behaviour. Hit the
endpoints directly to confirm status codes match intent.

For every server route the change added or modified:

| Caller | Expected status |
|---|---|
| No session | 401 |
| Authenticated but lacks ability | 403 |
| Authenticated, has ability, missing/bad input | 400 (Zod) |
| Authenticated, has ability, well-formed input | 200 / 201 / 204 |
| Authenticated, accessing someone else's resource by ID | 403 or 404 (never 200) |

Probe via `evaluate_script` from the authenticated browser, or via
`pnpm cli` helpers, or via raw `curl` with a session cookie. See
`references/endpoint-checks.md` for the cheat sheet and the routes that
need extra scrutiny (mutations, file uploads, webhooks, rate-limited
endpoints).

### 5. COVER — run existing tests + gap analysis

Now (and only now) run the existing automated coverage for the changed
area. The earlier steps confirmed the feature ships value; this step
confirms there are no regressions and flags missing coverage.

- Run **scoped Vitest** for changed layers: `pnpm vitest run
  layers/<changed-layer>/test`
- Run **scoped Playwright** for changed flows: `E2E_EXTERNAL_SERVER=1
  pnpm exec playwright test layers/<changed-layer>/tests --reporter=list`
- Read failures via `test-results/<spec>/error-context.md` first (DOM
  snapshot + assertion at the moment of failure)

Then do gap analysis: was an acceptance criterion verified by walking
but **not** covered by an e2e test? Flag it in the report as a coverage
gap — don't write the test yourself (that's the implementer's job in
the next cook session), but name it specifically.

See `references/automated-gates.md` for command details.

### 6. GATE — lint + typecheck (the cheap final net)

Last, because by this point a typecheck failure means cook left a
loose end, not that the feature is broken.

```bash
pnpm lint && pnpm typecheck && pnpm test
```

(`pnpm cli verify` runs lint + typecheck + test in one go and is the
same gauntlet CI runs. Prefer it for the final pass.)

All three must exit 0. Lint warnings in changed files count as failures
unless the implementer explicitly documented why. Never `--no-verify`,
`continue-on-error`, or skip a check to pass this step — that's a
finding to report, not a problem to suppress.

### 7. REPORT — structured verdict with evidence

Produce a verification report. Every claim needs evidence — a snapshot,
a screenshot, an endpoint response, or a test-output excerpt. "Looks
good" without artifacts is not a verdict.

Use the format in `references/report-format.md`. The report has four
buckets:

| Bucket | Meaning | Blocks the PR? |
|---|---|---|
| **PASS** | Acceptance criterion verified with evidence | — |
| **FAIL** | Stated behaviour does not work | Yes |
| **BLOCKER** | Verification could not run (env, missing seed, broken dep) | Yes — fix infra first |
| **GAP** | Behaviour works but isn't covered by an e2e | No — file a follow-up |

Final verdict at the top: **VERIFIED**, **FAILED** (with the failing
criteria), or **PARTIAL** (some criteria untested due to blockers).

## Anti-patterns

| Anti-pattern | Why it fails verification |
|---|---|
| "Tests pass → done" | A green suite never proves business value |
| Verify as admin only | Admins bypass every authz check — you'd miss every permission bug |
| Skip ORIENT, walk the diff | Without the plan's acceptance criteria you'll verify the wrong things |
| Spam screenshots | Each one is slow and bloats the report; snapshot first |
| Run full Playwright suite for a one-route change | 5-minute wait; scope to the changed layer |
| Report "looks good" with no evidence | The user can't audit your verification |
| Stop at GATE failure | Lint / typecheck failures at this stage mean cook left work undone — report it, don't fix it silently |
| Verify in the same session that implemented | Same eyes, same blind spots. Verify in a fresh session or via a sub-agent |

## When to invoke other skills mid-verify

| Situation | Skill |
|---|---|
| Chrome DevTools MCP not connecting | `chrome-devtools-mcp:troubleshooting` |
| Accessibility regression suspected | `chrome-devtools-mcp:a11y-debugging` |
| LCP / perf regression suspected | `chrome-devtools-mcp:debug-optimize-lcp` |
| Verification revealed a missing feature | Stop verify, open `/prep` for the gap |
| Verification revealed a small fix | Stop verify, hand to `/cook` with the failing criterion |

## Reference files

Load these when you reach the matching step:

| Reference | When to load |
|---|---|
| `references/acceptance-walkthrough.md` | Step 1–2 — pulling criteria from the plan and walking them |
| `references/visual-checks.md` | Step 2 — Chrome DevTools MCP patterns, dev-server lifecycle |
| `references/permission-matrix.md` | Step 3 — seed users, impersonation, the who-sees-what matrix |
| `references/endpoint-checks.md` | Step 4 — route accessibility, status-code expectations |
| `references/automated-gates.md` | Step 5–6 — Vitest + Playwright scoping, lint/typecheck |
| `references/report-format.md` | Step 7 — verification report structure with required evidence |
