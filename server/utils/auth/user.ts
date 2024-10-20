import type { Session, User } from 'next-auth'
import { useUserCrud } from '@base/server/composables/useUserCrud'
import { useRoleCrud } from '@base/server/composables/useRoleCrud'
import type { LoggedInUser } from '../../../next-auth'

async function _getUser(session: Session) {
  const { getUser: getUserByKey } = useUserCrud()

  let user: LoggedInUser | null = null

  if (session.user.email)
    user = (await getUserByKey('email', session.user.email)).data
  else if (session.user.phone)
    user = (await getUserByKey('phone', session.user.phone)).data

  return user
}

async function _createUser(session: Session) {
  const { getRoleByName } = useRoleCrud()

  const userRole = await getRoleByName('User')

  if (!userRole.data?.id) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessage.CANNOT_FIND_ROLE,
    })
  }

  const { createUser } = useUserCrud()

  await createUser({
    email: session.user.email || '',
    phone: session.user.phone || '',
    password: '',
    language: '',
    country: '',
    city: '',
    postcode: '',
    address: '',
    organization: '',
    role_id: userRole.data.id,
  })
}

export async function getUserBySession(session: Session) {
  const storage = useStorage('mongodb')

  let cachedUser = null
  let sessionKey = ''

  if (session.user?.providerAccountId) {
    sessionKey = getStorageSessionKey(session.user.providerAccountId)
    cachedUser = await storage.getItem<LoggedInUser | null>(sessionKey)
  }

  if (cachedUser)
    return cachedUser

  let user: LoggedInUser | null = await _getUser(session)

  if (!user && session.user.provider !== 'credentials') {
    await _createUser(session)

    user = await _getUser(session)
  }

  await storage.setItem(sessionKey, user)

  return user
}
