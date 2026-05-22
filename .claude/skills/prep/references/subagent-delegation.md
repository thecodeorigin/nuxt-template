# Subagent Delegation

> When to use subagents and how to brief them effectively. Subagents see NO context from the parent session.

## When subagents are helpful

| Situation | Tool |
|---|---|
| Open-ended investigation (5+ potential lookups) | `Explore` subagent |
| Map an entire flow or subsystem | `Explore` subagent |
| Two independent investigation streams | Two parallel subagents |
| Adversarial critique (YAGNI, failure-mode, architecture) | `general-purpose` subagent |
| Claude Code / Claude API / Anthropic SDK questions | `claude-code-guide` subagent |
| Architectural design opinion | `Plan` subagent |

## The "single smart colleague" briefing rule

Every subagent brief must be fully self-contained. The subagent has ZERO context from the parent session. Write the brief like a message to a colleague who just walked into the room cold:

- What you're trying to accomplish (not just what to find)
- What you've already ruled out
- Why this task matters
- What format to return the output in
- How long/thorough the response should be

A brief that says "find all schemas" will return everything. A brief that says "find all Zod schema files in `layers/*/shared/schemas/` — I'm trying to understand the pattern before adding a new schema; list only file paths and exported names, under 150 words" returns exactly what's needed.

## Parallel spawning

Independent questions → one message, multiple `Agent` calls:

```
// GOOD — one message, parallel execution
Agent("What does the auth session look like in KV?")
Agent("How does the existing todo e2e test authenticate?")
Agent("What Drizzle query pattern is used for user-scoped selects?")

// BAD — three sequential messages, 3× the time
Agent("What does the auth session look like in KV?")
// ... wait for response ...
Agent("How does the existing todo e2e test authenticate?")
```

## Choosing the subagent type

| Type | Best for |
|---|---|
| `Explore` | Codebase investigation: file finding, pattern searching, reading and summarizing code |
| `general-purpose` | Research, debate critics, web searches, anything requiring synthesis |
| `Plan` | Getting a second opinion on architecture design (not what `prep` uses for its own plans) |
| `claude-code-guide` | Questions about Claude Code features, Claude API, Anthropic SDK |

## Cap response length

Always cap response length to protect your context window:

```
"Report under 200 words."
"List file paths only — no explanations."
"Return a table: file | exported-name | Zod shape."
"3–7 bullet objections. No essays."
```

Uncapped subagents return everything they find, which can be hundreds of lines.

## Critic subagents (for DEBATE phase)

Critic subagents need three things in the brief:
1. The draft plan (inline or as a file path to read)
2. The original task (2–3 sentences of context)
3. An explicit adversarial framing ("Your job is to argue X is wrong")

See `references/self-debate.md` for full critic brief templates.

## Trust but verify

Subagent output describes what the subagent thinks it found, not necessarily what actually exists. For facts that matter:

- "Function `foo` exists" → `Grep` to confirm before building on it
- "Column is nullable" → `Read` the schema file to confirm
- "Pattern is used in 3 places" → `Grep` to count and verify

Don't architect on a subagent's interpretation of code it may have partially read.

## Sub-subagents

Subagents cannot spawn their own subagents in this setup. If you need nested delegation, restructure the task so the parent session spawns all required subagents directly in one message.

## Anti-patterns

| Anti-pattern | Why |
|---|---|
| Subagent for a single Read | Direct tool is faster and cheaper |
| Subagent because the task feels big | Big ≠ needs a subagent; needs careful direct work |
| Paste subagent output verbatim into the plan | Subagent output is evidence, not the plan |
| No length cap | Bloats context window; subagents over-explain |
| Sequential when parallel works | 3× the time for no benefit |
| Sub-subagents | Not supported; restructure as sibling agents |
