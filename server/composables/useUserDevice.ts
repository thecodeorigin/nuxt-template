import { and, eq } from 'drizzle-orm'
import { deviceTable } from '@base/server/db/schemas'

export function useUserDevice() {
  async function getUserDeviceTokens(userId: string) {
    return db.query.deviceTable.findMany({
      where(schema, { eq }) {
        return eq(schema.user_id, userId)
      },
    })
  }

  function getUserDeviceToken(userId: string, deviceToken: string) {
    return db.query.deviceTable.findFirst({
      where(schema, { eq }) {
        return eq(schema.token_device, deviceToken)
      },
    })
  }

  function createUserDeviceToken(userId: string, deviceToken: string) {
    return db.insert(deviceTable).values({
      user_id: userId,
      token_device: deviceToken,
    }).returning()
  }

  function deleteUserDeviceToken(userId: string, deviceToken: string) {
    return db.delete(deviceTable).where(
      and(
        eq(deviceTable.user_id, userId),
        eq(deviceTable.token_device, deviceToken),
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
