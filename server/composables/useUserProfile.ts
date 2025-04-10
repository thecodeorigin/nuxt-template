import { eq } from 'drizzle-orm'
import { userProfileTable } from '../db/schemas'

export function useUserProfile() {
  function getUserProfileById(userId: string) {
    return db.query.userProfileTable.findFirst({
      where(schema, { eq }) {
        return eq(schema.user_id, userId)
      },
    })
  }

  async function getUserCreditById(userId: string) {
    const userProfile = await getUserProfileById(userId)

    return Number(
      userProfile?.credit || (await getLogtoUserCustomData(userId)).credit || 0,
    )
  }

  async function createUserProfile(userId: string, payload: Partial<{
    email: string
    facebook: string
    zalo: string
    credit: string
  }>) {
    return (
      await db.insert(userProfileTable).values({
        user_id: userId,
        ...payload,
      }).returning()
    )[0]
  }

  function upsertUserProfile(userId: string, payload: Partial<{
    email: string
    facebook: string
    zalo: string
    credit: string
  }>) {
    return db.transaction(async (tx) => {
      const userProfile = await tx.query.userProfileTable.findFirst({
        where(schema, { eq }) {
          return eq(schema.user_id, userId)
        },
      })

      if (!userProfile)
        return createUserProfile(userId, payload)

      return (
        await tx.update(userProfileTable)
          .set(payload)
          .where(eq(userProfileTable.user_id, userId))
          .returning()
      )[0]
    })
  }

  return {
    getUserProfileById,
    getUserCreditById,
    createUserProfile,
    upsertUserProfile,
  }
}
