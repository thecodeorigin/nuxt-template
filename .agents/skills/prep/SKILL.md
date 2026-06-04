---
name: prep
description: Investigates codebase, spawns subagents to research and self-debate, produces a comprehensive execution-ready plan (code included, no time estimates) that cook can execute without re-planning. Load when tackling a non-trivial feature, architecture change, or any multi-file work where winging mid-execution would hurt.
---

# Prep — Planning Discipline

Prep is the investigation and planning skill. Its job is to produce an execution-ready plan that `cook` can follow without making strategic decisions. Code in the plan, not pseudocode. Debates before committing.

## When to invoke

- Non-trivial feature touching 3+ files
- Core architecture / schema change
- User asks "what would you do" or "how should we approach this"
- Multi-step request where winging mid-execution would hurt

**Skip when**: trivial single-file change, user said "just do it", change is obviously mechanical.

## Core principles

- **YAGNI**: don't plan for hypothetical future requirements
- **KISS**: simplest plan that satisfies the requirement
- **DRY**: avoid duplication in the plan (reference existing patterns, don't re-invent)
- **No time estimates**: they're always wrong and distract from substance
- **Code in the plan**: a plan with pseudocode is incomplete — known stacks require real code
- **Self-debate mandatory**: high-impact plans must be challenged before committing
- **Hand off to cook**: prep plans, cook executes — never do both in the same session

## Workflow (9 phases)

### Phase 1 — INVESTIGATE

Read the codebase before designing. Use `references/research-phase.md` as your guide.

- 1–3 lookups → `Glob` + `Grep` directly
- 3+ lookups, open-ended → spawn `Explore` subagent
- Multiple independent streams → spawn multiple subagents in one message
- Mandatory reads: root `CLAUDE.md`, relevant layer `CLAUDE.md`, `server/db/schema.ts`, closest existing feature

### Phase 2 — UNDERSTAND

Read the load-bearing files. Don't skim.

- Root `CLAUDE.md` — conventions, stack, hard rules
- `layers/todo/CLAUDE.md` — canonical CRUD template (mirror its shape)
- `server/db/schema.ts` — tables, columns, constraints, migrations history
- Closest existing feature end-to-end (schema → route → API wrapper → page → tests)

Capture: 5-line "current state" summary, 3 surprises, 3 confirmations.

### Phase 3 — IMPACT

Count the affected files. Decide the depth of the plan.

| Impact | Files | Schema? | New architecture? | Plan depth |
|---|---|---|---|---|
| Low | < 5 | No | No | `plan.md` only |
| Medium | 5–15 | 1 table | No | `plan.md` + phase files |
| High | 15+ | Multi-table | Yes | `plan.md` + phases + `research/` |

### Phase 4 — DESIGN

Pick an approach. Use `references/solution-design.md`.

- List 3+ alternatives ("two more, then pick" rule)
- Document the rejected alternatives and why
- Choose the simplest option that satisfies the requirement
- Apply security checklist: authn, authz, validation, secrets, user-isolation queries
- **Data writes**: if the plan creates / updates / refactors any DB
  rows outside a user-driven server route, design it as one or more
  Nitro tasks at `<layer>/server/tasks/{seed,create,update,refactor}/<noun>.ts`.
  Never plan a one-off `tsx scripts/...` or a raw `nuxt db sql
  "INSERT ..."`. Load the `data` skill for the full convention.
- **Permission impact**: list every ability key the plan touches.
  Identify catalog updates (`layers/auth/shared/permissions.ts`),
  grant-set updates (`SYSTEM_GRANTS`, `DEFAULT_ROLE_ABILITIES`,
  `DEFAULT_*_ABILITIES`), and whether a live-env backfill (`update:`
  task) is needed. See `data` skill's
  `references/permission-aware-data.md`.

### Phase 5 — DRAFT

Write the plan with executable code. Use `references/output-standards.md`.

- Every step has a tool call, a file path, and actual code (not pseudocode)
- Every command includes its expected output
- Dependencies between steps are explicit

### Phase 6 — DEBATE

Spawn 2–3 critics in parallel (one message). Use `references/self-debate.md`.

Mandatory critics:
1. **YAGNI critic**: "Argue that this plan is overengineered. What can be cut?"
2. **Failure-mode critic**: "Find cases handled wrong. Edge cases, race conditions, security holes."
3. **Architecture critic**: "Argue that a fundamentally different approach would be simpler."

Optional 4th critic (domain-specific): security, performance, data integrity.

Skip debate only for low-impact plans (< 5 files, no schema changes).

### Phase 7 — SYNTHESIZE

Fold debate objections into the plan. Record every decision in `research/debate-synthesis.md`.

For each objection: Accept (modify plan) | Reject (keep plan, record why) | Defer (open question).

### Phase 8 — VALIDATE (cook-readiness check)

Before writing the plan file, verify:

- Every architectural choice is made (no "decide A or B" in the steps)
- Every step has complete file path + actual code/command
- All dependencies are named explicitly
- Open questions are at the top (not buried)
- Acceptance criteria are concrete and checkable
- Every DB write step names a task file (`tasks/<verb>/<noun>.ts`) and
  the service it wraps; no plan step shells out to `nuxt db sql` for
  writes
- Every permission-touching step names the catalog file
  (`layers/auth/shared/permissions.ts`) and the grant set
  (`SYSTEM_GRANTS` / `DEFAULT_ROLE_ABILITIES` / `DEFAULT_*_ABILITIES`) it
  updates

Use `references/handoff-to-cook.md` for the full checklist.

### Phase 9 — WRITE

Save plan to `.claude/plans/<summary>-<id>/`. See `references/plan-organization.md` for structure.

- `plan.md` — index: open questions, goal, approach, phase table, cross-phase file map, test strategy, acceptance criteria
- `research/debate-synthesis.md` — debate record
- `phase-XX-<name>.md` — one per phase for medium/high impact plans

Report back: plan path, 3–5 line summary, open questions, suggested cook invocation.

## Anti-patterns

| Anti-pattern | Why it hurts |
|---|---|
| Plan with no code | Cook has to re-plan mid-execution |
| Skipped debate | Plan has hidden flaws that surface at 3am |
| Time estimates | Always wrong; creates false confidence |
| Hidden open questions | Cook makes the wrong call silently |
| Plan that re-plans | Prep's job is to front-load strategy so cook doesn't need to |
| Synthesis without trace | Can't audit why an objection was accepted or rejected |

## Reference files

Load these when needed:

| Reference | When to load |
|---|---|
| `references/codebase-understanding.md` | Before Phase 1 if you haven't read the project before |
| `references/research-phase.md` | Choosing between direct tools vs subagents |
| `references/solution-design.md` | Phase 4 — design and tradeoff framework |
| `references/self-debate.md` | Phase 6 — debate critic briefs |
| `references/subagent-delegation.md` | Whenever spawning a subagent |
| `references/output-standards.md` | Phase 5 — writing style and step format |
| `references/plan-organization.md` | Phase 9 — directory layout and file naming |
| `references/handoff-to-cook.md` | Phase 8 — cook-readiness validation |
