import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'
import FacebookProvider from 'next-auth/providers/facebook'
import type { Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import { useRoleCrud } from '@base/server/composables/useRoleCrud'
import { useUserCrud } from '@base/server/composables/useUserCrud'
import type { LoggedInUser } from '../../../next-auth'
import { NuxtAuthHandler } from '#auth'

const runtimeConfig = useRuntimeConfig()

async function getUser(token: JWT) {
  const { getUser: getUserByKey } = useUserCrud()

  if (token.email)
    return (await getUserByKey('email', token.email)).data
  else if (token.phone)
    return (await getUserByKey('phone', token.phone)).data
  else if (token.id)
    return (await getUserByKey('id', token.id)).data

  return null
}

async function createSysUser(token: JWT) {
  const { getRoleByName } = useRoleCrud()

  const userRole = await getRoleByName('User')

  if (!userRole.data?.id) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessage.CANNOT_FIND_ROLE,
    })
  }

  const { createUser } = useUserCrud()

  const sysUser = await createUser({
    ...omit(token, ['id']),
    password: '',
    language: '',
    country: '',
    city: '',
    postcode: '',
    address: '',
    organization: '',
    role_id: userRole.data.id,
  })

  return sysUser.data
}

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
  ],
  pages: {
    signIn: '/auth/login',
    error: '/error/not-authorized',
  },
  callbacks: {
    jwt({ token, user, account }) {
      /*
       * For adding custom parameters to user in session, we first need to add those parameters
       * in token which then will be available in the `session()` callback
       */
      if (user?.id) {
        token.id = user.id
        token.email = user.email!
        token.phone = user.phone!
        token.avatar_url = user.avatar_url || (token.image || token.picture) as string
        token.provider = account?.provider || 'credentials'
      }

      return token
    },
    async session({ session, token }) {
      const storage = useStorage('mongodb')

      let cachedSession = null
      let sessionKey = ''

      if (token.id) {
        sessionKey = getStorageSessionKey(token.id)

        cachedSession = await storage.getItem<Session | null>(sessionKey)
      }

      if (!cachedSession?.user?.id) {
        let loggedInUser = await getUser(token)

        if (!loggedInUser) {
          await createSysUser(token)

          loggedInUser = await getUser(token)
        }

        cachedSession = {
          ...session,
          user: loggedInUser as any,
        }

        if (sessionKey && cachedSession)
          storage.setItem(sessionKey, cachedSession)
      }

      return cachedSession
    },
  },
  events: {
    async signOut({ token }) {
      const storage = useStorage('mongodb')
      const sessionKey = getStorageSessionKey(token.email)

      await storage.removeItem(sessionKey)
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
