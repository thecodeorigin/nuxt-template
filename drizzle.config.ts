import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({
  path: process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env',
})

export default defineConfig({
  schema: [
    './server/db/pg/schema.ts',
  ],
  out: './server/db/pg/migrations',
  dialect: 'postgresql',
  dbCredentials: process.env.NUXT_POSTGRES_URL
    ? {
        url: process.env.NUXT_POSTGRES_URL,
        ssl: process.env.NUXT_POSTGRES_SSL === 'true',
      }
    : {
        host: process.env.NUXT_POSTGRES_HOST!,
        port: Number(process.env.NUXT_POSTGRES_PORT),
        user: process.env.NUXT_POSTGRES_USER!,
        password: process.env.NUXT_POSTGRES_PASSWORD!,
        database: process.env.NUXT_POSTGRES_DB!,
        ssl: process.env.NUXT_POSTGRES_SSL === 'true',
      },
  verbose: true,
  strict: true,
})
