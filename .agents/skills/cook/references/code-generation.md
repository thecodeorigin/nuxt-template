# Code Generation

> When to generate multiple files programmatically vs write them by hand.

## The threshold of three

| Count | Approach |
|---|---|
| 1–2 similar files | Hand-write them |
| 3+ similar files with mostly mechanical variation | Write a generator script |
| Many files with non-mechanical variation | Hand-write a canary, then generate the rest |

If you find yourself copy-pasting a file and changing 3 things, you've hit the threshold.

## Standard generator skeleton

```ts
// scripts/generate-<feature>.ts
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const ROOT = process.cwd()

const entities = [
  { name: 'Project', slug: 'project', route: '/projects' },
  { name: 'Task',    slug: 'task',    route: '/tasks' },
  { name: 'Comment', slug: 'comment', route: '/comments' },
]

for (const entity of entities) {
  const outDir = join(ROOT, `layers/${entity.slug}/shared/schemas`)
  mkdirSync(outDir, { recursive: true })

  const outFile = join(outDir, `${entity.slug}.ts`)

  if (existsSync(outFile)) {
    console.log(`skip: ${outFile} already exists`)
    continue
  }

  writeFileSync(outFile, `
import { z } from 'zod'

export const Create${entity.name}Schema = z.object({
  title: z.string().min(1).max(200),
})

export type Create${entity.name} = z.infer<typeof Create${entity.name}Schema>
`.trimStart())

  console.log(`create: ${outFile}`)
}
```

Key properties:
- **Idempotent**: `existsSync` check prevents overwriting existing files
- **Repo-relative paths**: `ROOT = process.cwd()` (not `__dirname`)
- **Progress feedback**: print `create:` or `skip:` for each file
- **Single entity descriptor** → many files

## Regenerate cycle

When a template changes:

1. Edit the template in the generator script
2. Delete the generated files (or the ones you want to regenerate)
3. Re-run the generator
4. Verify: `pnpm typecheck && pnpm lint`

Don't hand-edit generated files — the generator is the source of truth. If a generated file needs a one-off change, either update the generator or accept that file out of the generated set.

## Verify with one entity first

Before generating all entities:

1. Generate a single entity (comment out the others in the array)
2. Run the full verify cycle: `pnpm typecheck && pnpm lint && pnpm vitest run --project unit`
3. Smoke-test in the browser
4. Only then generate the rest

This prevents generating 20 files with the same template bug.

## Templates that bite

### Multi-statement single lines

ESLint's `max-statements-per-line` rule rejects multiple statements on one line. In template strings, break them:

```ts
// BAD template output
const x = 1; const y = 2;

// GOOD template output
const x = 1
const y = 2
```

### Unused imports for read-only entities

If the generated file conditionally needs an import, branch the template:

```ts
const imports = entity.hasAuth
  ? `import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'`
  : `import { defineEventHandler } from 'h3'`
```

### String/number prop types

Explicit type coercion in template to avoid TypeScript inference issues:

```ts
// In template: use 'as const' on literal values
const STATUS_OPTIONS = ['pending', 'active', 'done'] as const
```

### Component naming for explicit imports

Filenames must match the import alias pattern: `<Namespace>/<Namespace><Name>.vue`. Don't generate flat filenames — they won't match the project's naming convention.

## When a generator gets too smart

If the generator has 4+ levels of nested conditionals, it's a sign you're trying to generate too much variation. Options:

1. Split into multiple focused generators (one per variation type)
2. Accept that the highly-varied files should be hand-written
3. Generate a skeleton + a TODO comment for the parts that differ

A generator that requires deep knowledge of the domain to maintain isn't simpler than hand-writing the files.

## Generators are commits

Generated files are derived artifacts — but commit them. The generator script AND the generated files both belong in git:

- The generator script shows the intent
- The generated files make the code readable without running the generator

Commit them together in the same commit.

## Anti-pattern: generator used once

If you write a generator, generate the files once, and never use it again — it's not a generator, it's a one-shot script. Don't invest in making it reusable. Delete it after use or move it to `scripts/one-off/`.
