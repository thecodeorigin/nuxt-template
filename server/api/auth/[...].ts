import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
// import GithubProvider from 'next-auth/providers/github'
import { NuxtAuthHandler } from '#auth'

const runtimeConfig = useRuntimeConfig()

export default NuxtAuthHandler({
  secret: runtimeConfig.AUTH_SECRET,
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {}, // Object is required but can be left empty.
      async authorize(credentials: any) {
        try {
          const response = await $fetch(`${process.env.NUXT_PUBLIC_API_BASE_URL}/auth/login/`, {
            method: 'POST',
            body: JSON.stringify(credentials),
          })

          return response
        }
        catch (error: any) {
          throw createError({
            statusCode: error.statusCode || 403,
            statusMessage: JSON.stringify(error.data),
          })
        }
      },
    }),
    // @ts-expect-error
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/error/not-authorized',
  },
  callbacks: {
    jwt({ token, user }) {
      /*
       * For adding custom parameters to user in session, we first need to add those parameters
       * in token which then will be available in the `session()` callback
       */
      if (user?.email || user?.phone)
        Object.assign(token, user)

      return token
    },
    async session({ session, token }) {
      if (session.user)
        Object.assign(session.user, token)

      return session
    },
  },
  // events: {
  //   async signOut({ token }) {
  //     const storage = useStorage('redis')
  //     const sessionKey = getStorageSessionKey(token.id)

  //     await storage.removeItem(sessionKey)
  //   },
  // },
  session: {
    strategy: 'jwt',
  },
  cookies: {
    sessionToken: {
      name: 'nuxt-session-token',
      options: { maxAge: Number(process.env.AUTH_MAX_AGES) || 60 * 60 * 24 * 30 },
    },
    callbackUrl: {
      name: 'nuxt-callback-url',
      options: { maxAge: Number(process.env.AUTH_MAX_AGES) || 60 * 60 * 24 * 30 },
    },
    csrfToken: {
      name: 'nuxt-csrf-token',
      options: { maxAge: Number(process.env.AUTH_MAX_AGES) || 60 * 60 * 24 * 30 },
    },
  },
})
