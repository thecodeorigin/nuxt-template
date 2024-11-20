import type { Session, User } from 'next-auth'
import { useUser } from '@base/server/composables/useUser'
import type { LoggedInUser } from '../../../next-auth'

async function _getUser(session: Session) {
  const { getUser: getUserByKey } = useUser()

  let user: LoggedInUser | null | undefined = null

  if (session.user.email)
    user = (await getUserByKey('email', session.user.email)).data
  else if (session.user.phone)
    user = (await getUserByKey('phone', session.user.phone)).data

  return user
}

export async function getUserBySession(session: Session) {
  const user = await tryWithCache(
    getStorageSessionKey(session.user.providerAccountId),
    () => _getUser(session),
  )

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: ErrorMessage.UNAUTHORIZED,
    })
  }

  return user
}
