import path from 'node:path'
import { drizzle } from 'drizzle-orm/postgres-js'
import { config } from 'dotenv'
import postgres from 'postgres'

config({ path: path.resolve(process.cwd(), '.env') })

export const db = drizzle(
  postgres({
    host: process.env.POSTGRES_HOST!,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER!,
    password: process.env.POSTGRES_PASSWORD!,
    database: process.env.POSTGRES_DB!,
  }),
)
