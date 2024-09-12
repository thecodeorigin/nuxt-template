import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: '.env' })

export default defineConfig({
  schema: './server/db/schemas/*.schema.ts',
  out: './server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.SUPABASE_CONNECTION_STRING!,
  },
})
