import type { DefaultSession } from 'next-auth'
import type { Tables } from './server/types/supabase'

type UserAdditionalData = Tables<'sys_users'> & {
  role: Tables<'sys_roles'> & {
    permissions: Tables<'sys_permissions'>[]
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends UserAdditionalData {}
}

declare module 'next-auth' {

  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: UserAdditionalData & DefaultSession['user']
  }

  interface User extends UserAdditionalData { }
}
