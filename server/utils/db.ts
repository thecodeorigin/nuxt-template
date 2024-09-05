import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = postgres(process.env.SUPABASE_CONNECTION_STRING!)

export const db = drizzle(client)
