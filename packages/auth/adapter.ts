import { and, eq, getTableColumns } from 'drizzle-orm'
import type {
  PgDatabase,
  PgQueryResultHKT,
} from 'drizzle-orm/pg-core'

import type {
  Adapter,
  AdapterAccount,
  AdapterAuthenticator,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from '@auth/core/adapters'
import type { Awaitable } from '@auth/core/types'

import { sysAccountTable } from './sys_accounts.schema'
import { sysAuthenticatorTable } from './sys_authenticators.schema'
import { sysSessionTable } from './sys_sessions.schema'
import { sysUserTable } from './sys_users.schema'
import { sysVerificationTokenTable } from './sys_vertifications.schema'

export type SysUser = typeof sysUserTable.$inferSelect

export type SysSession = typeof sysSessionTable.$inferSelect

export type SysAccount = typeof sysAccountTable.$inferSelect

export type SysAuthenticator = typeof sysAuthenticatorTable.$inferSelect

export type SysVerificationToken = typeof sysVerificationTokenTable.$inferSelect

function adaptUser(user?: SysUser | null): AdapterUser | null {
  return user
    ? {
        id: user.id || '',
        email: user.email || '',
        emailVerified: user.email_verified || null,
        image: user.avatar_url || null,
        name: user.full_name || null,
      }
    : null
}

function adaptSession(session?: SysSession | null): AdapterSession | null {
  return session
    ? {
        sessionToken: session.session_token || '',
        userId: session.user_id || '',
        expires: session.expires || new Date(),
      }
    : null
}

function adaptAccount(account?: SysAccount | null): AdapterAccount | null {
  return account
    ? {
        id: account.id || '',
        userId: account.user_id || '',
        type: account.type || 'email',
        provider: account.provider || '',
        providerAccountId: account.provider_account_id || '',
        refreshToken: account.refresh_token || null,
        accessToken: account.access_token || null,
        expiresAt: account.expires_at || null,
        tokenType: account.token_type || null,
        scope: account.scope || undefined,
        idToken: account.id_token || null,
        sessionState: account.session_state || null,
      }
    : null
}

function adaptAuthenticator(authenticator?: SysAuthenticator | null): AdapterAuthenticator | null {
  return authenticator
    ? {
        credentialID: authenticator.credential_id || '',
        userId: authenticator.user_id || '',
        providerAccountId: authenticator.provider_account_id || '',
        credentialPublicKey: authenticator.credential_public_key || '',
        counter: authenticator.counter || 0,
        credentialDeviceType: authenticator.credential_device_type || '',
        credentialBackedUp: authenticator.credential_backed_up || false,
        transports: authenticator.transports || '',
      }
    : null
}

export function PostgresDrizzleAdapter(
  client: PgDatabase<PgQueryResultHKT, any>,
): Adapter {
  return {
    async createUser(data: AdapterUser): Promise<AdapterUser> {
      const { id, ...insertData } = data
      const hasDefaultId = getTableColumns(sysUserTable).id.hasDefault

      const body = {
        email: insertData.email,
        email_verified: insertData.emailVerified,
        avatar_url: insertData.image,
        full_name: insertData.name,
      }

      return client
        .insert(sysUserTable)
        .values(hasDefaultId ? body : { ...body, id })
        .returning()
        .then(res => adaptUser(res[0])!)
    },

    async getUser(userId: string): Promise<AdapterUser | null> {
      return client
        .select()
        .from(sysUserTable)
        .where(eq(sysUserTable.id, userId))
        .then(res =>
          res.length > 0 ? adaptUser(res[0]) : null,
        )
    },

    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      return client
        .select()
        .from(sysUserTable)
        .where(eq(sysUserTable.email, email))
        .then(res =>
          res.length > 0 ? adaptUser(res[0]) : null,
        )
    },

    async createSession(data: {
      sessionToken: string
      userId: string
      expires: Date
    }): Promise<AdapterSession> {
      return client
        .insert(sysSessionTable)
        .values({
          session_token: data.sessionToken,
          user_id: data.userId,
          expires: data.expires,
        })
        .returning()
        .then(res => adaptSession(res[0])!)
    },

    async getSessionAndUser(sessionToken: string): Promise<{
      session: AdapterSession
      user: AdapterUser
    } | null> {
      console.log('getSessionAndUser', sessionToken)

      return client
        .select({
          session: sysSessionTable,
          user: sysUserTable,
        })
        .from(sysSessionTable)
        .where(eq(sysSessionTable.session_token, sessionToken))
        .innerJoin(sysUserTable, eq(sysUserTable.id, sysSessionTable.user_id))
        .then(res => (res[0]
          ? {
              user: adaptUser(res[0].user)!,
              session: adaptSession(res[0].session)!,
            }
          : null))
    },

    async updateUser(data: Partial<AdapterUser> & Pick<AdapterUser, 'id'>): Promise<AdapterUser> {
      if (!data.id) {
        throw new Error('No user id.')
      }

      const body = {
        email: data.email,
        email_verified: data.emailVerified,
        avatar_url: data.image,
        full_name: data.name,
      }

      const [result] = await client
        .update(sysUserTable)
        .set(body)
        .where(eq(sysUserTable.id, data.id))
        .returning()

      if (!result) {
        throw new Error('No user found.')
      }

      return adaptUser(result)!
    },

    async updateSession(
      data: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>,
    ): Promise<AdapterSession> {
      return client
        .update(sysSessionTable)
        .set(data)
        .where(eq(sysSessionTable.session_token, data.sessionToken))
        .returning()
        .then(res => adaptSession(res[0])!)
    },

    async linkAccount(data: AdapterAccount) {
      await client.insert(sysAccountTable).values({
        user_id: data.userId,
        type: data.type,
        provider: data.provider,
        provider_account_id: data.providerAccountId,
        refresh_token: data.refreshToken,
        access_token: data.accessToken,
        expires_at: data.expiresAt,
        token_type: data.tokenType,
        scope: data.scope,
        id_token: data.idToken,
        session_state: data.sessionState,
      } as typeof sysAccountTable.$inferInsert)
    },

    async getUserByAccount(
      account: Pick<AdapterAccount, 'provider' | 'providerAccountId'>,
    ): Promise<AdapterUser | null> {
      const result = await client
        .select({
          account: sysAccountTable,
          user: sysUserTable,
        })
        .from(sysAccountTable)
        .innerJoin(sysUserTable, eq(sysAccountTable.user_id, sysUserTable.id))
        .where(
          and(
            eq(sysAccountTable.provider, account.provider),
            eq(sysAccountTable.provider_account_id, account.providerAccountId),
          ),
        )
        .then(res => res[0])

      return result?.user
        ? adaptUser(result?.user)
        : null
    },

    async deleteSession(sessionToken: string) {
      await client
        .delete(sysSessionTable)
        .where(eq(sysSessionTable.session_token, sessionToken))
    },

    async createVerificationToken(data: VerificationToken) {
      return client
        .insert(sysVerificationTokenTable)
        .values(data)
        .returning()
        .then(res => res[0])
    },

    async useVerificationToken(params: { identifier: string, token: string }): Promise<VerificationToken | null> {
      return client
        .delete(sysVerificationTokenTable)
        .where(
          and(
            eq(sysVerificationTokenTable.identifier, params.identifier),
            eq(sysVerificationTokenTable.token, params.token),
          ),
        )
        .returning()
        .then(res => (res[0] ? res[0] : null))
    },

    async deleteUser(id: string) {
      await client.delete(sysUserTable).where(eq(sysUserTable.id, id))
    },

    async unlinkAccount(
      params: Pick<AdapterAccount, 'provider' | 'providerAccountId'>,
    ) {
      await client
        .delete(sysAccountTable)
        .where(
          and(
            eq(sysAccountTable.provider, params.provider),
            eq(sysAccountTable.provider_account_id, params.providerAccountId),
          ),
        )
    },

    async getAccount(providerAccountId: string, provider: string): Promise<AdapterAccount | null> {
      return client
        .select()
        .from(sysAccountTable)
        .where(
          and(
            eq(sysAccountTable.provider, provider),
            eq(sysAccountTable.provider_account_id, providerAccountId),
          ),
        )
        .then(res => res[0] ? adaptAccount(res[0]) : null)
    },

    async createAuthenticator(data: AdapterAuthenticator): Promise<AdapterAuthenticator> {
      return client
        .insert(sysAuthenticatorTable)
        .values({
          credential_id: data.credentialID,
          user_id: data.userId,
          provider_account_id: data.providerAccountId,
          credential_public_key: data.credentialPublicKey,
          counter: data.counter,
          credential_device_type: data.credentialDeviceType,
          credential_backed_up: data.credentialBackedUp,
          transports: data.transports,
        })
        .returning()
        .then(res => adaptAuthenticator(res[0])!)
    },

    async getAuthenticator(credentialID: string) {
      return client
        .select()
        .from(sysAuthenticatorTable)
        .where(eq(sysAuthenticatorTable.credential_id, credentialID))
        .then(res => res[0] ?? null) as Awaitable<AdapterAuthenticator | null>
    },

    async listAuthenticatorsByUserId(userId: string) {
      return client
        .select()
        .from(sysAuthenticatorTable)
        .where(eq(sysAuthenticatorTable.user_id, userId))
        .then(res => res) as Awaitable<AdapterAuthenticator[]>
    },

    async updateAuthenticatorCounter(credentialID: string, newCounter: number): Promise<AdapterAuthenticator> {
      const authenticator = await client
        .update(sysAuthenticatorTable)
        .set({ counter: newCounter })
        .where(eq(sysAuthenticatorTable.credential_id, credentialID))
        .returning()
        .then(res => res[0])

      if (!authenticator)
        throw new Error('Authenticator not found.')

      return adaptAuthenticator(authenticator)!
    },
  }
}
