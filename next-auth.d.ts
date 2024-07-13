import type { DefaultSession } from 'next-auth'
import type { Tables } from './server/types/supabase'

export type LoggedInUser = Tables<'sys_users'> & {
  role: Tables<'sys_roles'> & {
    permissions: Tables<'sys_permissions'>[]
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends LoggedInUser {}
}

declare module 'next-auth' {

  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: LoggedInUser & DefaultSession['user']
  }

  interface User extends LoggedInUser { }
}

export {}
