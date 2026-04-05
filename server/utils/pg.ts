import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleServerless } from 'drizzle-orm/neon-http'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '../db/pg/schema'

export function getPgClient() {
  const runtimeConfig = useRuntimeConfig()

  if (import.meta.dev) {
    return drizzle(
      runtimeConfig.postgresUrl as string,
      { schema },
    )
  }
  else {
    return drizzleServerless(
      neon(runtimeConfig.postgresUrl as string),
      { schema },
    )
  }
}
