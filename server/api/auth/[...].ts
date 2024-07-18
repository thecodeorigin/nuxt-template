import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
// import GithubProvider from 'next-auth/providers/github'
import type { NuxtError } from 'nuxt/app'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { NuxtAuthHandler } from '#auth'
import type { Tables } from '~/server/types/supabase'

type User = Tables<'sys_users'>

const runtimeConfig = useRuntimeConfig()

async function createOrUpdateUser(user: SupabaseUser) {
  const { data: editorRole } = await supabaseAdmin.from('sys_roles').select().eq('name', 'Editor').maybeSingle()

  if (!editorRole)
    return false

  const { error } = await supabaseAdmin.from('sys_users').upsert({
    id: user.id,
    email: user.email!,
    phone: '',
    full_name: user?.user_metadata.name,
    avatar_url: user?.user_metadata.avatar_url,
    language: '',
    country: '',
    city: '',
    postcode: '',
    address: '',
    organization: '',
    role_id: editorRole.id,
  })

  if (error) {
    console.error(error)

    return false
  }

  return true
}

export default NuxtAuthHandler({
  secret: runtimeConfig.AUTH_SECRET,
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {}, // Object is required but can be left empty.
      async authorize(credentials: any) {
        try {
          const response = await $fetch<User>(`${process.env.NUXT_PUBLIC_API_BASE_URL}/auth/login/`, {
            method: 'POST',
            body: JSON.stringify(credentials),
          })

          return {
            ...response,
            verified: true,
          }
        }
        catch {
          return {
            email: credentials.email,
            verified: false,
          }
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
    jwt({ token }) {
      return token
    },
    async session({ session }) {
      if (session.user) {
        const { data } = await supabaseAdmin.from('sys_users').select('*, role:sys_roles(*,permissions:sys_permissions(*))').eq('email', session.user.email!).maybeSingle()

        if (data)
          Object.assign(session.user, data)
      }

      return session
    },
    async signIn({ user, account, profile }) {
      if (profile && account?.provider === 'google') {
        const { data } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: account.id_token!,
          access_token: account.access_token!,
        })

        if (data.user)
          return await createOrUpdateUser(data.user)

        return false
      }
      else if (account?.provider === 'credentials') {
        if (user?.verified)
          return true
        else
          return `${process.env.NUXT_PUBLIC_APP_BASE_URL}/auth/confirmation?email=${user?.email}`
      }

      return true // Do different verification for other providers that don't have `email_verified`
    },
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
