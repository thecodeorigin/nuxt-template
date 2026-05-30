# Self-Debate

> Mandatory anti-bias step for high-impact plans. Forces adversarial critique before committing.

## When debate is mandatory

- High-impact plans (15+ files, schema changes, multi-layer, new architecture)
- Any decision that's hard to reverse (new table, new auth pattern, new layer)
- Any design you feel very confident about (confidence = potential blind spot)

Skip debate only for low-impact plans (< 5 files, no schema, no public API).

## Three mandatory critics

Spawn all three in parallel — **one message, three Agent calls**:

### 1. YAGNI critic
> "Your job is to argue that this plan is overengineered. What is being built that isn't strictly required by the spec? What can be cut without losing any stated requirement? Punch list format — 3–7 concrete objections. No essays."

Brief: include the plan (inline or as a file path), the original task (2–3 sentences), and tell the critic to be adversarial.

### 2. Failure-mode critic
> "Your job is to find cases where this plan handles things wrong. What edge cases are missing? What race conditions exist? What security holes? What happens if the network fails halfway through? Punch list format — 3–7 concrete objections."

### 3. Architecture critic
> "Your job is to argue that a fundamentally different approach would be simpler. What is the second-best plan? Why would that be better? What does this plan sacrifice that a simpler design wouldn't? Punch list format — 3–7 concrete objections."

## Optional 4th critic (domain-specific)

Add a 4th critic when the plan touches a sensitive domain:
- Security-heavy feature: "Find security vulnerabilities, auth gaps, and injection vectors"
- Performance-critical path: "Find N+1 queries, unbounded lists, and missing indexes"
- Data integrity: "Find failure modes where data becomes inconsistent or partially written"

## Briefing structure

```
Agent(subagent_type: "general-purpose",
  prompt: "
    You are the YAGNI critic. You are adversarial by design.

    Original task: <2–3 sentence description of what the user asked for>

    Draft plan:
    <paste plan inline, or: 'See .claude/plans/<name>/plan.md'>

    Your job: argue that this plan is overengineered. What is built that
    isn't strictly required? What can be cut? Be concrete — name the specific
    file, function, or decision that should be removed.

    Format: punch list of 3–7 objections. No essays. Each objection:
    - what to cut
    - why it's not needed
    - what we'd do instead (if anything)
  "
)
```

## Synthesis discipline

For every objection from every critic, make a decision. Record in `research/debate-synthesis.md`:

### Accept
The objection is valid. Modify the plan. Document what changed.

```markdown
### YAGNI: Remove pagination from initial implementation
**Decision**: Accept
**Change**: Removed pagination from Phase 3. Plain `db.query.todoTable.findMany({ limit: 50 })` for now.
**Why**: Spec says "list all todos" — pagination is YAGNI unless load testing shows > 100 items.
```

### Reject
The objection doesn't apply. Keep the plan. Document why the critic was wrong.

```markdown
### Architecture: Use KV instead of D1 for todo storage
**Decision**: Reject
**Why**: KV is for sessions and rate-limit counters; todos are relational (user FK, status queries).
         D1 is the right choice. The critic assumed todos are simple key-value — they're not.
```

### Defer
The objection is valid but out of scope. Add to Open Questions.

```markdown
### Failure-mode: What if two users race on the same todo?
**Decision**: Defer
**Open question added**: Should we add an optimistic locking `version` column to prevent lost updates?
```

## Re-debate

For very high-impact plans (new layers, multi-table schema), optionally re-debate after synthesis:
- Spawn the same critics on the revised plan
- Stop when critics start repeating themselves

## When to ignore critics

Objections are worth rejecting (with documentation) when they:
- Address a hypothetical future requirement not in the spec
- Assume a constraint that doesn't exist in this project
- Pattern-match a different codebase or framework
- Suggest a fix that's more complex than the problem

Ignoring critics without documentation = the anti-pattern. The debate synthesis exists to prove you considered and consciously rejected the objection.

## Good vs bad debate output

**Good output**:
- `research/debate-synthesis.md` with every objection addressed
- `plan.md` Open Questions section updated with deferred items
- Plan modified to incorporate accepted objections

**Bad output**:
- No `research/debate-synthesis.md`
- Synthesis that says "accepted" without explaining what changed
- Debate done after the plan was already published
- One critic instead of three (confirmation bias)

## Anti-patterns

| Anti-pattern | Why |
|---|---|
| Skip debate ("I'm confident") | Confidence is a warning sign, not a pass |
| One critic | Confirmation bias; you chose the one that agrees with you |
| Vague framing ("be critical") | Gets vague objections; frame the adversarial role explicitly |
| Cherry-pick objections | Document every objection; reject with reasoning, not silence |
| Debate after publishing the plan | Too late; the plan is already committed |
