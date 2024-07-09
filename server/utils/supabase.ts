
import type { SupabaseClient as Supabase } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

export type SupabaseClient = Supabase<Database>

export type Relation = keyof Database['public']['Tables']

export type GetMatch<T extends Relation> = Database['public']['Tables'][T]['Row']

export type InsertPayload<T extends Relation> = Database['public']['Tables'][T]['Insert']

export type UpdatePayload<T extends Relation> = Database['public']['Tables'][T]['Update']

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
