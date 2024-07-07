
import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

export function getSupabase() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )
}

export function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_JWT_SECRET!
  )
}
