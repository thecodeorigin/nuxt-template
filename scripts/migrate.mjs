import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

const url = process.env.NUXT_POSTGRES_URL
if (!url) {
  console.error('NUXT_POSTGRES_URL is required')
  process.exit(1)
}

const pool = new Pool({
  connectionString: url,
  ssl: process.env.NUXT_POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 1,
})

const db = drizzle(pool)
const safeUrl = url.replace(/:[^:@]*@/, ':***@')

// Drizzle's migrator fails with "type X already exists" / "relation X already
// exists" when the schema was created out-of-band (e.g. a manually-run
// migration on a Neon branch that wasn't tracked in __drizzle_migrations).
// Detect that case once and stamp the journal so future runs are clean.
async function bootstrapDrizzleJournalIfNeeded() {
  const journal = JSON.parse(
    readFileSync(join('server/db/pg/migrations/meta/_journal.json'), 'utf8'),
  )

  await pool.query('CREATE SCHEMA IF NOT EXISTS drizzle')
  await pool.query(`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL,
      created_at BIGINT
    )
  `)

  const { rows: existing } = await pool.query(
    'SELECT hash FROM drizzle.__drizzle_migrations',
  )
  const knownHashes = new Set(existing.map(r => r.hash))

  // Treat the production DB as "already migrated up to here" only if a
  // schema marker (the activity_action enum) is present but no entries
  // exist in __drizzle_migrations.
  if (existing.length > 0)
    return

  const { rows: typeRows } = await pool.query(
    `SELECT 1 FROM pg_type WHERE typname = 'activity_action' LIMIT 1`,
  )
  if (typeRows.length === 0)
    return

  console.warn('Found existing schema with empty __drizzle_migrations — stamping journal as applied.')

  for (const entry of journal.entries) {
    const sql = readFileSync(
      join('server/db/pg/migrations', `${entry.tag}.sql`),
      'utf8',
    )
    const hash = createHash('sha256').update(sql).digest('hex')
    if (knownHashes.has(hash))
      continue
    await pool.query(
      'INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)',
      [hash, entry.when],
    )
  }
}

try {
  console.log('Running migrations against', safeUrl)
  await bootstrapDrizzleJournalIfNeeded()
  await migrate(db, { migrationsFolder: './server/db/pg/migrations' })
  console.log('Migrations applied successfully.')
}
catch (err) {
  console.error('Migration failed:')
  console.error(err)
  process.exit(1)
}
finally {
  await pool.end()
}
