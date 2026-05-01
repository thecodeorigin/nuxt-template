# Agent team for nuxt-template

> Parallel multi-agent workflow for feature development. The top-level Claude
> Code session acts as the **team lead**, plans the work, and spawns specialist
> teammates that work concurrently.

## Roles

| Role | What it owns | Edits code? | Tool scope |
|---|---|---|---|
| **Team lead** (your top-level session) | Planning, task partition, cross-cutting changes, QA/UX reconciliation, team lifecycle | Cross-cutting only | All tools (parent session) |
| [`fullstack-dev`](./fullstack-dev.md) | One non-overlapping feature slice (a Nuxt layer): schemas, server routes, client API, components, tests | Yes (only inside its layer) | Inherits all tools (no restrictions) |
| [`qa-visual`](./qa-visual.md) | Browser-driven functional + visual + a11y + perf testing | **No** (`disallowedTools: Edit, Write, NotebookEdit`) | Inherits all tools except code edits — Chrome DevTools MCP, Bash, Read |
| [`ux-researcher`](./ux-researcher.md) | First-time-user-lens critique grounded in named UX heuristics | **No** (`disallowedTools: Edit, Write, NotebookEdit`) | Inherits all tools except code edits — Chrome DevTools MCP, Bash, Read |

The lead is your top-level session — there is no `team-lead.md` file. Per the
[Agent Teams docs](https://code.claude.com/docs/en/agent-teams.md), the session
that creates a team is the lead for its lifetime.

## Quick start

```text
/team-feature <one-paragraph feature description>
```

Example:

```text
/team-feature add a 'projects' CRUD slice — title, description, status (todo|active|done), owner.
Authenticated users see their own. Admins see all.
```

The lead will:
1. Plan + partition into tasks (`TaskCreate`)
2. Create the team (`TeamCreate`)
3. Spawn one or more `fullstack-dev`s, one `qa-visual`, one `ux-researcher` in parallel
4. Wait for implementation to finish, then unblock QA + UX
5. Reconcile reports, create fix-tasks, iterate
6. Run lint + typecheck + tests, surface a "ready to commit" message
7. Clean up the team (`TeamDelete`)

You stay in the loop the whole time. Use `Shift+Down` to cycle through
teammates and message any of them directly. Use `Ctrl+T` to toggle the task
list view.

## Why agent teams (not subagents)

Subagents are one-shot delegates that report back to the spawner. Teams are
**peers**: each teammate has its own session, can claim work from a shared
task list, and can message any other teammate directly. That matters for this
workflow because:

- `fullstack-dev`s need to message each other when they discover a cross-slice
  bug ("found a Zod schema mismatch in your slice; can't fix from mine").
- `qa-visual` and `ux-researcher` need to reach the **owning** fullstack-dev,
  not bounce reports through the lead.
- The shared task list means new fix-tasks get picked up automatically without
  the lead manually re-dispatching.

See `https://code.claude.com/docs/en/agent-teams.md` for the canonical doc.

## Display mode (Windows)

`teammateMode` is set to `in-process` in `.claude/settings.json` because
split-pane mode requires tmux or iTerm2 and isn't supported in Windows
Terminal / VS Code's integrated terminal. All teammates share the lead's
terminal; cycle between them with `Shift+Down`.

If you're on macOS in iTerm2 or any tmux session and want split panes, set
`teammateMode: "tmux"` in your **personal** `.claude/settings.local.json`
(don't change the project default — the team works on Windows).

## Coordination rules

The hard rules below are also baked into each agent's prompt. They're listed
here as the contract for humans:

1. **Layer ownership**. Each `fullstack-dev` owns exactly one layer. Never
   edits another teammate's layer. Cross-layer needs go through the lead.
2. **Read-only reviewers**. `qa-visual` and `ux-researcher` cannot edit code.
   They file structured reports; `fullstack-dev` fixes.
3. **TDD enforced**. Each fullstack-dev writes tests as part of the slice and
   gates "task complete" on `pnpm lint && pnpm typecheck && pnpm test` green.
4. **Never disable a failing check** (`continue-on-error`, `--no-verify`,
   `// @ts-ignore` to silence) to force "complete". Fix the root cause or
   mark the task `blocked`.
5. **Cross-cutting changes are lead-only**. Anything outside `layers/<slice>/`
   (DB schema, `server/utils/`, `app/lib/`, `shared/utils/`) is the lead's
   responsibility, scheduled before slice tasks.

## File layout

```
.claude/
  agents/
    README.md           # this file
    fullstack-dev.md    # implementer role
    qa-visual.md        # visual/interactive QA role
    ux-researcher.md    # UX critique role
  commands/
    team-feature.md     # /team-feature slash command
  settings.json         # project-shared: enables agent teams, in-process mode, permission allowlist
  settings.local.json   # per-developer (gitignored)
  teams/                # runtime state (gitignored)
  tasks/                # runtime state (gitignored)
  skills/               # symlinks to .claude/skill-sources/<repo>/skills/<name>
```

## Cost expectations

Per the [Agent Teams docs](https://code.claude.com/docs/en/agent-teams.md):

> Agent teams use significantly more tokens than a single session. Each
> teammate has its own context window, and token usage scales with the
> number of active teammates.

Rough rules of thumb for this project:

| Feature size | Recommended team | Rough token cost |
|---|---|---|
| Single CRUD slice (1 entity, 4 routes) | 1 fullstack-dev + 1 QA + 1 UX | ~3× a solo session |
| Multi-slice feature (2-3 entities) | 2-3 fullstack-devs + 1 QA + 1 UX | ~5× a solo session |
| Cross-cutting refactor | Lead + 2-3 read-only investigators (use subagents, not a team) | ~2× a solo session |

If the feature is genuinely sequential (slice B depends on slice A's schema),
**don't fan out** — one fullstack-dev does both, in order. The team is for
parallel work; sequential work is more expensive in a team than solo.

## Troubleshooting

- **Teammates don't appear** → press `Shift+Down` to cycle through them
  (in-process mode hides them by default). Or check
  `~/.claude/teams/<team-name>/config.json` exists.
- **Permission prompts loop** → the lead's permission allowlist is in
  `.claude/settings.json`. Add the offending tool there if it's safe; teammates
  inherit the lead's permissions.
- **Lead starts implementing instead of delegating** → message it: "wait for
  your teammates to complete their tasks before proceeding".
- **Stuck task** → `TaskGet` to see current state. If genuinely stuck, mark
  `blocked` and message the lead, or have the lead reassign to a fresh
  teammate.
- **Orphaned team after a crash** → list with `ls ~/.claude/teams/` and
  remove the stale dir; corresponding `~/.claude/tasks/<team-name>/` too.

## Limits to be aware of

The agent-teams feature is **experimental**. Known limitations from the docs:

- No session resumption with in-process teammates (`/resume`, `/rewind` won't
  restore them — spawn new ones if resumed).
- Task status can lag — if a task seems stuck, manually nudge.
- One team per session. Clean up before starting a new one.
- No nested teams — teammates can't spawn their own teammates.
- The lead is fixed for the lifetime of the team.
