import type { Session, User } from 'next-auth'
import { useUserCrud } from '@base/server/composables/useUserCrud'
import { useRoleCrud } from '@base/server/composables/useRoleCrud'
import type { LoggedInUser } from '../../../next-auth'

async function _getUser(session: Session) {
  const { getUser: getUserByKey } = useUserCrud()

  let user: LoggedInUser | null | undefined = null

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
      statusCode: 401,
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
