import path from 'node:path'
import { drizzle } from 'drizzle-orm/postgres-js'
import { config } from 'dotenv'
import postgres from 'postgres'
import * as schema from '../db/schemas'

config({ path: path.resolve(process.cwd(), '.env') })

export const db = drizzle(
  process.env.POSTGRES_URL
    ? postgres(process.env.POSTGRES_URL)
    : postgres({
      host: process.env.POSTGRES_HOST!,
      port: Number(process.env.POSTGRES_PORT),
      user: process.env.POSTGRES_USER!,
      password: process.env.POSTGRES_PASSWORD!,
      database: process.env.POSTGRES_DB!,
    }),
  {
    schema,
  },
)
