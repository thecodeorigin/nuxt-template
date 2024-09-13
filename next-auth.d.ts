import type { DefaultSession } from 'next-auth'
import type * as z from 'zod'
import type { selectSysUserSchema } from './server/db/schemas/sys_users.schema'

type LoggedInUser = z.infer<typeof selectSysUserSchema>

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

  interface User extends LoggedInUser {
    verified?: boolean
  }
}

export {}
