# Refactor Data

> One-off data migrations. The `refactor/` verb is for the work that
> doesn't fit `seed` / `create` / `update`: cleaning up bad data,
> moving columns after a schema change, healing prod drift.

## When to use `refactor/`

| Situation | Verb |
|---|---|
| Apply a new ability key to existing memberships | `update/` (recurring intent — same fix may need re-running across envs) |
| Backfill a new column after `pnpm db:generate` | `refactor/` (one-off per schema bump) |
| Move data from a deprecated table to a replacement | `refactor/` |
| Fix bad data from a prod incident | `refactor/` |
| Normalise inconsistent enum values | `refactor/` |
| Initial setup of a row the product needs to function | `create/` |
| Re-running the dev fixtures | `seed/` |

The mental test: if you'd be embarrassed to keep this task around
forever and run it weekly, it's `refactor/`. If it's the
canonical "this is how we make sure X exists", it's `create/`.

`refactor/` tasks live next to the others — they're not deleted after
running. They're the audit trail. If you removed every `refactor/`
task after running it once, future contributors would have no record
of how prod data ended up in its current shape.

## The expand-contract dance

For any data move tied to a schema change, follow expand-contract.
Drizzle migrations only handle the schema; data backfill is yours:

1. **Expand** — generate the schema migration (new column nullable or
   with default). Commit migration + schema change.
2. **Backfill** — write a `refactor/` task that fills the new column
   for existing rows. Run it once per env (dev → preview → prod).
3. **Contract** — when the new column is fully populated, generate
   another migration to flip it to `NOT NULL` (or drop the old
   column). Commit that migration.

Never combine expand and contract in one migration unless the table
is small enough that an instant rewrite is acceptable. On D1 a
multi-step migration is friendlier than a single risky one.

## Dry-run pattern

Every `refactor/` task should support a `dry_run` payload flag:

```ts
// layers/<layer>/server/tasks/refactor/<noun>.ts
interface Payload {
  dry_run?: boolean
}

export default defineTask({
  meta: {
    name: 'refactor:<noun>',
    description: 'One-off cleanup of <table>.<column>. Pass {dry_run:true} to preview.',
  },
  run: async ({ payload }: { payload?: Payload } = {}) => {
    const summary = await refactorThing({ dryRun: payload?.dry_run ?? false })
    return { result: 'ok', ...summary }
  },
})
```

The service reads the candidate rows, computes the change, and either
writes (live) or just returns the diff (dry-run):

```ts
export async function refactorThing(opts: { dryRun: boolean }) {
  const candidates = await db.query.userTable.findMany({
    where: <criteria>,
    columns: { id: true, <relevant cols> },
  })

  const changes = candidates.filter(needsFix).map(toFix)

  if (opts.dryRun) {
    return { dry_run: true, examined: candidates.length, would_change: changes.length, sample: changes.slice(0, 5) }
  }

  for (const c of changes) {
    await db.update(userTable).set(c.patch).where(eq(userTable.id, c.id))
  }
  return { dry_run: false, examined: candidates.length, changed: changes.length }
}
```

Default dry-run when the payload is missing? Up to you per task, but
for anything with > 1000 candidate rows, **default to dry-run** so a
careless invocation doesn't rewrite prod. Document the default in
`meta.description`.

## Idempotency for refactor

Same rule as the other verbs: a re-run after partial failure must
heal, not duplicate or crash.

- For backfills: filter the read to "rows still needing the fix"
  (`where: isNull(table.new_column)`)
- For data moves: write to the destination idempotently
  (`onConflictDoNothing()` for catalog-style; diff-before-write for
  unique fields)
- For deletes: filter to "rows still matching the obsolete shape"

If the task fails halfway through and you re-run it, the second run
should pick up where the first left off and not touch rows already
fixed.

## Rollback strategy

Most `refactor/` tasks are one-way (you can't unbreak a deleted row).
The honest answer: rely on the schema's append-only history and the
D1 point-in-time backups (Cloudflare D1 keeps PITR up to 30 days on
the paid tier — see `chrome-devtools-mcp:debug-optimize-lcp` adjacent
infra notes).

For high-risk refactors:

1. Before running: `nuxt db sql "SELECT * FROM <table> WHERE <criteria>"`
   — capture the pre-state to a file you commit (gitignore the
   exact rows if PII; commit a count + structural summary).
2. Run with `dry_run: true` first; eyeball the `sample`.
3. Run live in dev → preview → prod, with a pause between to check
   the post-state.
4. Keep the `refactor/` task in the repo even after running — it's
   the rollforward record.

## Naming refactor tasks

Be precise about what the task does. The name will outlive the
context.

| Bad | Good |
|---|---|
| `refactor:fix-users` | `refactor:strip-trailing-whitespace-from-user-name` |
| `refactor:cleanup` | `refactor:remove-billing-export-from-deprecated-grants` |
| `refactor:migrate-data` | `refactor:backfill-organization-slug` |

If the name takes more than 8 words, split the task.

## What never goes in `refactor/`

- Schema changes (those are Drizzle migrations: `pnpm db:generate`)
- Code refactors (those are PR work, not tasks)
- "Just one quick fix" you intend to run from `nuxt db sql` — make it
  a task. Always.
- Tasks that take destructive params and have no dry-run (always add
  one)
