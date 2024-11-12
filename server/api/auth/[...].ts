import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'
import FacebookProvider from 'next-auth/providers/facebook'
import TwitterProvider from 'next-auth/providers/twitter'
import AppleProvider from 'next-auth/providers/apple'
import DiscordProvider from 'next-auth/providers/discord'
import { sysAccountTable } from '@base/server/db/schemas'
import { useUserCrud } from '@base/server/composables/useUserCrud'
import type { LoggedInUser } from '../../../next-auth'
import { db } from '../../utils/db'
import { NuxtAuthHandler } from '#auth'

const runtimeConfig = useRuntimeConfig()

export default NuxtAuthHandler({
  secret: runtimeConfig.auth.secret,
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {}, // Object is required but can be left empty.
      async authorize(credentials: any) {
        try {
          const response = await $fetch<{ data: LoggedInUser }>(`${process.env.NUXT_PUBLIC_API_BASE_URL}/auth/login/`, {
            method: 'POST',
            body: JSON.stringify(credentials),
          })

          return response.data
        }
        catch (error: any) {
          throw createError({
            statusCode: error.response.status || 500,
            statusMessage: error.response.statusText || ErrorMessage.INTERNAL_SERVER_ERROR,
          })
        }
      },
    }),
    // @ts-expect-error
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // @ts-expect-error
    GithubProvider.default({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    // @ts-expect-error
    FacebookProvider.default({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    // @ts-expect-error
    TwitterProvider.default({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
    // @ts-expect-error
    AppleProvider.default({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
    // @ts-expect-error
    DiscordProvider.default({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async signIn({ user }) {
      if (!user)
        return false

      return true
    },
    jwt({ token, user, account }) {
      if (account?.providerAccountId) {
        token.providerAccountId = account?.providerAccountId || user.id
        token.email = user.email!
        token.phone = user.phone!
        token.provider = account?.provider || 'credentials'
      }

      return token
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          email: token.email,
          phone: token.phone,
          provider: token.provider,
          providerAccountId: token.providerAccountId,
        },
      }
    },
  },
  events: {
    async signIn({ user, account }) {
      if (account?.providerAccountId) {
        await tryWithCache(
          getStorageSessionKey(account.providerAccountId),
          async () => {
            if (!user.email)
              return

            const { getUserByEmail, createUser } = useUserCrud()

            const sysUser = await getUserByEmail(user.email)

            if (!sysUser.data) {
              sysUser.data = (await createUser({
                email: user.email,
                full_name: user.name,
                avatar_url: user.image,
                phone: user.phone,
                email_verified: new Date(),
              })).data
            }

            if (!sysUser.data)
              return

            if (account && account.provider !== 'credentials') {
              try {
                await db.insert(sysAccountTable).values({
                  user_id: sysUser.data.id,
                  type: account.type,
                  provider: account.provider,
                  provider_account_id: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                } as typeof sysAccountTable.$inferInsert)
                  .onConflictDoUpdate({
                    target: sysAccountTable.provider_account_id,
                    set: {
                      refresh_token: account.refresh_token,
                      access_token: account.access_token,
                      expires_at: account.expires_at,
                      token_type: account.token_type,
                      scope: account.scope,
                      id_token: account.id_token,
                      session_state: account.session_state,
                    } as typeof sysAccountTable.$inferInsert,
                  })
              }
              catch (error: any) {
                console.error(error)
              }
            }

            return sysUser.data
          },
        )
      }
    },
    async signOut({ token }) {
      if (token.providerAccountId) {
        await clearCache(getStorageSessionKey(token.providerAccountId))
      }
    },
  },
  cookies: {
    sessionToken: {
      name: 'nuxt-session-token',
      options: { maxAge: Number(process.env.AUTH_MAX_AGE) || 60 * 60 * 24 * 30 },
    },
    callbackUrl: {
      name: 'nuxt-callback-url',
      options: { maxAge: Number(process.env.AUTH_MAX_AGE) || 60 * 60 * 24 * 30 },
    },
    csrfToken: {
      name: 'nuxt-csrf-token',
      options: { maxAge: Number(process.env.AUTH_MAX_AGE) || 60 * 60 * 24 * 30 },
    },
  },
})
