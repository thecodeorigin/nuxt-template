# Research Phase

> When and how to investigate before designing. Choosing between direct tools, subagents, and web searches.

## When to research vs when to design

Research until you can write the Architecture section with concrete file paths and function signatures. Signs you're ready:
- You know which existing files you'll edit
- You know the schema changes needed (if any)
- You know the auth pattern to use
- You know the closest existing feature to mirror
- You've identified the open questions that remain

Signs you need more research:
- You'd write "implement X" without knowing what X looks like
- You're not sure where to put the code
- You don't know if this functionality already exists

## Internal research (codebase)

### 1–3 targeted lookups → direct tools

```bash
# Find a file
Glob: layers/*/server/api/**/*.ts

# Find a function or pattern
Grep: "defineAuthenticatedHandler" (type: ts)

# Read a specific file
Read: server/db/schema.ts
```

### 3+ lookups, open-ended → Explore subagent

```
Agent(subagent_type: "Explore", prompt: "
  Find all server routes that use defineAuthorizedHandler.
  For each route, note:
  - File path
  - The ability checks used
  - What data is returned
  Search very thoroughly — check all layers.
  Report under 300 words with file paths.
")
```

### Multiple independent questions → parallel subagents (one message)

```
// Two agents at once — one message, both Agent tool calls:
Agent("How is session data structured in KV — key format, TTL, fields?")
Agent("What does the todo layer's e2e test file look like?")
```

Never spawn subagents for what a single `Read` or `Grep` can answer.

## External research (docs, specs)

### Known documentation URL → WebFetch

```
WebFetch("https://orm.drizzle.team/docs/column-types/sqlite")
```

### "How do I X with Y" → WebSearch

```
WebSearch("drizzle orm sqlite batch insert 2024")
```

### Claude Code / Claude API questions → claude-code-guide subagent

```
Agent(subagent_type: "claude-code-guide", prompt: "
  How does defineAuthorizedHandler work in Claude Code agent teams?
  Specifically: can teammates see each other's TaskCreate calls?
")
```

## Spawning Explore subagents

Brief them like a colleague who just walked in:
- State why you're investigating (not just what to find)
- Include known file paths as starting points
- Specify thoroughness: "quick" (1 lookup), "medium" (5–10 lookups), "very thorough" (exhaustive)
- Cap the response: "report under 300 words" or "list file paths only"

```
Agent(subagent_type: "Explore",
  description: "Find all Zod schemas in the project",
  prompt: "
    Find all Zod schema files in layers/*/shared/schemas/.
    For each file, list the schema names exported and the Zod shape (briefly).
    I'm trying to understand the pattern before adding a new schema.
    Quick search — just the schemas/ directories.
    Report as a table: file | schema name | shape.
  "
)
```

## Parallel research

Independent questions → one message with multiple Agent calls:

```
// In one message:
Agent(...)  // "What does the auth layer's KV session look like?"
Agent(...)  // "How does the existing todo e2e test log in?"
Agent(...)  // "What Drizzle query pattern is used for user-scoped selects?"
```

Never chain research subagents that could run in parallel. The cost of sequential is 3× the time.

## Trust but verify

Subagent output is the subagent's interpretation. For facts that matter:
- Does a function exist? → Grep to confirm
- What's a column's exact type? → Read `server/db/schema.ts`
- Does a test file use a specific pattern? → Read the file

Don't build an architecture on a subagent's summary of code it only partially read.

## Knowing when to stop

Stop researching when:
- You can write the Architecture section with concrete paths and signatures
- Further searches return the same information you already have
- You've identified all the open questions that remain

Continue researching if:
- You'd write a step as "implement X" without knowing the exact code
- You're not sure whether the functionality already exists
- The existing pattern is unclear

## Common investigation patterns

| Question | Tool |
|---|---|
| "How does this project do X?" | `Explore` subagent (medium) |
| "What breaks if I change column Y?" | `Grep` for usages, then `Explore` if many |
| "Does prior art exist?" | `Grep` for the pattern + `Read` matching files |
| "What does library X support?" | `WebFetch` docs URL |
| "How do I accomplish Y with NuxtHub?" | `WebFetch` docs or `WebSearch` |
| "What does the closest existing feature look like?" | `Read` 3–5 files end-to-end |

## Anti-patterns

| Anti-pattern | Why |
|---|---|
| Researching to procrastinate | Research has diminishing returns after ~30 minutes |
| Skipping research on "obvious" features | The obvious pattern is often not what the codebase uses |
| Pasting subagent output verbatim into the plan | Subagent output is evidence, not the plan |
| Trusting one source | Cross-reference code with docs for non-trivial APIs |
| Sequential subagents for parallel questions | Wastes time; spawn in parallel |
