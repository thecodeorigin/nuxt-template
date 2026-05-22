# Agent team for nuxt-template

> Parallel multi-agent workflow for feature development. The top-level Claude
> Code session acts as the **team lead**, plans the work, and spawns specialist
> teammates that work concurrently.

## Roles

### Feature team (lightweight — `/team-feature`)

| Role | What it owns | Edits code? |
|---|---|---|
| **Team lead** (your top-level session) | Planning, task partition, cross-cutting changes, QA/UX reconciliation | Cross-cutting only |
| [`fullstack-dev`](./fullstack-dev.md) | One non-overlapping Nuxt layer slice: schemas, routes, API, components, tests | Yes (layer only) |
| [`qa-visual`](./qa-visual.md) | Browser-driven functional + visual + a11y + perf testing | No |
| [`ux-researcher`](./ux-researcher.md) | First-time-user heuristic critique | No |

### Full team (comprehensive — `/team`)

| Role | Phase | What it owns | Edits code? |
|---|---|---|---|
| [`product`](./product.md) | Wave 1 | Task-completion review of live product | No |
| [`marketing`](./marketing.md) | Wave 1 | Brand/trust/conversion review | No |
| [`security`](./security.md) | Wave 1 + Wave 2 | Pre-impl risk assessment + post-impl code review | No |
| [`qa-lead`](./qa-lead.md) | Wave 1 | Exhaustive test-case CSV author | No |
| [`business`](./business.md) | Wave 1 (optional) | Requirements, user stories, gap analysis | No |
| [`designer`](./designer.md) | Wave 1 (optional) | UX/visual critique, layout review | No |
| [`fullstack-dev`](./fullstack-dev.md) or [`developer`](./developer.md) | Wave 2 | Implementation | Yes |
| [`qa`](./qa.md) | Wave 2 | Executes qa-lead's test CSV in a real browser | No |
| [`principle`](./principle.md) | Wave 2 | Post-implementation code review | No |
| [`writter`](./writter.md) | Wave 2 (optional) | Copy audit and error message mapping | No |

## Quick start

```text
/team-feature <one-paragraph feature description>
```

For a full non-technical + technical team:

```text
/team <feature description>
```

## Coordination rules

1. **Layer ownership.** Each developer owns exactly one layer. Never edits another teammate's layer.
2. **Read-only reviewers.** `qa-visual`, `ux-researcher`, `qa`, `product`, `marketing`, `security`, `principle`, `designer`, `writter` cannot edit code.
3. **TDD enforced.** Developers gate "task complete" on `pnpm lint && pnpm typecheck && pnpm test` green.
4. **Never disable a failing check.** Fix the root cause or mark `blocked`.
5. **Cross-cutting changes are lead-only.** Anything outside `layers/<slice>/` (DB schema, `server/utils/`, `app/lib/`) is the lead's responsibility.

## File layout

```
.claude/
  agents/
    README.md               # this file
    fullstack-dev.md        # team-feature implementer
    qa-visual.md            # team-feature visual QA
    ux-researcher.md        # team-feature UX critique
    business.md             # requirements analyst
    designer.md             # UX/UI design reviewer
    developer.md            # solo or /team implementer
    marketing.md            # brand/trust reviewer
    principle.md            # code quality reviewer
    product.md              # product acceptance reviewer
    qa-lead.md              # test plan author
    qa.md                   # test executor (CSV-driven)
    security.md             # security reviewer (2 phases)
    writter.md              # copy and docs reviewer
  commands/
    team.md                 # /team slash command (full team)
  skills/                   # skill references (SKILL.md + references/)
    nuxt/
    nuxt-ui/
    nuxthub/
    pinia/
    pnpm/
    vite/
    vitest/
    vue/
    vue-best-practices/
    vue-router-best-practices/
    vue-testing-best-practices/
    vueuse-functions/
    prep/                   # planning skill (9-phase investigate → plan → debate → write)
    cook/                   # implementation skill (6-step REPL loop)
  plans/                    # prep skill output (gitignored)
  workspace/                # agent work artifacts (gitignored)
  settings.json             # project-shared settings
```

## Display mode (Windows)

`teammateMode` is set to `in-process` in `.claude/settings.json` because
split-pane mode requires tmux or iTerm2. All teammates share the lead's
terminal; cycle between them with `Shift+Down`.

If you're on macOS in iTerm2 or a tmux session and want split panes, set
`teammateMode: "tmux"` in your **personal** `.claude/settings.local.json`.

## Cost expectations

| Feature size | Recommended team | Rough token cost |
|---|---|---|
| Single CRUD slice | 1 fullstack-dev + qa-visual + ux-researcher | ~3× solo |
| Multi-slice feature | 2-3 fullstack-devs + qa-visual + ux-researcher | ~5× solo |
| Full /team delivery | product + marketing + qa-lead + security + 1-2 devs + qa + principle | ~10× solo |

## Troubleshooting

- **Teammates don't appear** → press `Shift+Down` to cycle (in-process mode hides them by default)
- **Permission prompts loop** → add the offending tool to `.claude/settings.json`; teammates inherit the lead's permissions
- **Lead starts implementing instead of delegating** → message it: "wait for your teammates to complete their tasks before proceeding"
- **Stuck task** → `TaskGet` to see state; mark `blocked` and message the lead, or reassign
- **Orphaned team** → `ls ~/.claude/teams/` and remove the stale directory; also remove `~/.claude/tasks/<team-name>/`
