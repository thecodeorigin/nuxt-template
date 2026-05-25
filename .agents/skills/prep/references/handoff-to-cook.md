# Handoff to Cook

> The plan must be executable by `cook` without requiring strategic decisions. If cook has to think about "what should I do here", the plan isn't done.

## The dumb-cook contract

Cook will:
- Read the plan
- Execute each step in order
- Fix tactical issues (lint errors, typos, package name corrections)
- Stop and ask for guidance when a step requires a strategic decision

Cook will NOT:
- Re-plan
- Make architectural choices
- Decide between approach A and approach B
- Figure out what "implement the function" means

If your plan says "implement X", it's not a plan, it's a wish.

## Cook-readiness checklist

Before writing the plan file, verify every item:

**Architecture**
- [ ] Every architectural choice is made and documented (not deferred)
- [ ] Rejected alternatives are recorded with reasons
- [ ] Open questions are at the TOP of `plan.md` (not buried in step 14)

**Steps**
- [ ] Every step has: complete file path + actual code or exact command
- [ ] Every command includes its expected output
- [ ] Dependencies between steps are explicit ("Step 3 depends on Step 2 because…")
- [ ] No step says "implement", "add", "create" without showing exactly what
- [ ] File creation steps include the full file content (or a complete diff for edits)

**Tests**
- [ ] Test file paths are specified
- [ ] Test names/descriptions are written out
- [ ] Verification commands are exact: `pnpm vitest run --project unit test/unit/<file>.test.ts`

**Verification**
- [ ] Each phase has a verify section: exact command + expected output substring
- [ ] Acceptance criteria are concrete: "returns 201 and item in DB" not "works correctly"
- [ ] The final gauntlet is: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e`

**Rollback** (for schema changes)
- [ ] Rollback instructions exist for any irreversible step

## Common failures

| Failure | What it looks like | Fix |
|---|---|---|
| "Implement X" without code | Step: "Implement the createTodo service function" | Show the actual function code |
| Decision punt | "Choose between Approach A and Approach B" | Make the decision; document the reasoning |
| Vague command | "Run the migration" | `pnpm db:generate && pnpm db:migrate` |
| Hidden dependency | Step 7 uses a type defined in Step 12 | Reorder; or add an explicit "Step 7 depends on Step 12" note |
| Buried open question | "By the way, we might need X" (in the middle of step 9) | Move to Open Questions at top |
| Speculative phase | "Phase 5: If the above doesn't work, try..." | Remove speculative phases; pick one approach |

## Pre-flight simulation

Before calling the plan "done", simulate cooking it in your head:

1. Start from step 1.
2. For each step, ask: "Can I execute this without making a judgment call?"
3. If any step requires judgment, the plan isn't done — make the judgment yourself and document it.

## The CHANGELOG section

Every plan must include a CHANGELOG section in `research/debate-synthesis.md`. This proves the plan was actually debated.

Format:
```markdown
## Debate synthesis

### YAGNI critic
Objection: [quoted from critic]
Decision: Accept / Reject
Rationale: [why]

### Failure-mode critic
Objection: [quoted from critic]
Decision: Accept / Reject
Rationale: [why]

### Architecture critic
Objection: [quoted from critic]
Decision: Accept / Reject
Rationale: [why]
```

A plan without a debate synthesis is a plan that wasn't scrutinized.

## Communicating the handoff

When prep is done, report:

```
Plan saved: .claude/plans/<summary>-<id>/plan.md

Summary (3–5 lines):
  <what the plan does>

Open questions (must answer before cooking):
  > ❓ [question 1]
  > ❓ [question 2]

Suggested cook invocation:
  /skill cook
  Then: follow .claude/plans/<summary>-<id>/plan.md phase by phase
```

If there are no open questions, say "None — plan is cook-ready."
