# Output Standards

> Writing style and content format for plan files. Consistency makes plans cook-readable without re-explanation.

## Writing style

- **Bullets over prose**: use lists for 3+ items; prose for 1–2 sentences of context
- **Short sentences**: ≤ 20 words per sentence; break longer ones at conjunctions
- **No filler**: remove "It is worth noting that…", "In order to…", "Please note…"
- **Tables for comparisons**: 3+ items being compared → table (not nested bullets)
- **Code in fenced blocks**: always include the language identifier (```ts, ```bash, ```sql)
- **File paths in backticks**: `server/db/schema.ts`, not "the schema file"
- **Commands verbatim**: exactly as cook would type them, with expected output

## Phase content structure

Every phase file follows this template:

```
# Phase N: <name>

**Depends on**: <phase name or "—">
**Blocks**: <phase name or "—">

## Goal
<one sentence>

## Files
| File | Action |
|---|---|

## Steps
### Step 1: <Verb + Object>
...

## Verify
<exact command + expected output>

## Rollback
<how to undo — or "no rollback needed">
```

## Step content types

### File creation step
```markdown
### Step 1: Create Zod schema for Todo
Tool: Write
File: `layers/todo/shared/schemas/todo.ts`
\`\`\`ts
import { z } from 'zod'

export const CreateTodoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
})

export type CreateTodo = z.infer<typeof CreateTodoSchema>

export const UpdateTodoSchema = CreateTodoSchema.partial()
export type UpdateTodo = z.infer<typeof UpdateTodoSchema>
\`\`\`
```

### File edit step
```markdown
### Step 2: Add todoTable to DB schema
Tool: Edit
File: `server/db/schema.ts`
Old:
\`\`\`ts
// last line of file
export { userTable }
\`\`\`
New:
\`\`\`ts
export { userTable, todoTable }
\`\`\`
```

### Command step
```markdown
### Step 3: Generate and apply migration
\`\`\`bash
pnpm db:generate
\`\`\`
Expected: creates a file in `server/db/migrations/sqlite/` with `CREATE TABLE todo`

\`\`\`bash
pnpm db:migrate
\`\`\`
Expected: "Applied N migration(s)" (exit 0)
```

### Verification step
```markdown
## Verify
\`\`\`bash
pnpm vitest run --project unit layers/todo/test/unit/todo-schema.test.ts
\`\`\`
Expected: ✓ all tests passed (exit 0)
```

## Code in the plan — non-negotiable

For known stacks, every step that touches code must include:

1. **File creation**: the complete file content
2. **File edit**: Old/New diff with enough context to locate uniquely
3. **Schema change**: the actual Drizzle table definition
4. **Route handler**: the actual `defineEventHandler` implementation
5. **Test**: the actual test case assertions

Pseudocode is not acceptable for this stack. Write `defineAuthenticatedHandler(async (event, session) => { ... })` — not "wrap it with the auth handler".

## Test strategy section (per phase)

Every phase that introduces new behavior gets a test strategy section:

```markdown
## Test strategy
- Unit: `layers/todo/test/unit/todo-schema.test.ts` — boundary tests for CreateTodoSchema and UpdateTodoSchema
- Nuxt: `layers/todo/test/nuxt/todo-page.test.ts` — renders empty state, renders list
- E2E: `layers/todo/tests/todo.e2e.ts` — create → read → update → delete flow
```

## Acceptance criteria checklist

At the bottom of `plan.md`, a tickable list of concrete outcomes:

```markdown
## Acceptance criteria

- [ ] `GET /api/todos` returns `[]` for a new user (200)
- [ ] `POST /api/todos` with `{ title: "x" }` returns 201 and the created item
- [ ] `POST /api/todos` with `{ title: "" }` returns 400
- [ ] `PATCH /api/todos/:id` owned by another user returns 403
- [ ] `DELETE /api/todos/:id` returns 204 and item is gone
- [ ] Todo list page shows empty state when no todos
- [ ] Todo list page shows items after creation (no refresh needed)
- [ ] pnpm lint exits 0
- [ ] pnpm typecheck exits 0
- [ ] pnpm test exits 0 (unit + nuxt projects)
- [ ] pnpm test:e2e exits 0 (todo.e2e.ts)
```

## Open questions block

At the very **TOP** of `plan.md`, before anything else:

```markdown
> ❓ Should the todo `status` field allow custom values or only `pending|active|done`?
> ❓ Should deleting a todo hard-delete or soft-delete (add `deletedAt` column)?
```

If there are no open questions: write `> No open questions — plan is cook-ready.`

Never bury questions in the middle of a phase. Cook will miss them.

## Cross-references

- Full file paths in backticks: `` `layers/todo/shared/schemas/todo.ts` ``
- Cite existing patterns: "following the pattern in `layers/todo/server/api/todos/index.get.ts`"
- Link to docs when using external APIs: include the URL inline

## Anti-patterns

| Anti-pattern | Example | Fix |
|---|---|---|
| Wall of prose | "The implementation will involve creating several files..." | Use bullets and tables |
| "implement X" without code | "Step 3: Implement the create route" | Write the actual handler |
| "run the tests" without specifics | "Step 5: Run tests" | `pnpm vitest run --project unit layers/todo/test/unit/todo-schema.test.ts` |
| Time estimates | "Phase 1 (~30 min):" | Remove entirely |
| Mid-document questions | Question buried in step 9 | Move to Open Questions at top |
| Speculative phases | "Phase 5: If this doesn't work, try X" | Pick one approach; remove speculation |
| Mixed grammar in steps | "Creates the file" / "Create the file" / "Creating the file" | Use imperative: "Create the file" |
