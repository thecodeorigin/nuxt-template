# Acceptance Walkthrough

> The first and most important verification step: confirm the live app
> ships the value the plan said it would, by walking it as a real user.

## Step 1 — Pull acceptance criteria from the plan

Most non-trivial changes have a plan at `.claude/plans/<slug>/plan.md`.
Read it. The bottom of `plan.md` (or a `phase-XX-*.md` file) contains
the **Acceptance criteria** section.

```bash
ls .claude/plans/
cat .claude/plans/<latest>/plan.md
```

Extract the acceptance criteria as a flat checklist. Each item must
be a concrete observable outcome — "user can X and sees Y", not "the
feature is implemented".

If there is no plan:

- Read the most recent commit messages: `git log -10 --oneline`
- Ask the user: "What was this change supposed to do, in one
  sentence?" — record their answer as the single acceptance criterion.
- Do not invent criteria from the diff alone. The diff tells you what
  was changed, not what was *intended*.

## Step 2 — Identify the target persona

Every feature ships value to a specific persona. From the plan
(usually in the goal / motivation section) identify:

- Who is the primary actor? (end user / admin / staff / API consumer)
- Which seed user matches that persona?
  - `agent@localhost` — default agent user, full personal-org admin
  - `admin@seed.local` — system admin (platform powers)
  - `alice@seed.local` — personal-org admin (typical end user)
  - `bob@seed.local` — personal-org admin (used for cross-tenant tests)
- If the target is anonymous (e.g. a marketing landing page), don't
  authenticate at all — open the page in a fresh context.

**Verify as the target persona, not as admin.** Admin sessions hold
`*:manage` abilities that bypass every authz check, so admins will see
every feature even when the gating is broken. Verifying as admin
guarantees you miss permission bugs.

## Step 3 — Walk each acceptance criterion

For each criterion, follow this loop:

```
1. navigate_page(<starting URL>)
2. wait_for({ text: ['<known-good text>'] })
3. take_snapshot                                     ← evidence #1
4. do the user action (click / fill / submit)
5. wait_for({ text: ['<expected outcome text>'] })
6. take_snapshot                                     ← evidence #2
7. list_console_messages({ types: ['error', 'warn'] })
8. (optional) list_network_requests, filter to the touched route
```

Each criterion's outcome is one of:

- **PASS** — outcome observed, no console errors, no failed network
  requests. Record the snapshot(s) as evidence.
- **FAIL** — outcome not observed, or console / network shows an
  error. Record exact reproduction steps + the failing snapshot.
- **BLOCKED** — couldn't execute the step (page won't load, dev
  server down, seed user missing). Record what's blocking.

## Step 4 — Confirm the negative path

For each criterion, also walk the **invalid input** path:

- Submit the form with empty / oversized / wrong-type values — does
  the Zod schema reject with a useful message?
- Try the action twice fast — is there a double-submit guard?
- Click "cancel" or navigate away mid-flow — does the page recover?

A feature that ships value to the happy path and explodes on bad input
is not done.

## Step 5 — Round-trip persistence

For any criterion that creates / updates / deletes data:

- Reload the page (`navigate_page` to the same URL) — does the change
  persist?
- Open a fresh tab / session and re-authenticate — does the change
  still appear?
- Query the DB directly: `nuxt db sql "SELECT * FROM <table> WHERE
  ..."` — does the row match what the UI displayed?

UI state ≠ persistent state. Verify both.

## Connecting to the plan's phases

If the plan has multiple phases, verify in the same order the plan
phases were implemented. A phase that depends on a previous phase
cannot be verified in isolation — if Phase 2 fails, check whether
Phase 1's outcome is still intact before blaming Phase 2.

## What to record

For each criterion in the final report:

```
Criterion: "Logged-in user can create a project and see it in the sidebar"
  Persona:   alice@seed.local
  Steps:     1. /api/auth/dev-login {email: alice@seed.local}
             2. /dashboard → click "+ New project"
             3. fill "Project name" = "Acme"
             4. click "Create"
  Expected:  redirected to /projects/<id>, "Acme" appears in sidebar
  Observed:  ✓ redirected; ✓ sidebar shows "Acme" after refresh
  Evidence:  snapshot post-create, snapshot post-reload
  Verdict:   PASS
```

Anything less concrete than this isn't verification.
