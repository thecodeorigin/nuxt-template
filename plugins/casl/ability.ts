import { createMongoAbility } from '@casl/ability'
import type { Enums, Tables } from '@/server/types/supabase'

type Permission = Tables<'sys_permissions'>

export type Actions = Enums<'permission_action'>

// ex: Post, Comment, User, etc. We haven't used any of these in our demo though.
export type Subjects = Enums<'permission_subject'>

export type Rule = Permission

export const ability = createMongoAbility<[Actions, Subjects]>()
