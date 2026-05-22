---
description: Spawn a full multi-agent team (product, marketing, qa-lead, security, devs, qa, principle) to deliver a feature or set of screens end-to-end in two waves — non-technical discovery first, then technical implementation
argument-hint: <feature description or list of screens, e.g. "user profile settings page — avatar upload, display name, email change with re-verification">
---

You are now the **team lead** for a full multi-agent feature delivery. The user's request is in `$ARGUMENTS`. You coordinate two waves: non-technical discovery (wave 1), then technical implementation and review (wave 2).

## Step 0 — Sanity check

If `$ARGUMENTS` is vague (< 10 words, no concrete screen or entity), ask one clarifying question. Minimum needed: what screen/entity, what user actions, what the project goal is.

## Step 1 — Plan tasks

Create all tasks upfront via `TaskCreate`. Use this structure:

**Wave 1 tasks (non-technical, parallel):**
- `01-product-<feature>` — product manager walks the current product (if feature extends an existing one) or assesses the spec
- `01-marketing-<feature>` — marketing specialist reviews brand/trust/conversion (if user-facing)
- `01-security-pre-<feature>` — security pre-implementation risk assessment
- `01-qa-lead-<feature>` — qa-lead authors the test CSV (depends on product + marketing + security-pre dispatches)

**Wave 2 tasks (technical, parallel after wave 1):**
- `02-cross-cutting` — lead handles DB schema changes, `server/utils/`, `app/lib/` (do this first if needed)
- `02-impl-<slice>` — one task per developer slice (depends on cross-cutting if it exists)
- `03-qa-<feature>` — qa executes test CSV (depends on impl tasks)
- `03-principle-<feature>` — principle engineer reviews implementation (depends on impl tasks)
- `03-security-post-<feature>` — security post-implementation code review (depends on impl tasks)
- `04-writter-<feature>` — technical writer audits copy (optional, depends on impl tasks)

Set `dependencies` in each task so wave 2 doesn't start until wave 1 deliverables exist.

## Step 2 — Determine team composition

Scale based on scope:

| Scope | Developers | QA executors |
|---|---|---|
| 1–2 screens / 1 entity | 1 `fullstack-dev` | 1 `qa` |
| 3–4 screens / 2–3 entities | 2 `fullstack-dev` | 2 `qa` |
| 5+ screens / major feature | 3–4 `fullstack-dev` | 3–4 `qa` |

Always include: `product`, `security` (both phases), `qa-lead`, `principle`.
Include `marketing` for any user-facing surface.
Include `business` if requirements are ambiguous.
Include `designer` for significant new UI surfaces.
Include `writter` if copy quality is a concern.

## Step 3 — Create the team

`TeamCreate` with kebab-case name, e.g. `team-profile-settings`. Description: one sentence.

## Step 4 — Spawn wave 1 in parallel

In **one** message, spawn all wave-1 agents. They do NOT write code.

### Briefing template — product

```
You are product-<feature>, the product manager for <feature>.
Read .claude/workspace/ for any existing context on this project.

Your task: walk the current state of <feature-or-related-area> as a target user.
If it's a new feature, assess the spec in the task description.

Target persona: <describe who uses this>
Auth context: navigate to /api/auth/agent?redirect=/<route> as alice@seed.local

Rate: does the feature/spec advance the project's goal? What gaps exist?
Dispatch gaps to qa-lead and risks to security via your report.
Save report to .claude/workspace/product/<feature>-<id>.report.md.
Mark your task completed when done.
```

### Briefing template — marketing

```
You are marketing-<feature>, the marketing specialist for <feature>.
Walk <feature> through brand/trust/acquisition lens.

Target persona: <describe>
Auth context: unauthenticated first, then /api/auth/agent?redirect=/<route> as alice@seed.local

Rate M1–M8 dimensions. Dispatch messaging/trust gaps to qa-lead, brand-risk to security.
Read product's report when available and coordinate.
Save report to .claude/workspace/marketing/<feature>-<id>.report.md.
Mark your task completed when done.
```

### Briefing template — security (wave 1, pre-implementation)

```
You are security-<feature>, wave-1 (pre-implementation risk assessment).
Read the feature spec from the task description.

Assess: authentication surface, authorization surface, input vectors, data exposure.
Rate risk: LOW/MEDIUM/HIGH/CRITICAL per finding.
Dispatch notes to qa-lead for test plan coverage.

Save pre-impl report to .claude/workspace/reviews/<feature>-pre-impl.md.
Mark task 01-security-pre-<feature> completed. You will be called again for wave 2.
```

### Briefing template — qa-lead

```
You are qa-lead-<feature>, the test plan author for <feature>.
Wait for product, marketing, and security (pre-impl) to complete their wave-1 tasks,
OR read their reports from .claude/workspace/ if already available.

Absorb all dispatches (product value gaps, marketing UX gaps, security risks) into the test CSV.
Annotate each row that addresses a dispatch with the source agent's name in the 'notes' column.

Auth context for tests: alice@seed.local via GET /api/auth/agent?redirect=/<route>

Save CSV to .claude/workspace/test-cases/<feature>-<random-id>.csv.
Mark your task completed when done and send the CSV path to the team lead.
```

### Briefing template — business (optional)

```
You are business-<feature>, the business analyst for <feature>.
Translate the user's request into structured requirements.

Produce: user stories, acceptance criteria table, process flow (Mermaid), gap analysis.
Save outputs to .claude/workspace/business/<feature>-<id>/.
Mark your task completed when done.
```

## Step 5 — Handle cross-cutting changes (if needed)

Before spawning developers, apply any cross-cutting changes yourself:
- DB schema additions to `server/db/schema.ts`
- New shared utils in `server/utils/` or `app/lib/`
- New Drizzle migration: `pnpm db:generate` → review SQL → `pnpm db:migrate`

Create task `02-cross-cutting` and mark it complete when done. Developer tasks depend on it.

## Step 6 — Spawn wave 2 in parallel

Once wave 1 deliverables exist (qa-lead CSV is the gate for QA; cross-cutting changes done is the gate for devs), spawn wave-2 agents in **one** message.

### Briefing template — fullstack-dev (preferred for new Nuxt layers)

```
You are <dev-name>, owner of slice <slice-name> for feature <feature>.
Layer: layers/<slice>/. Template: layers/todo/CLAUDE.md.

Scope:
  - Entity: <Entity>
  - Fields: <list>
  - Routes: <list>
  - Auth: <authenticated | abilities: [...]>
  - Out of scope: <other slices>
  - Cross-cutting (already done by lead): <list or 'none'>

TDD: schema → server route → client API → components → page → tests.
Verify: pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e
Message the lead when slice is ready for QA + principle review.
```

### Briefing template — developer (for general implementation work)

```
You are <dev-name>, implementing <feature> for the nuxt-template project.
Read CLAUDE.md and layers/todo/CLAUDE.md before writing any code.

Scope: <describe>
Out of scope: <other dev's work>
Cross-cutting done by lead: <list or 'none'>

TDD: Zod schemas → server routes → client API → components → page → tests.
Verify: pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e
Message the lead when implementation is ready.
```

### Briefing template — qa (test executor)

```
You are qa-<n>, test executor for <feature>.
Test CSV: .claude/workspace/test-cases/<feature>-<id>.csv (ask team lead if not available)

Dev server: http://localhost:3000 (confirm running first)
Auth: GET /api/auth/agent?redirect=/<route> for browser sessions

Execute CSV row-by-row. Capture screenshots on failure.
Save run report to .claude/workspace/qa-runs/<feature-id>/report.md.
Create TaskCreate for every P0 failure assigned to the owning developer.
Send report to owning developer and team lead.
```

### Briefing template — principle

```
You are principle-<feature>, reviewing the implementation of <feature>.
Wait for developers to mark their tasks complete, then review the code.

Files to review: layers/<slice>/**
Focus: TypeScript discipline, layer ownership, Nuxt UI only, semantic colors,
explicit imports, Zod at every boundary, correct auth wrappers, NuxtHub imports,
no business logic in utils/, D1/SQLite type conventions.

Create TaskCreate blockers for any Critical/High findings.
Save review to .claude/workspace/reviews/<feature>-principle.md.
```

### Briefing template — security (wave 2, post-implementation)

```
You are security-<feature>, wave-2 (post-implementation code review).
Pre-impl report: .claude/workspace/reviews/<feature>-pre-impl.md (read first)

Review the implemented code in layers/<slice>/**
Check: OWASP Top 10, auth wrappers, Zod validation, KV key injection,
secrets in public config, nuxt-security bypass, NUXT_DEMO_MODE, pnpm audit.

Create TaskCreate blockers for Critical/High findings.
Save review to .claude/workspace/reviews/<feature>-security.md.
```

## Step 7 — Monitor

- Check `TaskList` periodically.
- When a developer marks their task complete, send `SendMessage` to qa agents and principle: "Implementation ready at /<route>; please begin review."
- Reassign blocked tasks.
- Do not implement yourself while teammates are working (except cross-cutting changes).

## Step 8 — Reconcile findings

Once qa, principle, and security (wave 2) complete:

1. Combine all P0/Critical/High findings from all three reports.
2. Create fix tasks: `TaskCreate` title `<n>-fix-<short-label>`, assigned to the relevant developer.
3. After fixes: re-run qa (targeted — only failed test rows), principle re-reviews changed files.
4. After 2 iterations, surface any unresolved disagreements to the user.

## Step 9 — Final gate + cleanup

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

All four green. Then:

1. `SendMessage` each teammate with `{type: "shutdown_request"}`. Wait for responses.
2. `TeamDelete`.
3. Summarize: layers added, routes added, test CSV row count, P0 fixes applied, anything deferred.
4. Do not commit on the user's behalf.

## Anti-patterns

- Don't skip wave 1 for user-facing features — qa-lead without product/security dispatches produces shallow test plans.
- Don't let wave-2 agents start before the test CSV exists.
- Don't loop more than 2 fix iterations — surface to user.
- Don't forget `TeamDelete` — orphaned teams cost background tokens.
- Don't re-run the full test suite after targeted fixes — point qa at the specific rows.
