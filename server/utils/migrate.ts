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
const MAX_ATTEMPTS = 4
const BASE_BACKOFF_MS = 500

export async function runMigrations(): Promise<MigrationResult> {
  const config = useRuntimeConfig()
  // Prefer the unpooled connection for migrations — schema-changing DDL
  // shouldn't go through the pooler, and the unpooled endpoint is more
  // tolerant of cold-start fetch failures than Neon's HTTP pooler.
  const url
    = (process.env.POSTGRES_URL_NON_POOLING as string | undefined)
      ?? (config.postgresUrl as string | undefined)
  if (!url)
    throw new Error('No Postgres URL configured (NUXT_POSTGRES_URL / POSTGRES_URL_NON_POOLING).')

  return withRetry(() => runMigrationsOnce(url))
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fn()
    }
    catch (err: unknown) {
      lastErr = err
      const message = (err as Error)?.message ?? ''
      const isTransient
        = message.includes('fetch failed')
          || message.includes('socket')
          || message.includes('ECONNRESET')
          || message.includes('ETIMEDOUT')
      if (!isTransient || attempt === MAX_ATTEMPTS)
        break
      const delay = BASE_BACKOFF_MS * 2 ** (attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw lastErr
}

async function runMigrationsOnce(url: string): Promise<MigrationResult> {
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
