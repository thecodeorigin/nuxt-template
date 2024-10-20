import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'
import FacebookProvider from 'next-auth/providers/facebook'
import type { LoggedInUser } from '../../../next-auth'
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
  ],
  pages: {
    signIn: '/auth/login',
    error: '/error/not-authorized',
  },
  callbacks: {
    jwt({ token, user, account }) {
      if (account?.providerAccountId) {
        token.providerAccountId = account?.providerAccountId || user.id
        token.email = user.email!
        token.phone = user.phone!
        token.provider = account?.provider || 'credentials'
      }

      if (account?.provider !== 'credentials') {
        // token.accessToken = account?.access_token // TODO: add database adapter
      }

      return token
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          providerAccountId: token.providerAccountId,
          email: token.email,
          phone: token.phone,
          provider: token.provider,
          // accessToken: token.accessToken,
        },
      }
    },
  },
  events: {
    async signOut({ token }) {
      if (token.providerAccountId) {
        const storage = useStorage('mongodb')
        const sessionKey = getStorageSessionKey(token.providerAccountId)

        await storage.removeItem(sessionKey)
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
