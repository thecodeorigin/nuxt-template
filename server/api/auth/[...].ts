import { NuxtAuthHandler } from '#auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
// import GithubProvider from 'next-auth/providers/github'
import type { NuxtError } from 'nuxt/app'

// import GoogleProvider from 'next-auth/providers/google'

// const runtimeConfig = useRuntimeConfig()

export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET,
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {}, // Object is required but can be left empty.
      async authorize(credentials: any) {
        const { user } = await $fetch<any>(`${process.env.NUXT_PUBLIC_API_BASE_URL}/auth/login/`, {
          method: 'POST',
          body: JSON.stringify(credentials),
        }).catch((err: NuxtError) => {
          throw createError({
            statusCode: err.statusCode || 403,
            statusMessage: JSON.stringify(err.data),
          })
        })

        return user || null
      },
    }),
    // @ts-expect-error
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  pages: {
    signIn: '/auth/login',
    error: '/not-authorized'
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      /*
       * For adding custom parameters to user in session, we first need to add those parameters
       * in token which then will be available in the `session()` callback
       */
      if (user) {
        const { data } = await supabaseAdmin.from('sys_users').select().eq('email', user.email!).maybeSingle()

        if (data)
          Object.assign(token, data)
      }

      return token
    },
    async session({ token, session }) {
      if (session.user) {
        const { data } = await supabaseAdmin.from('sys_users').select().eq('email', session.user.email!).maybeSingle()

        if (data)
          Object.assign(session.user, data)
      }

      return session
    },
    async signIn({ account, profile }) {
      if (profile && account?.provider === "google") {
        const { data } = await supabaseAdmin.auth.signInWithIdToken({
          provider: 'google',
          token: account.id_token!,
          access_token: account.access_token!,
        })

        if (data.user) {
          const { data: signedInUser, error } = await supabaseAdmin.from('sys_users').upsert({
            id: data.user.id,
            email: data.user.email!,
            phone: '',
            full_name: data.user?.user_metadata.name,
            avatar_url: data.user?.user_metadata.avatar_url,
            payment_method: {},
            billing_address: {},
          }).select().maybeSingle()

          console.log(signedInUser, error)

          return Boolean(signedInUser)
        }

        return false
      }

      return true // Do different verification for other providers that don't have `email_verified`
    },
  },
  cookies: {
    sessionToken: {
      name: 'nuxt-session-token',
      options: { maxAge: Number(process.env.AUTH_MAX_AGES) || 60 * 60 * 24 * 30},
    },
    callbackUrl: {
      name: 'nuxt-callback-url',
      options: { maxAge: Number(process.env.AUTH_MAX_AGES) || 60 * 60 * 24 * 30},
    },
    csrfToken: {
      name: 'nuxt-csrf-token',
      options: { maxAge: Number(process.env.AUTH_MAX_AGES) || 60 * 60 * 24 * 30},
    },
  }
})
