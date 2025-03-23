import { and, eq } from 'drizzle-orm'
import { userDeviceTable } from '@base/server/db/schemas'

export function useUserDevice() {
  async function getUserDeviceTokens(userId: string) {
    return db.query.userDeviceTable.findMany({
      where(schema, { eq }) {
        return eq(schema.user_id, userId)
      },
    })
  }

  function getUserDeviceToken(userId: string, deviceToken: string) {
    return db.query.userDeviceTable.findFirst({
      where(schema, { eq }) {
        return eq(schema.token_device, deviceToken)
      },
    })
  }

  function createUserDeviceToken(userId: string, deviceToken: string) {
    return db.insert(userDeviceTable).values({
      user_id: userId,
      token_device: deviceToken,
    }).returning()
  }

  function deleteUserDeviceToken(userId: string, deviceToken: string) {
    return db.delete(userDeviceTable).where(
      and(
        eq(userDeviceTable.user_id, userId),
        eq(userDeviceTable.token_device, deviceToken),
      ),
    )
  }

  return {
    getUserDeviceToken,
    getUserDeviceTokens,
    createUserDeviceToken,
    deleteUserDeviceToken,
  }
}
