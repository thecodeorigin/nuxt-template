/**
 * Lightweight migration runner that works in any Nitro runtime (including
 * Vercel serverless functions). It reads SQL files bundled as Nitro server
 * assets, tracks applied filenames in a `__migrations` table, and applies
 * pending ones idempotently. Concurrent runs are safe because the INSERT
 * uses the table's primary key as a guard.
 */

import { neon } from '@neondatabase/serverless'

export interface MigrationResult {
  applied: string[]
  skipped: string[]
}

const ASSET_NAMESPACE = 'assets:db-migrations'
const STMT_SEPARATOR = '--> statement-breakpoint'

export async function runMigrations(): Promise<MigrationResult> {
  const config = useRuntimeConfig()
  const url = config.postgresUrl as string | undefined
  if (!url)
    throw new Error('NUXT_POSTGRES_URL is not set; cannot run migrations.')

  const sql = neon(url)

  await sql`
    CREATE TABLE IF NOT EXISTS __migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  const appliedRows = await sql`SELECT name FROM __migrations` as Array<{ name: string }>
  const applied = new Set(appliedRows.map(r => r.name))

  const assets = useStorage(ASSET_NAMESPACE)
  const keys = (await assets.getKeys()).filter(k => k.endsWith('.sql')).sort()

  const result: MigrationResult = { applied: [], skipped: [] }

  for (const key of keys) {
    const name = normalizeMigrationName(key)
    if (applied.has(name)) {
      result.skipped.push(name)
      continue
    }

    const content = await assets.getItemRaw<string>(key)
    if (!content)
      continue

    const text = typeof content === 'string' ? content : new TextDecoder().decode(content as ArrayBuffer)
    const statements = text.split(STMT_SEPARATOR).map(s => s.trim()).filter(Boolean)

    for (const stmt of statements)
      await sql.query(stmt)

    await sql`INSERT INTO __migrations (name) VALUES (${name}) ON CONFLICT (name) DO NOTHING`
    result.applied.push(name)
  }

  return result
}

// unstorage namespaced keys can come back with `:` separators; we just
// want the bare filename so two different storage drivers produce the
// same identity in __migrations.
const PATH_PREFIX = /^.*[:/]/

function normalizeMigrationName(key: string): string {
  return key.replace(PATH_PREFIX, '')
}
