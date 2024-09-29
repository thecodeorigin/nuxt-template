import type { DefaultSession } from 'next-auth'
import type * as z from 'zod'
import type { selectSysUserSchema } from '../../server/db/schemas/sys_users.schema'
import type { selectSysPermissionSchema, selectSysRoleSchema } from '../../server/db/schemas'

export type LoggedInUser = z.infer<typeof selectSysUserSchema> & {
  role: z.infer<typeof selectSysRoleSchema> & {
    permissions: z.infer<typeof selectSysPermissionSchema>[]
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: string
    email: string
    phone: string
    provider: string
    avatar_url?: string
  }
}

declare module 'next-auth' {

  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: Omit<LoggedInUser, 'password'>
  }

  interface User extends Omit<LoggedInUser, 'password'> {
    verified?: boolean
  }
}

export {}
