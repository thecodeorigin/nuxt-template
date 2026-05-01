import { and, eq } from 'drizzle-orm'
import { ActivityAction, activityTable, identityTable, userTable } from '~~/server/db/pg/schema'
import { getPgClient } from '~~/server/utils/pg'
import { simplifyNanoId } from '~~/shared/utils/id'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const code = query.code as string
  const state = query.state as string
  const storedState = getCookie(event, 'github_oauth_state')

  if (!code || !state || state !== storedState) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid state or code',
    })
  }

  // Clear state cookie
  deleteCookie(event, 'github_oauth_state')

  // Exchange code for access token
  const tokenResponse = await $fetch<{ access_token: string }>('https://github.com/login/oauth/access_token', {
    method: 'POST',
    body: {
      client_id: config.githubClientId,
      client_secret: config.githubClientSecret,
      code,
    },
    headers: {
      Accept: 'application/json',
    },
  })

  if (!tokenResponse.access_token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to retrieve access token',
    })
  }

  // Fetch user profile
  const userProfile = await $fetch<any>('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokenResponse.access_token}`,
    },
  })

  // Fetch user emails (to get primary email if not public)
  const emails = await $fetch<any[]>('https://api.github.com/user/emails', {
    headers: {
      Authorization: `Bearer ${tokenResponse.access_token}`,
    },
  })

  const primaryEmail = emails.find((e: any) => e.primary && e.verified)?.email || userProfile.email

  if (!primaryEmail) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No verified email found',
    })
  }

  const db = getPgClient()
  const now = new Date()

  // 1. Check if user exists by email
  const existingUsers = await db.select().from(userTable).where(eq(userTable.primary_email, primaryEmail)).limit(1)
  let user = existingUsers[0]

  if (!user) {
    // Create new user
    const [newUser] = await db.insert(userTable).values({
      primary_email: primaryEmail,
      name: userProfile.name || userProfile.login,
      avatar: userProfile.avatar_url,
      username: userProfile.login,
      last_sign_in_at: now,
    }).returning()
    user = newUser!

    await db.insert(activityTable).values({ user_id: user.id, action: ActivityAction.SIGN_UP })
  }
  else {
    // Update existing user
    const [updatedUser] = await db.update(userTable)
      .set({
        name: userProfile.name || userProfile.login || user.name,
        avatar: userProfile.avatar_url || user.avatar,
        last_sign_in_at: now,
        updated_at: now,
      })
      .where(eq(userTable.id, user.id))
      .returning()
    user = updatedUser!
  }

  // 2. Handle Identity
  const providerUserId = String(userProfile.id)
  const existingIdentity = await db.select()
    .from(identityTable)
    .where(and(
      eq(identityTable.provider, 'github'),
      eq(identityTable.provider_user_id, providerUserId),
    ))
    .limit(1)

  if (existingIdentity.length === 0) {
    await db.insert(identityTable).values({
      user_id: user.id,
      provider: 'github',
      provider_user_id: providerUserId,
      provider_data: userProfile,
    })
  }
  else {
    await db.update(identityTable)
      .set({
        provider_data: userProfile,
        updated_at: now,
      })
      .where(eq(identityTable.id, existingIdentity[0]!.id))
  }

  // Create session
  const sessionId = simplifyNanoId()
  const storage = useStorage('redis')

  await storage.setItem(`session:${sessionId}`, {
    id: user.id,
    primary_email: user.primary_email,
    primary_phone: user.primary_phone,
    username: user.username,
    name: user.name,
    avatar: user.avatar,
    verified: user.verified,
    provider: 'github',
  })

  setCookie(event, 'sessionid', sessionId, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  await db.insert(activityTable).values({ user_id: user.id, action: ActivityAction.SIGN_IN })

  return sendRedirect(event, '/dashboard')
})
