import type { DefaultSession } from 'next-auth'
import type * as z from 'zod'
import type { selectSysUserSchema } from '@base/server/db/schemas/sys_users.schema'
import type { sysPermissionTable, sysRoleTable, sysUserTable } from '@base/server/db/schemas'

export type LoggedInUser = Omit<typeof sysUserTable.$inferSelect & {
  role: typeof sysRoleTable.$inferSelect & {
    permissions: typeof sysPermissionTable.$inferSelect[]
  }
}, 'password'>

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id?: string
    email?: string
    phone?: string
    provider?: string
    accessToken?: string
  }
}

declare module 'next-auth' {

  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      email: string
      phone: string
      provider: string
    }
  }

  interface User extends LoggedInUser {}
}

export {}
