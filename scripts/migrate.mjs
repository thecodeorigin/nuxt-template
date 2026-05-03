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

try {
  console.log('Running migrations against', url.replace(/:[^:@]*@/, ':***@'))
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
