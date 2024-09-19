import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'
import FacebookProvider from 'next-auth/providers/facebook'
import { eq, or } from 'drizzle-orm'
import type { Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import { NuxtAuthHandler } from '#auth'
import type { LoggedInUser } from '@/next-auth'
import { sysUserTable } from '~/server/db/schemas/sys_users.schema'
import { sysRoleTable } from '~/server/db/schemas/sys_roles.schema'
import { useRoleCrud } from '~/server/composables/useRoleCrud'
import { useUserCrud } from '~/server/composables/useUserCrud'
import { useCategoryCrud } from '~/server/composables/useCategoryCrud'
import { useShortcutCrud } from '~/server/composables/useShortcutCrud'

const runtimeConfig = useRuntimeConfig()

async function getUser(token: JWT) {
  const conditions = []

  if (token.email)
    conditions.push(eq(sysUserTable.email, token.email))
  else if (token.phone)
    conditions.push(eq(sysUserTable.phone, token.phone))
  else if (token.id)
    conditions.push(eq(sysUserTable.id, token.id))

  const sysUser = (await db.select().from(sysUserTable)
    .where(
      or(...conditions),
    )
    .limit(1))[0]

  if (sysUser)
    return omit(sysUser, ['password'])
  return null
}

async function createSysUser(token: JWT) {
  const { getRoleByName } = useRoleCrud()

  const editorRole = await getRoleByName('Editor')

  if (!editorRole.data?.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Cannot sign up user!',
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
    role_id: editorRole.data.id,
  })

  const { createCategory } = useCategoryCrud({ user_id: sysUser.data.id })

  const { createShortcut } = useShortcutCrud(sysUser.data.id)

  await Promise.all([
    createCategory({
      name: 'Uncategorized',
      slug: `uncategorized-${Date.now()}`,
    }),
    createShortcut({
      route: '/projects',
      user_id: sysUser.data.id,
    }),
    createShortcut({
      route: '/dashboard',
      user_id: sysUser.data.id,
    }),
  ])

  return sysUser.data
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
          const response = await $fetch<{ data: LoggedInUser }>(`${process.env.NUXT_PUBLIC_API_BASE_URL}/auth/login/`, {
            method: 'POST',
            body: JSON.stringify(credentials),
          })

          return response.data
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
      const storage = useStorage('redis')

      const sessionKey = getStorageSessionKey(token.email)

      let cachedSession = await storage.getItem<Session | null>(sessionKey)

      if (!cachedSession?.user?.id) {
        let loggedInUser = await getUser(token)

        if (!loggedInUser)
          loggedInUser = await createSysUser(token)

        cachedSession = {
          ...session,
          user: loggedInUser,
        }

        storage.setItem(sessionKey, cachedSession)
      }

      return cachedSession
    },
  },
  events: {
    async signOut({ token }) {
      const storage = useStorage('redis')
      const sessionKey = getStorageSessionKey(token.email)

      await storage.removeItem(sessionKey)
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
