import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: '.env' })

export default defineConfig({
  schema: [
    './server/db/schemas/index.ts',
  ],
  out: './server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: process.env.POSTGRES_URL
    ? {
        url: process.env.POSTGRES_URL,
        ssl: false,
      }
    : {
        host: process.env.POSTGRES_HOST!,
        port: Number(process.env.POSTGRES_PORT),
        user: process.env.POSTGRES_USER!,
        password: process.env.POSTGRES_PASSWORD!,
        database: process.env.POSTGRES_DB!,
        ssl: false,
      },
  verbose: true,
  strict: true,
})
