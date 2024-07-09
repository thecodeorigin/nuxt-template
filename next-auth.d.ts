import type { DefaultSession } from 'next-auth'
import { Rule } from './plugins/casl/ability'

interface UserAdditionalData {
  email?: string
  phone?: string
  full_name?: string
  avatar_url?: string
  billing_address?: any
  payment_method?: any
  abilityRules?: Rule[]
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends UserAdditionalData {}
}

declare module "next-auth" {
    
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: UserAdditionalData & DefaultSession['user']
  }

  interface User extends UserAdditionalData { }
}
